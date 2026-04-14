namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.DTOs;
    using SpotTheTop.Core.DTOs.Players;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;
    using System.Security.Claims;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class PlayersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PlayersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetApprovedPlayers([FromQuery] int? teamId, [FromQuery] int? leagueId, [FromQuery] int? seasonId)
        {
            var query = _context.Players
                .Include(p => p.Position)
                .Include(p => p.Team)
                .Include(p => p.Appearances)
                    .ThenInclude(a => a.Match) 
                .Where(p => p.IsApproved == true);

            if (teamId.HasValue) query = query.Where(p => p.TeamId == teamId.Value);
            if (leagueId.HasValue) query = query.Where(p => p.Team != null && p.Team.LeagueId == leagueId.Value);

            var players = await query
                .Select(p => new PlayerResponseDto
                {
                    Id = p.Id,
                    FullName = $"{p.FirstName} {p.LastName}",
                    Age = DateTime.Now.Year - p.DateOfBirth.Year,
                    Position = p.Position.Name,
                    TeamId = p.TeamId,
                    TeamName = p.Team != null ? p.Team.Name : "Free Agent",
                    IsApproved = p.IsApproved,
                    AddedBy = p.AddedByUserId,
                    HeightCm = p.HeightCm,
                    PreferredFoot = p.PreferredFoot,

 
                    MatchesPlayed = p.Appearances.Count(a => !seasonId.HasValue || a.Match.SeasonId == seasonId.Value),
                    MinutesPlayed = p.Appearances.Where(a => !seasonId.HasValue || a.Match.SeasonId == seasonId.Value).Sum(a => (int?)a.MinutesPlayed) ?? 0,
                    TotalGoals = p.Appearances.Where(a => !seasonId.HasValue || a.Match.SeasonId == seasonId.Value).Sum(a => (int?)a.Goals) ?? 0,
                    TotalAssists = p.Appearances.Where(a => !seasonId.HasValue || a.Match.SeasonId == seasonId.Value).Sum(a => (int?)a.Assists) ?? 0,
                    TotalYellowCards = p.Appearances.Where(a => !seasonId.HasValue || a.Match.SeasonId == seasonId.Value).Sum(a => (int?)a.YellowCards) ?? 0,
                    TotalRedCards = p.Appearances.Count(a => (!seasonId.HasValue || a.Match.SeasonId == seasonId.Value) && a.IsRedCard)
                })
                .OrderByDescending(p => p.TotalGoals)
                .ToListAsync();

            return Ok(players);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Scout")]
        public async Task<IActionResult> AddPlayer([FromBody] PlayerCreateDto dto)
        {
            var currentUserEmail = User.FindFirstValue(ClaimTypes.Name) ?? "Unknown";
            bool isAdmin = User.IsInRole("Admin");

            var newPlayer = new Player
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                DateOfBirth = dto.DateOfBirth,

                PositionId = dto.PositionId,
                TeamId = dto.TeamId,

                AddedByUserId = currentUserEmail,
                IsApproved = isAdmin
            };

            _context.Players.Add(newPlayer);
            await _context.SaveChangesAsync();

            if (isAdmin)
                return Ok($"Играчът е добавен и директно одобрен от Админ!");
            else
                return Ok($"Скауте, играчът е добавен успешно, но чака одобрение от Админ!");
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingPlayers()
        {
            var pendingPlayers = await _context.Players
                .Where(p => p.IsApproved == false)
                .Select(p => new PlayerResponseDto
                {
                    Id = p.Id,
                    FullName = $"{p.FirstName} {p.LastName}",

                    Position = p.Position.Name,

                    IsApproved = p.IsApproved,
                    AddedBy = p.AddedByUserId
                })
                .ToListAsync();

            return Ok(pendingPlayers);
        }

        [HttpPatch("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApprovePlayer(int id)
        {
            var player = await _context.Players.FindAsync(id);
            if (player == null) return NotFound("Играчът не е намерен.");

            if (player.IsApproved) return BadRequest("Този играч вече е одобрен.");

            player.IsApproved = true;
            await _context.SaveChangesAsync();

            return Ok($"Играч {player.FirstName} {player.LastName} беше успешно одобрен!");
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPlayerDetails(int id)
        {
            var player = await _context.Players
                .Include(p => p.Position)
                .Include(p => p.Team)
                    .ThenInclude(t => t.League)
                .Include(p => p.Appearances) // НОВО: Трябват ни участията, за да смятаме статистиката
                .FirstOrDefaultAsync(p => p.Id == id);

            if (player == null) return NotFound("Player not found.");

            if (!player.IsApproved)
            {
                var currentUserEmail = User.FindFirstValue(ClaimTypes.Name);
                if (!User.IsInRole("Admin") && !User.IsInRole("SuperAdmin") && !User.IsInRole("Moderator") && player.AddedByUserId != currentUserEmail)
                {
                    return Forbid();
                }
            }

            var apps = player.Appearances.ToList();

            var dto = new PlayerDetailsDto
            {
                Id = player.Id,
                FirstName = player.FirstName,
                LastName = player.LastName,
                Age = DateTime.Now.Year - player.DateOfBirth.Year,
                DateOfBirthFormatted = player.DateOfBirth.ToString("dd MMM yyyy"),
                PositionName = player.Position.Name,
                PositionCategory = player.Position.Category,
                TeamName = player.Team?.Name ?? "Free Agent",
                LeagueName = player.Team?.League?.Name,
                HeightCm = player.HeightCm,
                WeightKg = player.WeightKg,
                PreferredFoot = player.PreferredFoot,
                Nationality = player.Nationality,
                MarketValueEuro = player.MarketValueEuro,

                TotalMatchesPlayed = apps.Count,
                TotalMinutesPlayed = apps.Sum(a => a.MinutesPlayed),
                TotalGoals = apps.Sum(a => a.Goals),
                TotalAssists = apps.Sum(a => a.Assists),
                TotalYellowCards = apps.Sum(a => a.YellowCards),
                TotalRedCards = apps.Count(a => a.IsRedCard),

                TotalShots = apps.Any(a => a.Shots != null) ? apps.Sum(a => a.Shots ?? 0) : null,
                TotalShotsOnTarget = apps.Any(a => a.ShotsOnTarget != null) ? apps.Sum(a => a.ShotsOnTarget ?? 0) : null,
                TotalChancesCreated = apps.Any(a => a.ChancesCreated != null) ? apps.Sum(a => a.ChancesCreated ?? 0) : null,
                TotalDribblesCompleted = apps.Any(a => a.DribblesCompleted != null) ? apps.Sum(a => a.DribblesCompleted ?? 0) : null,
                TotalPassesCompleted = apps.Any(a => a.PassesCompleted != null) ? apps.Sum(a => a.PassesCompleted ?? 0) : null,
                AveragePassAccuracy = apps.Any(a => a.PassAccuracyPercent != null) ? (int)apps.Where(a => a.PassAccuracyPercent.HasValue).Average(a => a.PassAccuracyPercent.Value) : null,
                TotalTacklesWon = apps.Any(a => a.TacklesWon != null) ? apps.Sum(a => a.TacklesWon ?? 0) : null,
                TotalInterceptions = apps.Any(a => a.Interceptions != null) ? apps.Sum(a => a.Interceptions ?? 0) : null,
                TotalClearances = apps.Any(a => a.Clearances != null) ? apps.Sum(a => a.Clearances ?? 0) : null,
                TotalCleanSheets = apps.Any(a => a.IsCleanSheet) ? apps.Count(a => a.IsCleanSheet) : null,
                TotalSaves = apps.Any(a => a.Saves != null) ? apps.Sum(a => a.Saves ?? 0) : null
            };

            return Ok(dto);
        }

        [HttpGet("unclaimed")]
        [AllowAnonymous] 
        public async Task<IActionResult> GetUnclaimedPlayers()
        {
            var players = await _context.Players
                .Include(p => p.Position)
                .Where(p => p.IsApproved == true && p.ClaimedByUserId == null)
                .Select(p => new
                {
                    Id = p.Id,
                    FullName = $"{p.FirstName} {p.LastName} ({p.Position.Abbreviation})"
                })
                .ToListAsync();

            return Ok(players);
        }

        [HttpPost("bulk")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> ImportPlayers([FromBody] List<PlayerCreateDto> dtos)
        {
            if (dtos == null || !dtos.Any()) return BadRequest("No data received.");

            var currentUserEmail = User.FindFirstValue(ClaimTypes.Name) ?? "System";

            var players = dtos.Select(d => new SpotTheTop.Core.Models.Player
            {
                FirstName = d.FirstName,
                LastName = d.LastName,
                DateOfBirth = d.DateOfBirth,
                PositionId = d.PositionId,
                TeamId = d.TeamId,
                AddedByUserId = currentUserEmail,
                IsApproved = true
            }).ToList();

            await _context.Players.AddRangeAsync(players);
            await _context.SaveChangesAsync();

            return Ok($"{players.Count} players imported successfully!");
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> DeletePlayer(int id)
        {
            var player = await _context.Players.FindAsync(id);
            if (player == null) return NotFound("Player not found.");

            try
            {
                _context.Players.Remove(player);
                await _context.SaveChangesAsync();
                return Ok("Player deleted successfully!");
            }
            catch (DbUpdateException)
            {
                return BadRequest("Cannot delete this Player because they have recorded match appearances.");
            }
        }
    }
}
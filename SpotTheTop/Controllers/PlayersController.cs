namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.DTOs;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;
    using System.Security.Claims;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Заключваме целия контролер по подразбиране
    public class PlayersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PlayersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous] // Оставяме го достъпен, за да се виждат класациите и без логин
        public async Task<IActionResult> GetApprovedPlayers([FromQuery] int? teamId, [FromQuery] int? leagueId)
        {
            var query = _context.Players
                .Include(p => p.Position)
                .Include(p => p.Team)
                .Include(p => p.Appearances) // НОВО: Включваме участията в мачове, за да сметнем статистиката
                .Where(p => p.IsApproved == true);

            // Филтър по конкретен отбор
            if (teamId.HasValue)
            {
                query = query.Where(p => p.TeamId == teamId.Value);
            }

            // Филтър по лига (взимаме всички играчи, чийто отбор е в тази лига)
            if (leagueId.HasValue)
            {
                query = query.Where(p => p.Team != null && p.Team.LeagueId == leagueId.Value);
            }

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

                    TotalGoals = p.Appearances.Sum(a => (int?)a.Goals) ?? 0,
                    TotalAssists = p.Appearances.Sum(a => (int?)a.Assists) ?? 0,

                    HeightCm = p.HeightCm,
                    PreferredFoot = p.PreferredFoot
                })
                .OrderByDescending(p => p.TotalGoals)
                .ToListAsync();

            return Ok(players);
        }

        // 2. ДОБАВЯНЕ НА ИГРАЧ
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

                // ТУК Е ПРОМЯНАТА: Записваме директно ID-тата
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

        // 3. СПИСЪК С ЧАКАЩИ ИГРАЧИ (Само за Админ)
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

                    // ТУК СЪЩО ОПРАВЯМЕ ПОЗИЦИЯТА
                    Position = p.Position.Name,

                    IsApproved = p.IsApproved,
                    AddedBy = p.AddedByUserId
                })
                .ToListAsync();

            return Ok(pendingPlayers);
        }

        // 4. ОДОБРЯВАНЕ НА ИГРАЧ (Само за Админ)
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

        // 1.5 Вземи ДЕТАЙЛИ за конкретен играч
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPlayerDetails(int id)
        {
            var player = await _context.Players
                .Include(p => p.Position)
                .Include(p => p.Team)
                    .ThenInclude(t => t.League)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (player == null) return NotFound("Player not found.");

            // Ако играчът не е одобрен, само Админ/Модератор или този, който го е добавил, може да го види
            if (!player.IsApproved)
            {
                var currentUserEmail = User.FindFirstValue(ClaimTypes.Name);
                if (!User.IsInRole("Admin") && !User.IsInRole("SuperAdmin") && !User.IsInRole("Moderator") && player.AddedByUserId != currentUserEmail)
                {
                    return Forbid();
                }
            }

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
                LeagueName = player.Team?.League?.Name
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
    }
}
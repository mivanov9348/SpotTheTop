namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.DTOs.Teams;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;
    using System.Security.Claims;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TeamsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TeamsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetTeams([FromQuery] int? leagueId)
        {
            var query = _context.Teams.Where(t => t.IsApproved);

            if (leagueId.HasValue)
            {
                query = query.Where(t => t.LeagueId == leagueId.Value);
            }

            var teams = await query
                .Select(t => new {
                    t.Id,
                    t.Name,
                    t.City,
                    t.Stadium,
                    LeagueName = t.League.Name,
                    t.LeagueId
                })
                .ToListAsync();

            return Ok(teams);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTeamDetails(int id)
        {
            var team = await _context.Teams
                .Include(t => t.League)
                .Where(t => t.Id == id)
                .Select(t => new {
                    t.Id,
                    t.Name,
                    t.City,
                    t.Stadium,
                    LeagueName = t.League.Name
                })
                .FirstOrDefaultAsync();

            if (team == null) return NotFound("Team not found.");
            return Ok(team);
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> AddTeam([FromBody] TeamCreateDto dto)
        {
            var leagueExists = await _context.Leagues.AnyAsync(l => l.Id == dto.LeagueId);
            if (!leagueExists) return BadRequest("Invalid League ID.");

            var currentUserEmail = User.FindFirstValue(ClaimTypes.Name) ?? "System";

            var team = new Team
            {
                Name = dto.Name,
                City = dto.City,
                Stadium = dto.Stadium,
                LeagueId = dto.LeagueId,
                IsApproved = true,
                ManagerUserId = currentUserEmail
            };

            _context.Teams.Add(team);
            await _context.SaveChangesAsync();

            return Ok($"Team '{team.Name}' added successfully!");
        }

        [HttpPost("bulk")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> ImportTeams([FromBody] List<TeamCreateDto> dtos)
        {
            if (dtos == null || !dtos.Any()) return BadRequest("No data received.");

            var currentUserEmail = User.FindFirstValue(ClaimTypes.Name) ?? "System";

            var teams = dtos.Select(d => new SpotTheTop.Core.Models.Team
            {
                Name = d.Name,
                City = d.City,
                Stadium = d.Stadium,
                LeagueId = d.LeagueId,
                IsApproved = true,
                ManagerUserId = currentUserEmail
            }).ToList();

            await _context.Teams.AddRangeAsync(teams);
            await _context.SaveChangesAsync();

            return Ok($"{teams.Count} teams imported successfully!");
        }
    }
}
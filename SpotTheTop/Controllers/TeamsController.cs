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

        // НОВО: Добавяне на Отбор
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
    }
}
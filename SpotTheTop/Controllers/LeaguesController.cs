namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.DTOs;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LeaguesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LeaguesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetLeagues()
        {
            var leagues = await _context.Leagues
                .Select(l => new { l.Id, l.Name, l.Country })
                .ToListAsync();

            return Ok(leagues);
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> AddLeague([FromBody] LeagueCreateDto dto)
        {
            var league = new League
            {
                Name = dto.Name,
                Country = dto.Country
            };

            _context.Leagues.Add(league);
            await _context.SaveChangesAsync();

            return Ok($"League '{league.Name}' added successfully!");
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLeagueDetails(int id)
        {
            var league = await _context.Leagues
                .Where(l => l.Id == id)
                .Select(l => new
                {
                    l.Id,
                    l.Name,
                    l.Country,
                    TeamsCount = l.Teams.Count
                })
                .FirstOrDefaultAsync();

            if (league == null) return NotFound("League not found.");

            return Ok(league);
        }

        [HttpPost("bulk")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> ImportLeagues([FromBody] List<LeagueCreateDto> dtos)
        {
            if (dtos == null || !dtos.Any()) return BadRequest("No data received.");

            var leagues = dtos.Select(d => new SpotTheTop.Core.Models.League { Name = d.Name, Country = d.Country }).ToList();

            await _context.Leagues.AddRangeAsync(leagues);
            await _context.SaveChangesAsync();

            return Ok($"{leagues.Count} leagues imported successfully!");
        }
    }
}
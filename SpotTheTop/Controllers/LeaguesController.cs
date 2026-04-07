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
    }
}
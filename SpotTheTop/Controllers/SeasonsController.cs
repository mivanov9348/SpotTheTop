namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.DTOs.Season;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;
    using System;
    using System.Linq;
    using System.Threading.Tasks;   

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SeasonsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SeasonsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetSeasons([FromQuery] int? leagueId)
        {
            var query = _context.Seasons.AsQueryable();

            if (leagueId.HasValue)
            {
                query = query.Where(s => s.LeagueId == leagueId.Value);
            }

            var seasons = await query
                .OrderByDescending(s => s.StartDate)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.LeagueId,
                    s.IsActive
                })
                .ToListAsync();

            return Ok(seasons);
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> AddSeason([FromBody] SeasonCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest("Season name is required.");

            // Ако новият сезон е активен, деактивираме всички останали за тази лига
            if (dto.IsActive)
            {
                var oldActiveSeasons = await _context.Seasons
                    .Where(s => s.LeagueId == dto.LeagueId && s.IsActive)
                    .ToListAsync();
                foreach (var old in oldActiveSeasons)
                {
                    old.IsActive = false;
                }
            }

            var newSeason = new Season
            {
                Name = dto.Name,
                LeagueId = dto.LeagueId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                IsActive = dto.IsActive
            };

            _context.Seasons.Add(newSeason);
            await _context.SaveChangesAsync();

            return Ok("Season created successfully!");
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> DeleteSeason(int id)
        {
            var season = await _context.Seasons.FindAsync(id);
            if (season == null) return NotFound("Season not found.");

            try
            {
                _context.Seasons.Remove(season);
                await _context.SaveChangesAsync();
                return Ok("Season deleted successfully!");
            }
            catch (DbUpdateException)
            {
                return BadRequest("Cannot delete this Season because it has scheduled matches or standings attached to it.");
            }
        }
    }
}
namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.DTOs.Season;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;
    using System.Collections.Generic;
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
            if (!dto.LeagueIds.Any()) return BadRequest("Изберете поне една лига.");

            foreach (var leagueId in dto.LeagueIds)
            {
                // 1. Деактивираме старите сезони за тази лига
                if (dto.IsActive)
                {
                    var activeSeasons = await _context.Seasons.Where(s => s.LeagueId == leagueId && s.IsActive).ToListAsync();
                    activeSeasons.ForEach(s => s.IsActive = false);
                }

                // 2. Създаваме новия сезон
                var newSeason = new Season
                {
                    Name = dto.Name,
                    LeagueId = leagueId,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    IsActive = dto.IsActive
                };
                _context.Seasons.Add(newSeason);
                await _context.SaveChangesAsync();

                // 3. Автоматично намираме всички отбори в тази лига и ги записваме в класирането (0 точки)
                var teamsInLeague = await _context.Teams.Where(t => t.LeagueId == leagueId && t.IsApproved).ToListAsync();
                var initialStandings = teamsInLeague.Select(t => new TeamSeasonStanding
                {
                    SeasonId = newSeason.Id,
                    LeagueId = leagueId,
                    TeamId = t.Id,
                    Points = 0,
                    Wins = 0,
                    Draws = 0,
                    Losses = 0,
                    GoalsFor = 0,
                    GoalsAgainst = 0,
                    MatchesPlayed = 0
                }).ToList();

                _context.TeamSeasonStandings.AddRange(initialStandings);
            }

            await _context.SaveChangesAsync();
            return Ok("Сезоните и класиранията бяха създадени автоматично!");
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
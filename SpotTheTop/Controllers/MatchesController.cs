namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.DTOs.Leagues;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin,Admin,Moderator")]
    public class MatchesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MatchesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. ВЗЕМАНЕ НА МАЧОВЕ (Достъпно за всички)
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetMatches([FromQuery] int leagueId, [FromQuery] int? seasonId, [FromQuery] int? round)
        {
            var season = seasonId.HasValue
                ? await _context.Seasons.FirstOrDefaultAsync(s => s.Id == seasonId.Value && s.LeagueId == leagueId)
                : await _context.Seasons.Where(s => s.LeagueId == leagueId && s.IsActive).OrderByDescending(s => s.StartDate).FirstOrDefaultAsync();

            if (season == null) return NotFound("No active season found.");

            var query = _context.Matches
                .Include(m => m.HomeTeam)
                .Include(m => m.AwayTeam)
                .Where(m => m.LeagueId == leagueId && m.SeasonId == season.Id);

            if (round.HasValue) query = query.Where(m => m.Round == round.Value);

            var matches = await query
                .OrderBy(m => m.MatchDate)
                .Select(m => new {
                    m.Id,
                    m.Round,
                    m.MatchDate,
                    m.HomeTeamId,
                    HomeTeamName = m.HomeTeam.Name,
                    m.AwayTeamId,
                    AwayTeamName = m.AwayTeam.Name,
                    m.HomeScore,
                    m.AwayScore,
                    m.Status
                })
                .ToListAsync();

            var availableRounds = await _context.Matches
                .Where(m => m.LeagueId == leagueId && m.SeasonId == season.Id)
                .Select(m => m.Round)
                .Distinct()
                .OrderBy(r => r)
                .ToListAsync();

            return Ok(new { SeasonId = season.Id, SeasonName = season.Name, Matches = matches, AvailableRounds = availableRounds });
        }

        // 2. ДОБАВЯНЕ НА МАЧ
        [HttpPost]
        public async Task<IActionResult> AddMatch([FromBody] MatchCreateDto dto)
        {
            if (dto.HomeTeamId == dto.AwayTeamId)
                return BadRequest("Home team and Away team cannot be the same.");

            var match = new Match
            {
                LeagueId = dto.LeagueId,
                SeasonId = dto.SeasonId,
                Round = dto.Round,
                HomeTeamId = dto.HomeTeamId,
                AwayTeamId = dto.AwayTeamId,
                MatchDate = dto.MatchDate,
                Status = "Scheduled"
            };

            _context.Matches.Add(match);
            await _context.SaveChangesAsync();

            return Ok("Match scheduled successfully!");
        }

        // 3. РЕДАКТИРАНЕ НА РЕЗУЛТАТ (Това се вика от зеленото тикче!)
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateMatchResult(int id, [FromBody] MatchUpdateDto dto)
        {
            var match = await _context.Matches.FindAsync(id);
            if (match == null) return NotFound("Match not found.");

            match.HomeScore = dto.HomeScore;
            match.AwayScore = dto.AwayScore;
            match.Status = dto.Status;

            await _context.SaveChangesAsync();
            return Ok();
        }

        // 4. ТРИЕНЕ НА МАЧ
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMatch(int id)
        {
            var match = await _context.Matches.FindAsync(id);
            if (match == null) return NotFound("Match not found.");

            try
            {
                _context.Matches.Remove(match);
                await _context.SaveChangesAsync();
                return Ok("Match deleted successfully!");
            }
            catch (DbUpdateException)
            {
                return BadRequest("Cannot delete this match because it has recorded appearances or stats.");
            }
        }

        // 5. BULK IMPORT
        [HttpPost("bulk")]
        public async Task<IActionResult> ImportMatches([FromBody] List<MatchCreateDto> dtos)
        {
            if (dtos == null || !dtos.Any()) return BadRequest("No data received.");

            var matches = dtos.Select(d => new Match
            {
                LeagueId = d.LeagueId,
                SeasonId = d.SeasonId,
                Round = d.Round,
                HomeTeamId = d.HomeTeamId,
                AwayTeamId = d.AwayTeamId,
                MatchDate = d.MatchDate,
                Status = "Scheduled"
            }).ToList();

            await _context.Matches.AddRangeAsync(matches);
            await _context.SaveChangesAsync();

            return Ok($"{matches.Count} matches imported successfully!");
        }
    }
}
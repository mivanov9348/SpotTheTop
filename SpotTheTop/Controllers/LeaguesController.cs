namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.DTOs;
    using SpotTheTop.Core.DTOs.Leagues;
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
                .Select(l => new {
                    l.Id,
                    l.Name,
                    l.Country,
                    TeamsCount = l.Teams.Count,
                    PlayersCount = l.Teams.SelectMany(t => t.Players).Count()
                })
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

        [HttpGet("{id}/standings")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLeagueStandings(int id, [FromQuery] int? seasonId)
        {
            var season = seasonId.HasValue
                ? await _context.Seasons.FirstOrDefaultAsync(s => s.Id == seasonId.Value && s.LeagueId == id)
                : await _context.Seasons.Where(s => s.LeagueId == id && s.IsActive)
                                        .OrderByDescending(s => s.StartDate)
                                        .FirstOrDefaultAsync();

            if (season == null)
                return NotFound("No active season found for this league.");

            var standings = await _context.TeamSeasonStandings
                .Include(ts => ts.Team)
                .Where(ts => ts.SeasonId == season.Id)
                .Select(ts => new StandingResponseDto 
                {
                    TeamId = ts.TeamId,
                    TeamName = ts.Team.Name,
                    MatchesPlayed = ts.MatchesPlayed,
                    Wins = ts.Wins,
                    Draws = ts.Draws,
                    Losses = ts.Losses,
                    GoalsFor = ts.GoalsFor,
                    GoalsAgainst = ts.GoalsAgainst,
                    GoalDifference = ts.GoalsFor - ts.GoalsAgainst,
                    Points = ts.Points
                })
                .OrderByDescending(ts => ts.Points)
                .ThenByDescending(ts => ts.GoalDifference)
                .ThenByDescending(ts => ts.GoalsFor)
                .ToListAsync();

            return Ok(new
            {
                SeasonId = season.Id,
                SeasonName = season.Name,
                Standings = standings
            });
        }

        [HttpGet("{id}/matches")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLeagueMatches(int id, [FromQuery] int? seasonId, [FromQuery] int? round)
        {
            var season = seasonId.HasValue
                ? await _context.Seasons.FirstOrDefaultAsync(s => s.Id == seasonId.Value && s.LeagueId == id)
                : await _context.Seasons.Where(s => s.LeagueId == id && s.IsActive).OrderByDescending(s => s.StartDate).FirstOrDefaultAsync();

            if (season == null) return NotFound("No active season found.");

            var query = _context.Matches
                .Include(m => m.HomeTeam)
                .Include(m => m.AwayTeam)
                .Where(m => m.LeagueId == id && m.SeasonId == season.Id);

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
                .Where(m => m.LeagueId == id && m.SeasonId == season.Id)
                .Select(m => m.Round)
                .Distinct()
                .OrderBy(r => r)
                .ToListAsync();

            return Ok(new { SeasonId = season.Id, SeasonName = season.Name, Matches = matches, AvailableRounds = availableRounds });
        }

        [HttpPatch("{leagueId}/matches/{matchId}")]
        [Authorize(Roles = "SuperAdmin,Admin,Moderator")]
        public async Task<IActionResult> UpdateMatchResult(int leagueId, int matchId, [FromBody] MatchUpdateDto dto)
        {
            var match = await _context.Matches.FirstOrDefaultAsync(m => m.Id == matchId && m.LeagueId == leagueId);
            if (match == null) return NotFound("Match not found.");

            match.HomeScore = dto.HomeScore;
            match.AwayScore = dto.AwayScore;
            match.Status = dto.Status;


            await _context.SaveChangesAsync();
            return Ok();
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
namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Data;
    using System.Linq;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous] 
    public class StatsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StatsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {

            var topScorers = await _context.MatchAppearances
                .Include(ma => ma.Player)
                .ThenInclude(p => p.Team)
                .GroupBy(ma => new { ma.Player.Id, ma.Player.FirstName, ma.Player.LastName, TeamName = ma.Player.Team != null ? ma.Player.Team.Name : "Free Agent", ma.Player.ProfileImageUrl })
                .Select(g => new {
                    PlayerId = g.Key.Id,
                    Name = g.Key.FirstName + " " + g.Key.LastName,
                    Team = g.Key.TeamName,
                    ImageUrl = g.Key.ProfileImageUrl,
                    TotalGoals = g.Sum(ma => ma.Goals),
                    MatchesPlayed = g.Count()
                })
                .Where(x => x.TotalGoals > 0)
                .OrderByDescending(x => x.TotalGoals)
                .Take(5)
                .ToListAsync();

            var recentMatches = await _context.Matches
            .Include(m => m.HomeTeam)
            .Include(m => m.AwayTeam)
            .Include(m => m.League)
            .Where(m => m.Status == "Finished")
            .OrderByDescending(m => m.MatchDate)
            .Take(4)
            .Select(m => new {
                m.Id,
                m.MatchDate,
                m.HomeScore,
                m.AwayScore,
                HomeTeam = m.HomeTeam.Name,
                AwayTeam = m.AwayTeam.Name,
                LeagueName = m.League.Name
            })
            .ToListAsync();

            // НОВО: Предстоящи 4 мача
            var upcomingMatches = await _context.Matches
                .Include(m => m.HomeTeam)
                .Include(m => m.AwayTeam)
                .Include(m => m.League)
                .Where(m => m.Status == "Scheduled" && m.MatchDate >= System.DateTime.UtcNow.AddDays(-1)) // Мачове, които не са минали (или са от днес)
                .OrderBy(m => m.MatchDate)
                .Take(4)
                .Select(m => new {
                    m.Id,
                    m.MatchDate,
                    HomeTeam = m.HomeTeam.Name,
                    AwayTeam = m.AwayTeam.Name,
                    LeagueName = m.League.Name
                })
                .ToListAsync();

            // 3. Обща статистика (Броячи)
            var platformStats = new
            {
                TotalPlayers = await _context.Players.Where(p => p.IsApproved).CountAsync(),
                TotalTeams = await _context.Teams.CountAsync(),
                TotalLeagues = await _context.Leagues.CountAsync(),
                TotalMatchesPlayed = await _context.Matches.Where(m => m.Status == "Finished").CountAsync()
            };

            return Ok(new
            {
                TopScorers = topScorers,
                RecentMatches = recentMatches,
                UpcomingMatches = upcomingMatches, // НОВО: Добавяме го в отговора
                PlatformStats = platformStats
            });
        }
    }
}
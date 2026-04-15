namespace SpotTheTop.Services
{
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Api.Interfaces;
    using SpotTheTop.Core.DTOs.Leagues;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    public class LeagueService : ILeagueService
    {
        private readonly ApplicationDbContext _context;

        public LeagueService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetLeaguesAsync()
        {
            return await _context.Leagues
                .Select(l => new {
                    l.Id,
                    l.Name,
                    l.Country,
                    TeamsCount = l.Teams.Count,
                    PlayersCount = l.Teams.SelectMany(t => t.Players).Count()
                }).ToListAsync();
        }

        public async Task<string> AddLeagueAsync(LeagueCreateDto dto)
        {
            var league = new League { Name = dto.Name, Country = dto.Country };
            _context.Leagues.Add(league);
            await _context.SaveChangesAsync();
            return $"League '{league.Name}' added successfully!";
        }

        public async Task<object?> GetLeagueDetailsAsync(int id)
        {
            return await _context.Leagues
                .Where(l => l.Id == id)
                .Select(l => new { l.Id, l.Name, l.Country, TeamsCount = l.Teams.Count })
                .FirstOrDefaultAsync();
        }

        public async Task<object?> GetLeagueStandingsAsync(int id, int? seasonId)
        {
            var season = seasonId.HasValue
                ? await _context.Seasons.FirstOrDefaultAsync(s => s.Id == seasonId.Value && s.LeagueId == id)
                : await _context.Seasons.Where(s => s.LeagueId == id && s.IsActive).OrderByDescending(s => s.StartDate).FirstOrDefaultAsync();

            if (season == null) return null;

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
                .OrderByDescending(ts => ts.Points).ThenByDescending(ts => ts.GoalDifference).ThenByDescending(ts => ts.GoalsFor)
                .ToListAsync();

            return new { SeasonId = season.Id, SeasonName = season.Name, Standings = standings };
        }

        public async Task<string> ImportLeaguesBulkAsync(List<LeagueCreateDto> dtos)
        {
            var leagues = dtos.Select(d => new League { Name = d.Name, Country = d.Country }).ToList();
            await _context.Leagues.AddRangeAsync(leagues);
            await _context.SaveChangesAsync();
            return $"{leagues.Count} leagues imported successfully!";
        }

        public async Task<bool> DeleteLeagueAsync(int id)
        {
            var league = await _context.Leagues.FindAsync(id);
            if (league == null) return false;

            _context.Leagues.Remove(league);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
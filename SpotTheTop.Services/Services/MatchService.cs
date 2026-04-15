namespace SpotTheTop.Services
{
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Api.Interfaces;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    public class MatchService : IMatchService
    {
        private readonly ApplicationDbContext _context;
        public MatchService(ApplicationDbContext context) { _context = context; }

        public async Task<object?> GetMatchesAsync(int leagueId, int? seasonId, int? round)
        {
            var season = seasonId.HasValue
                ? await _context.Seasons.FirstOrDefaultAsync(s => s.Id == seasonId.Value && s.LeagueId == leagueId)
                : await _context.Seasons.Where(s => s.LeagueId == leagueId && s.IsActive).OrderByDescending(s => s.StartDate).FirstOrDefaultAsync();

            if (season == null) return null;

            var query = _context.Matches.Include(m => m.HomeTeam).Include(m => m.AwayTeam)
                                        .Where(m => m.LeagueId == leagueId && m.SeasonId == season.Id);
            if (round.HasValue) query = query.Where(m => m.Round == round.Value);

            var matches = await query.OrderBy(m => m.MatchDate).Select(m => new {
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
            }).ToListAsync();

            var availableRounds = await _context.Matches.Where(m => m.LeagueId == leagueId && m.SeasonId == season.Id)
                                                .Select(m => m.Round).Distinct().OrderBy(r => r).ToListAsync();

            return new { SeasonId = season.Id, SeasonName = season.Name, Matches = matches, AvailableRounds = availableRounds };
        }

        public async Task AddMatchAsync(dynamic dto)
        {
            if (dto.HomeTeamId == dto.AwayTeamId) throw new ArgumentException("Home team and Away team cannot be the same.");

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
        }

        public async Task<bool> UpdateMatchResultAsync(int id, dynamic dto)
        {
            var match = await _context.Matches.FindAsync(id);
            if (match == null) return false;

            match.HomeScore = dto.HomeScore; match.AwayScore = dto.AwayScore; match.Status = dto.Status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteMatchAsync(int id)
        {
            var match = await _context.Matches.FindAsync(id);
            if (match == null) return false;
            _context.Matches.Remove(match);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string> ImportMatchesBulkAsync(List<dynamic> dtos)
        {
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
            return $"{matches.Count} matches imported successfully!";
        }
    }
}
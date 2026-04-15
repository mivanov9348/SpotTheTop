namespace SpotTheTop.Services
{
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Api.Interfaces;
    using SpotTheTop.Core.DTOs.Season;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    public class SeasonService : ISeasonService
    {
        private readonly ApplicationDbContext _context;

        public SeasonService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetSeasonsAsync(int? leagueId)
        {
            var query = _context.Seasons.AsQueryable();
            if (leagueId.HasValue) query = query.Where(s => s.LeagueId == leagueId.Value);

            return await query
                .OrderByDescending(s => s.StartDate)
                .Select(s => new { s.Id, s.Name, s.LeagueId, s.IsActive })
                .ToListAsync();
        }

        public async Task<string> AddSeasonAsync(SeasonCreateDto dto)
        {
            if (!dto.LeagueIds.Any()) return "Изберете поне една лига.";

            foreach (var leagueId in dto.LeagueIds)
            {
                if (dto.IsActive)
                {
                    var activeSeasons = await _context.Seasons.Where(s => s.LeagueId == leagueId && s.IsActive).ToListAsync();
                    activeSeasons.ForEach(s => s.IsActive = false);
                }

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
            return "Сезоните и класиранията бяха създадени автоматично!";
        }

        public async Task<bool> DeleteSeasonAsync(int id)
        {
            var season = await _context.Seasons.FindAsync(id);
            if (season == null) return false;

            _context.Seasons.Remove(season);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
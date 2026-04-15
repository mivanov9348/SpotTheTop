namespace SpotTheTop.Services
{
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Api.Interfaces;
    using SpotTheTop.Core.DTOs.Leagues;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;
    using System;
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
            // Проверка за дублиране при единично добавяне
            bool exists = await _context.Leagues.AnyAsync(l =>
                l.Name.ToLower() == dto.Name.Trim().ToLower() &&
                l.Country.ToLower() == dto.Country.Trim().ToLower());

            if (exists)
            {
                throw new ArgumentException($"League '{dto.Name}' in '{dto.Country}' already exists.");
            }

            var league = new League
            {
                Name = dto.Name.Trim(),
                Country = dto.Country.Trim()
            };

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
            // Взимаме имената от DTO-тата
            var incomingNames = dtos.Select(d => d.Name.Trim()).ToList();

            // Търсим съществуващи лиги с тези имена в базата
            var existingLeagues = await _context.Leagues
                .Where(l => incomingNames.Contains(l.Name))
                .Select(l => new { l.Name, l.Country })
                .ToListAsync();

            // Филтрираме само лигите, които ги няма в базата (по име И държава)
            var newLeaguesDto = dtos.Where(dto =>
                !existingLeagues.Any(el =>
                    el.Name.Equals(dto.Name.Trim(), StringComparison.OrdinalIgnoreCase) &&
                    el.Country.Equals(dto.Country.Trim(), StringComparison.OrdinalIgnoreCase))
            ).ToList();

            if (!newLeaguesDto.Any())
            {
                return "No new leagues to import. All existing leagues were skipped.";
            }

            // Създаваме моделите за запис
            var leaguesToInsert = newLeaguesDto.Select(d => new League
            {
                Name = d.Name.Trim(),
                Country = d.Country.Trim()
            }).ToList();

            await _context.Leagues.AddRangeAsync(leaguesToInsert);
            await _context.SaveChangesAsync();

            int skippedCount = dtos.Count - leaguesToInsert.Count;
            return $"{leaguesToInsert.Count} leagues imported successfully! ({skippedCount} duplicates skipped)";
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
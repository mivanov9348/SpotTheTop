namespace SpotTheTop.Services
{
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Api.Interfaces;
    using SpotTheTop.Core.DTOs.Teams;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    public class TeamService : ITeamService
    {
        private readonly ApplicationDbContext _context;

        public TeamService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetTeamsAsync(int? leagueId)
        {
            var query = _context.Teams.Where(t => t.IsApproved);
            if (leagueId.HasValue) query = query.Where(t => t.LeagueId == leagueId.Value);

            return await query
                .Select(t => new { t.Id, t.Name, t.City, t.Stadium, LeagueName = t.League.Name, t.LeagueId })
                .ToListAsync();
        }

        public async Task<object?> GetTeamDetailsAsync(int id)
        {
            return await _context.Teams
                .Where(t => t.Id == id)
                .Select(t => new { t.Id, t.Name, t.City, t.Stadium, LeagueName = t.League.Name })
                .FirstOrDefaultAsync();
        }

        public async Task<string> AddTeamAsync(TeamCreateDto dto, string currentUserEmail)
        {
            var leagueExists = await _context.Leagues.AnyAsync(l => l.Id == dto.LeagueId);
            if (!leagueExists) throw new ArgumentException("Invalid League ID.");

            var team = new Team
            {
                Name = dto.Name,
                City = dto.City,
                Stadium = dto.Stadium,
                LeagueId = dto.LeagueId,
                IsApproved = true,
                ManagerUserId = currentUserEmail
            };

            _context.Teams.Add(team);
            await _context.SaveChangesAsync();
            return $"Team '{team.Name}' added successfully!";
        }

        public async Task<string> ImportTeamsBulkAsync(List<TeamCreateDto> dtos, string currentUserEmail)
        {
            // 1. Взимаме всички имена на отбори от входящия списък
            var incomingTeamNames = dtos.Select(d => d.Name.Trim()).ToList();

            // 2. Търсим в базата кои от тези отбори вече съществуват
            // Търсим по име и евентуално по LeagueId, за да сме сигурни, че няма да дублираме
            var existingTeams = await _context.Teams
                .Where(t => incomingTeamNames.Contains(t.Name))
                .Select(t => new { t.Name, t.LeagueId })
                .ToListAsync();

            // 3. Филтрираме DTO-тата, като оставяме само тези, които ги НЯМА в базата
            var newTeamsDto = dtos.Where(dto =>
                !existingTeams.Any(et =>
                    et.Name.Equals(dto.Name.Trim(), StringComparison.OrdinalIgnoreCase) &&
                    et.LeagueId == dto.LeagueId) // Проверяваме и лигата за всеки случай
            ).ToList();

            // Ако всички отбори от файла вече ги има в базата:
            if (!newTeamsDto.Any())
            {
                return "No new teams to import. All existing teams were skipped.";
            }

            // 4. Създаваме моделите само за НОВИТЕ отбори
            var teamsToInsert = newTeamsDto.Select(d => new Team
            {
                Name = d.Name.Trim(),
                City = d.City?.Trim(),
                Stadium = d.Stadium?.Trim(),
                LeagueId = d.LeagueId,
                IsApproved = true,
                ManagerUserId = currentUserEmail
            }).ToList();

            // 5. Записваме в базата
            await _context.Teams.AddRangeAsync(teamsToInsert);
            await _context.SaveChangesAsync();

            int skippedCount = dtos.Count - teamsToInsert.Count;
            return $"{teamsToInsert.Count} teams imported successfully! ({skippedCount} duplicates skipped)";
        }

        public async Task<bool> DeleteTeamAsync(int id)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team == null) return false;

            _context.Teams.Remove(team);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
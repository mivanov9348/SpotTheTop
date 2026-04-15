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
            var teams = dtos.Select(d => new Team
            {
                Name = d.Name,
                City = d.City,
                Stadium = d.Stadium,
                LeagueId = d.LeagueId,
                IsApproved = true,
                ManagerUserId = currentUserEmail
            }).ToList();

            await _context.Teams.AddRangeAsync(teams);
            await _context.SaveChangesAsync();
            return $"{teams.Count} teams imported successfully!";
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
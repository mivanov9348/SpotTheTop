namespace SpotTheTop.Services
{
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.DTOs.Players;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    public class PlayerService : IPlayerService
    {
        private readonly ApplicationDbContext _context;

        public PlayerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PlayerResponseDto>> GetApprovedPlayersAsync(int? teamId, int? leagueId, int? seasonId)
        {
            var query = _context.Players
                .Include(p => p.Position)
                .Include(p => p.Team)
                .Include(p => p.Appearances)
                    .ThenInclude(a => a.Match)
                .Where(p => p.IsApproved == true);

            if (teamId.HasValue) query = query.Where(p => p.TeamId == teamId.Value);
            if (leagueId.HasValue) query = query.Where(p => p.Team != null && p.Team.LeagueId == leagueId.Value);

            return await query
                .Select(p => new PlayerResponseDto
                {
                    Id = p.Id,
                    FullName = $"{p.FirstName} {p.LastName}",
                    Age = DateTime.Now.Year - p.DateOfBirth.Year,
                    Position = p.Position.Name,
                    TeamId = p.TeamId,
                    TeamName = p.Team != null ? p.Team.Name : "Free Agent",
                    IsApproved = p.IsApproved,
                    AddedBy = p.AddedByUserId,
                    HeightCm = p.HeightCm,
                    PreferredFoot = p.PreferredFoot,

                    MatchesPlayed = p.Appearances.Count(a => !seasonId.HasValue || a.Match.SeasonId == seasonId.Value),
                    MinutesPlayed = p.Appearances.Where(a => !seasonId.HasValue || a.Match.SeasonId == seasonId.Value).Sum(a => (int?)a.MinutesPlayed) ?? 0,
                    TotalGoals = p.Appearances.Where(a => !seasonId.HasValue || a.Match.SeasonId == seasonId.Value).Sum(a => (int?)a.Goals) ?? 0,
                    TotalAssists = p.Appearances.Where(a => !seasonId.HasValue || a.Match.SeasonId == seasonId.Value).Sum(a => (int?)a.Assists) ?? 0,
                    TotalYellowCards = p.Appearances.Where(a => !seasonId.HasValue || a.Match.SeasonId == seasonId.Value).Sum(a => (int?)a.YellowCards) ?? 0,
                    TotalRedCards = p.Appearances.Count(a => (!seasonId.HasValue || a.Match.SeasonId == seasonId.Value) && a.IsRedCard),

                    TotalShots = p.Appearances.Where(a => !seasonId.HasValue || a.Match.SeasonId == seasonId.Value).Sum(a => a.Shots),
                    TotalChancesCreated = p.Appearances.Where(a => !seasonId.HasValue || a.Match.SeasonId == seasonId.Value).Sum(a => a.ChancesCreated),
                    TotalPassesCompleted = p.Appearances.Where(a => !seasonId.HasValue || a.Match.SeasonId == seasonId.Value).Sum(a => a.PassesCompleted),
                    AveragePassAccuracy = (int?)p.Appearances.Where(a => (!seasonId.HasValue || a.Match.SeasonId == seasonId.Value) && a.PassAccuracyPercent != null).Average(a => a.PassAccuracyPercent),
                    TotalTacklesWon = p.Appearances.Where(a => !seasonId.HasValue || a.Match.SeasonId == seasonId.Value).Sum(a => a.TacklesWon),
                    TotalCleanSheets = p.Appearances.Count(a => (!seasonId.HasValue || a.Match.SeasonId == seasonId.Value) && a.IsCleanSheet),
                    TotalSaves = p.Appearances.Where(a => !seasonId.HasValue || a.Match.SeasonId == seasonId.Value).Sum(a => a.Saves)
                })
                .OrderByDescending(p => p.TotalGoals)
                .ToListAsync();
        }

        public async Task<IEnumerable<PlayerResponseDto>> GetPendingPlayersAsync()
        {
            return await _context.Players
                .Where(p => p.IsApproved == false)
                .Select(p => new PlayerResponseDto
                {
                    Id = p.Id,
                    FullName = $"{p.FirstName} {p.LastName}",
                    Position = p.Position.Name,
                    IsApproved = p.IsApproved,
                    AddedBy = p.AddedByUserId
                })
                .ToListAsync();
        }

        public async Task<PlayerDetailsDto?> GetPlayerDetailsAsync(int id, string currentUserEmail, bool isAdminOrMod)
        {
            var player = await _context.Players
                .Include(p => p.Position)
                .Include(p => p.Team).ThenInclude(t => t.League)
                .Include(p => p.Appearances)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (player == null) return null;

            if (!player.IsApproved && !isAdminOrMod && player.AddedByUserId != currentUserEmail)
            {
                throw new UnauthorizedAccessException("Нямате права да виждате този неодобрен играч.");
            }

            var apps = player.Appearances.ToList();

            return new PlayerDetailsDto
            {
                Id = player.Id,
                FirstName = player.FirstName,
                LastName = player.LastName,
                Age = DateTime.Now.Year - player.DateOfBirth.Year,
                DateOfBirthFormatted = player.DateOfBirth.ToString("dd MMM yyyy"),
                PositionName = player.Position.Name,
                PositionCategory = player.Position.Category,
                TeamName = player.Team?.Name ?? "Free Agent",
                LeagueName = player.Team?.League?.Name,
                HeightCm = player.HeightCm,
                WeightKg = player.WeightKg,
                PreferredFoot = player.PreferredFoot,
                Nationality = player.Nationality,
                MarketValueEuro = player.MarketValueEuro,

                TotalMatchesPlayed = apps.Count,
                TotalMinutesPlayed = apps.Sum(a => a.MinutesPlayed),
                TotalGoals = apps.Sum(a => a.Goals),
                TotalAssists = apps.Sum(a => a.Assists),
                TotalYellowCards = apps.Sum(a => a.YellowCards),
                TotalRedCards = apps.Count(a => a.IsRedCard),

                TotalShots = apps.Any(a => a.Shots != null) ? apps.Sum(a => a.Shots ?? 0) : null,
                TotalShotsOnTarget = apps.Any(a => a.ShotsOnTarget != null) ? apps.Sum(a => a.ShotsOnTarget ?? 0) : null,
                TotalChancesCreated = apps.Any(a => a.ChancesCreated != null) ? apps.Sum(a => a.ChancesCreated ?? 0) : null,
                TotalDribblesCompleted = apps.Any(a => a.DribblesCompleted != null) ? apps.Sum(a => a.DribblesCompleted ?? 0) : null,
                TotalPassesCompleted = apps.Any(a => a.PassesCompleted != null) ? apps.Sum(a => a.PassesCompleted ?? 0) : null,
                AveragePassAccuracy = apps.Any(a => a.PassAccuracyPercent != null) ? (int)apps.Where(a => a.PassAccuracyPercent.HasValue).Average(a => a.PassAccuracyPercent.Value) : null,
                TotalTacklesWon = apps.Any(a => a.TacklesWon != null) ? apps.Sum(a => a.TacklesWon ?? 0) : null,
                TotalInterceptions = apps.Any(a => a.Interceptions != null) ? apps.Sum(a => a.Interceptions ?? 0) : null,
                TotalClearances = apps.Any(a => a.Clearances != null) ? apps.Sum(a => a.Clearances ?? 0) : null,
                TotalCleanSheets = apps.Any(a => a.IsCleanSheet) ? apps.Count(a => a.IsCleanSheet) : null,
                TotalSaves = apps.Any(a => a.Saves != null) ? apps.Sum(a => a.Saves ?? 0) : null
            };
        }

        public async Task<string> AddPlayerAsync(PlayerCreateDto dto, string currentUserEmail, bool isAdmin)
        {
            // ПРОВЕРКА ЗА ДУБЛИКАТ
            bool playerExists = await _context.Players.AnyAsync(p =>
                p.FirstName.ToLower() == dto.FirstName.ToLower() &&
                p.LastName.ToLower() == dto.LastName.ToLower() &&
                p.DateOfBirth.Date == dto.DateOfBirth.Date);

            if (playerExists)
            {
                return "Грешка: Играч с това име и дата на раждане вече съществува в базата данни!";
            }

            var newPlayer = new Player
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                DateOfBirth = dto.DateOfBirth,
                Nationality = dto.Nationality,
                HeightCm = dto.HeightCm,
                WeightKg = dto.WeightKg,
                PreferredFoot = dto.PreferredFoot,
                ProfileImageUrl = dto.ProfileImageUrl,
                JerseyNumber = dto.JerseyNumber,
                MarketValueEuro = dto.MarketValueEuro,
                ContractEndDate = dto.ContractEndDate,
                AgentName = dto.AgentName,
                PositionId = dto.PositionId,
                TeamId = dto.TeamId,
                AddedByUserId = currentUserEmail,
                IsApproved = isAdmin
            };

            _context.Players.Add(newPlayer);
            await _context.SaveChangesAsync();

            return isAdmin ? "Играчът е добавен и директно одобрен от Админ!"
                           : "Скауте, играчът е добавен успешно, но чака одобрение от Админ!";
        }

        // Обновен метод за масово качване с подаден isAdmin флаг
        public async Task<string> ImportPlayersBulkAsync(List<PlayerCreateDto> dtos, string currentUserEmail, bool isAdmin)
        {
            // 1. Премахваме вътрешни дубликати от самия Excel (ако има повтарящи се редове)
            var uniqueIncomingPlayers = dtos
                .GroupBy(p => new { FirstName = p.FirstName.ToLower(), LastName = p.LastName.ToLower(), p.DateOfBirth.Date })
                .Select(g => g.First())
                .ToList();

            // 2. Взимаме само имената и датите от базата, за да не теглим цялата таблица
            var existingPlayers = await _context.Players
                .Select(p => new { FirstName = p.FirstName.ToLower(), LastName = p.LastName.ToLower(), p.DateOfBirth.Date })
                .ToListAsync();

            // 3. Филтрираме само тези, които ги няма в базата
            var playersToAdd = uniqueIncomingPlayers
                .Where(dto => !existingPlayers.Any(ep =>
                    ep.FirstName == dto.FirstName.ToLower() &&
                    ep.LastName == dto.LastName.ToLower() &&
                    ep.Date == dto.DateOfBirth.Date))
                .Select(d => new Player
                {
                    FirstName = d.FirstName,
                    LastName = d.LastName,
                    DateOfBirth = d.DateOfBirth,
                    Nationality = d.Nationality,
                    HeightCm = d.HeightCm,
                    WeightKg = d.WeightKg,
                    PreferredFoot = d.PreferredFoot,
                    ProfileImageUrl = d.ProfileImageUrl,
                    JerseyNumber = d.JerseyNumber,
                    MarketValueEuro = d.MarketValueEuro,
                    ContractEndDate = d.ContractEndDate,
                    AgentName = d.AgentName,
                    PositionId = d.PositionId,
                    TeamId = d.TeamId,
                    AddedByUserId = currentUserEmail,
                    IsApproved = isAdmin // Вече използваме isAdmin флага
                }).ToList();

            if (!playersToAdd.Any())
            {
                return "Не бяха импортирани нови играчи. Всички вече съществуват в системата или са дубликати.";
            }

            await _context.Players.AddRangeAsync(playersToAdd);
            await _context.SaveChangesAsync();

            int skippedCount = dtos.Count - playersToAdd.Count;
            return $"{playersToAdd.Count} играчи бяха импортирани успешно! {skippedCount} бяха пропуснати като дубликати.";
        }

        public async Task<bool> ApprovePlayerAsync(int id)
        {
            var player = await _context.Players.FindAsync(id);
            if (player == null || player.IsApproved) return false;

            player.IsApproved = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletePlayerAsync(int id)
        {
            var player = await _context.Players.FindAsync(id);
            if (player == null) return false;

            _context.Players.Remove(player);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
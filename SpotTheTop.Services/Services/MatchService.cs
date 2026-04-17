namespace SpotTheTop.Services
{
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Api.Interfaces;
    using SpotTheTop.Core.DTOs;
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

        public async Task AddMatchAsync(MatchCreateDto dto)
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

        public async Task<bool> UpdateMatchResultAsync(int id, MatchUpdateDto dto)
        {
            var match = await _context.Matches.FindAsync(id);
            if (match == null) return false;

            match.HomeScore = dto.HomeScore;
            match.AwayScore = dto.AwayScore;
            match.Status = dto.Status;

            await _context.SaveChangesAsync();

            // Преизчисляваме точките, ако мачът е редактиран от зеленото тикче
            await RecalculateTeamStandingAsync(match.SeasonId, match.LeagueId, match.HomeTeamId);
            await RecalculateTeamStandingAsync(match.SeasonId, match.LeagueId, match.AwayTeamId);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<string> ImportMatchesBulkAsync(List<MatchCreateDto> dtos)
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

        public async Task<bool> DeleteMatchAsync(int id)
        {
            var match = await _context.Matches.FindAsync(id);
            if (match == null) return false;

            int seasonId = match.SeasonId;
            int leagueId = match.LeagueId;
            int homeTeamId = match.HomeTeamId;
            int awayTeamId = match.AwayTeamId;

            _context.Matches.Remove(match);
            await _context.SaveChangesAsync();

            // Преизчисляваме точките след изтриване на мач
            await RecalculateTeamStandingAsync(seasonId, leagueId, homeTeamId);
            await RecalculateTeamStandingAsync(seasonId, leagueId, awayTeamId);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<MatchDetailsForEditDto?> GetMatchDetailsForEditAsync(int matchId)
        {
            var match = await _context.Matches
                .Include(m => m.Appearances)
                .Include(m => m.Events)
                .FirstOrDefaultAsync(m => m.Id == matchId);

            if (match == null) return null;

            var homePlayers = await _context.Players.Include(p => p.Position).Where(p => p.TeamId == match.HomeTeamId && p.IsApproved).ToListAsync();
            var awayPlayers = await _context.Players.Include(p => p.Position).Where(p => p.TeamId == match.AwayTeamId && p.IsApproved).ToListAsync();

            return new MatchDetailsForEditDto
            {
                HomeTeamId = match.HomeTeamId,
                AwayTeamId = match.AwayTeamId,
                HomePlayers = homePlayers.Select(p => new MatchPlayerBasicDto { Id = p.Id, Name = $"{p.FirstName} {p.LastName}", Position = p.Position.Abbreviation }).ToList(),
                AwayPlayers = awayPlayers.Select(p => new MatchPlayerBasicDto { Id = p.Id, Name = $"{p.FirstName} {p.LastName}", Position = p.Position.Abbreviation }).ToList(),

                ExistingStats = match.Appearances.Select(a => new MatchPlayerStatDto
                {
                    PlayerId = a.PlayerId,
                    TeamId = a.TeamId,
                    MinutesPlayed = a.MinutesPlayed,
                    Goals = a.Goals,
                    Assists = a.Assists,
                    YellowCards = a.YellowCards,
                    IsRedCard = a.IsRedCard,
                    Shots = a.Shots,
                    PassesCompleted = a.PassesCompleted,
                    TacklesWon = a.TacklesWon,
                    Saves = a.Saves,
                    IsCleanSheet = a.IsCleanSheet
                }).ToList(),

                ExistingEvents = match.Events.Select(e => new MatchEventDto
                {
                    Minute = e.Minute,
                    ExtraMinute = e.ExtraMinute,
                    EventType = e.EventType,
                    TeamId = e.TeamId,
                    PrimaryPlayerId = e.PrimaryPlayerId,
                    SecondaryPlayerId = e.SecondaryPlayerId,
                    Notes = e.Notes
                }).ToList()
            };
        }

        public async Task<bool> SubmitMatchStatsAsync(int matchId, MatchFullSaveDto dto, string currentUserEmail)
        {
            var match = await _context.Matches
                .Include(m => m.Appearances)
                .Include(m => m.Events)
                .FirstOrDefaultAsync(m => m.Id == matchId);

            if (match == null) return false;

            _context.MatchAppearances.RemoveRange(match.Appearances);
            _context.MatchEvents.RemoveRange(match.Events);

            int homeGoals = 0;
            int awayGoals = 0;

            // 1. Запис на статистики
            foreach (var stat in dto.PlayerStats)
            {
                if (stat.MinutesPlayed == 0 && stat.Goals == 0 && stat.YellowCards == 0 && !stat.IsRedCard)
                    continue;

                _context.MatchAppearances.Add(new MatchAppearance
                {
                    MatchId = matchId,
                    PlayerId = stat.PlayerId,
                    TeamId = stat.TeamId,
                    MinutesPlayed = stat.MinutesPlayed,
                    Goals = stat.Goals,
                    Assists = stat.Assists,
                    YellowCards = stat.YellowCards,
                    IsRedCard = stat.IsRedCard,
                    Shots = stat.Shots,
                    PassesCompleted = stat.PassesCompleted,
                    TacklesWon = stat.TacklesWon,
                    Saves = stat.Saves,
                    IsCleanSheet = stat.IsCleanSheet,
                    AddedByUserId = currentUserEmail,
                    IsVerified = true
                });

                if (stat.TeamId == match.HomeTeamId) homeGoals += stat.Goals;
                if (stat.TeamId == match.AwayTeamId) awayGoals += stat.Goals;
            }

            // 2. Запис на събития
            foreach (var ev in dto.Events)
            {
                _context.MatchEvents.Add(new MatchEvent
                {
                    MatchId = matchId,
                    Minute = ev.Minute,
                    ExtraMinute = ev.ExtraMinute,
                    EventType = ev.EventType,
                    TeamId = ev.TeamId,
                    PrimaryPlayerId = ev.PrimaryPlayerId,
                    SecondaryPlayerId = ev.SecondaryPlayerId,
                    Notes = ev.Notes
                });
            }

            // 3. Обновяване на мача
            match.HomeScore = homeGoals;
            match.AwayScore = awayGoals;
            match.Status = "Finished";

            await _context.SaveChangesAsync(); // Запазваме мача, за да участва в сметките

            // 4. ПРЕИЗЧИСЛЯВАНЕ НА КЛАСИРАНЕТО (НОВО!)
            await RecalculateTeamStandingAsync(match.SeasonId, match.LeagueId, match.HomeTeamId);
            await RecalculateTeamStandingAsync(match.SeasonId, match.LeagueId, match.AwayTeamId);

            await _context.SaveChangesAsync(); // Запазваме новото класиране

            return true;
        }

        // ==========================================
        // ПОМОЩЕН МЕТОД ЗА ПРЕИЗЧИСЛЯВАНЕ НА ТОЧКИТЕ
        // ==========================================
        private async Task RecalculateTeamStandingAsync(int seasonId, int leagueId, int teamId)
        {
            // 1. Взимаме или създаваме записа за класиране на отбора
            var standing = await _context.TeamSeasonStandings
                .FirstOrDefaultAsync(ts => ts.SeasonId == seasonId && ts.TeamId == teamId);

            if (standing == null)
            {
                standing = new TeamSeasonStanding { SeasonId = seasonId, LeagueId = leagueId, TeamId = teamId };
                _context.TeamSeasonStandings.Add(standing);
            }

            // 2. Взимаме ВСИЧКИ завършени мачове на този отбор за сезона
            var finishedMatches = await _context.Matches
                .Where(m => m.SeasonId == seasonId && m.Status == "Finished" && (m.HomeTeamId == teamId || m.AwayTeamId == teamId))
                .ToListAsync();

            // 3. Нулираме статистиката
            standing.MatchesPlayed = finishedMatches.Count;
            standing.Wins = 0;
            standing.Draws = 0;
            standing.Losses = 0;
            standing.GoalsFor = 0;
            standing.GoalsAgainst = 0;
            standing.Points = 0;

            // 4. Навъртаме мачовете и сумираме наново
            foreach (var m in finishedMatches)
            {
                if (m.HomeTeamId == teamId)
                {
                    // Отборът е домакин
                    standing.GoalsFor += m.HomeScore ?? 0;
                    standing.GoalsAgainst += m.AwayScore ?? 0;

                    if (m.HomeScore > m.AwayScore) { standing.Wins++; standing.Points += 3; }
                    else if (m.HomeScore == m.AwayScore) { standing.Draws++; standing.Points += 1; }
                    else { standing.Losses++; }
                }
                else
                {
                    // Отборът е гост
                    standing.GoalsFor += m.AwayScore ?? 0;
                    standing.GoalsAgainst += m.HomeScore ?? 0;

                    if (m.AwayScore > m.HomeScore) { standing.Wins++; standing.Points += 3; }
                    else if (m.AwayScore == m.HomeScore) { standing.Draws++; standing.Points += 1; }
                    else { standing.Losses++; }
                }
            }
        }
    }
}
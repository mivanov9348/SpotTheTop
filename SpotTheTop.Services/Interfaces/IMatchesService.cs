namespace SpotTheTop.Api.Interfaces
{
    using SpotTheTop.Core.DTOs;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface IMatchService
    {
        Task<object?> GetMatchesAsync(int leagueId, int? seasonId, int? round);
        Task AddMatchAsync(MatchCreateDto dto);
        Task<bool> UpdateMatchResultAsync(int id, MatchUpdateDto dto);
        Task<bool> DeleteMatchAsync(int id);
        Task<string> ImportMatchesBulkAsync(List<MatchCreateDto> dtos);
        Task<MatchDetailsForEditDto?> GetMatchDetailsForEditAsync(int matchId);

        Task<bool> SubmitMatchStatsAsync(int matchId, MatchFullSaveDto dto, string currentUserEmail);
    }
}
namespace SpotTheTop.Services
{
    using SpotTheTop.Core.DTOs; 
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface IMatchService
    {
        Task<object?> GetMatchesAsync(int leagueId, int? seasonId, int? round);
        Task AddMatchAsync(dynamic dto);
        Task<bool> UpdateMatchResultAsync(int id, dynamic dto); 
        Task<bool> DeleteMatchAsync(int id);
        Task<string> ImportMatchesBulkAsync(List<dynamic> dtos);
    }
}
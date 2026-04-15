namespace SpotTheTop.Api.Interfaces
{
    using SpotTheTop.Core.DTOs.Leagues;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface ILeagueService
    {
        Task<object> GetLeaguesAsync();
        Task<object?> GetLeagueDetailsAsync(int id);
        Task<object?> GetLeagueStandingsAsync(int id, int? seasonId);
        Task<string> AddLeagueAsync(LeagueCreateDto dto);
        Task<string> ImportLeaguesBulkAsync(List<LeagueCreateDto> dtos);
        Task<bool> DeleteLeagueAsync(int id);
    }
}
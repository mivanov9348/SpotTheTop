namespace SpotTheTop.Services
{
    using SpotTheTop.Core.DTOs.Teams;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface ITeamService
    {
        Task<object> GetTeamsAsync(int? leagueId);
        Task<object?> GetTeamDetailsAsync(int id);
        Task<string> AddTeamAsync(TeamCreateDto dto, string currentUserEmail);
        Task<string> ImportTeamsBulkAsync(List<TeamCreateDto> dtos, string currentUserEmail);
        Task<bool> DeleteTeamAsync(int id);
    }
}
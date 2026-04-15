namespace SpotTheTop.Services
{
    using SpotTheTop.Core.DTOs.Players;

    public interface IPlayerService
    {
        Task<IEnumerable<PlayerResponseDto>> GetApprovedPlayersAsync(int? teamId, int? leagueId, int? seasonId);
        Task<IEnumerable<PlayerResponseDto>> GetPendingPlayersAsync();
        Task<PlayerDetailsDto?> GetPlayerDetailsAsync(int id, string currentUserEmail, bool isAdminOrMod);
        Task<string> AddPlayerAsync(PlayerCreateDto dto, string currentUserEmail, bool isAdmin);
        Task<bool> ApprovePlayerAsync(int id);
        Task<bool> DeletePlayerAsync(int id);
        Task<string> ImportPlayersBulkAsync(List<PlayerCreateDto> dtos, string currentUserEmail);
    }
}
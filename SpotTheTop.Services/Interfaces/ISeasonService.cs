namespace SpotTheTop.Services
{
    using SpotTheTop.Core.DTOs.Season;
    using System.Threading.Tasks;

    public interface ISeasonService
    {
        Task<object> GetSeasonsAsync(int? leagueId);
        Task<string> AddSeasonAsync(SeasonCreateDto dto);
        Task<bool> DeleteSeasonAsync(int id);
    }
}
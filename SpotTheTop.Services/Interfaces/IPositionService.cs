namespace SpotTheTop.Services
{
    using SpotTheTop.Core.DTOs.Players; 
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface IPositionService
    {
        Task<object> GetPositionsAsync();
        Task<string> AddPositionAsync(PositionCreateDto dto);
        Task<string> ImportPositionsBulkAsync(List<PositionCreateDto> dtos);
        Task<bool> DeletePositionAsync(int id);
    }
}
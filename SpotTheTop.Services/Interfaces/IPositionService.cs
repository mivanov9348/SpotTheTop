namespace SpotTheTop.Services
{
    using SpotTheTop.Core.DTOs; 
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface IPositionService
    {
        Task<object> GetPositionsAsync();
        Task<string> AddPositionAsync(dynamic dto); 
        Task<string> ImportPositionsBulkAsync(List<dynamic> dtos);
        Task<bool> DeletePositionAsync(int id);
    }
}
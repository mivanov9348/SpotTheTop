namespace SpotTheTop.Services
{
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.DTOs.Players;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    public class PositionService : IPositionService
    {
        private readonly ApplicationDbContext _context;

        public PositionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetPositionsAsync()
        {
            return await _context.Positions.ToListAsync();
        }

        public async Task<string> AddPositionAsync(PositionCreateDto dto)
        {
            var pos = new Position
            {
                Name = dto.Name,
                Abbreviation = dto.Abbreviation,
                Category = dto.Category
            };

            _context.Positions.Add(pos);
            await _context.SaveChangesAsync();
            return $"Position '{pos.Name}' added successfully!";
        }

        public async Task<string> ImportPositionsBulkAsync(List<PositionCreateDto> dtos)
        {
            var positions = dtos.Select(d => new Position
            {
                Name = d.Name.Trim(),
                Abbreviation = d.Abbreviation.Trim().Length > 4
                               ? d.Abbreviation.Trim().Substring(0, 4)
                               : d.Abbreviation.Trim(),
                Category = d.Category.Trim()
            }).ToList();

            await _context.Positions.AddRangeAsync(positions);
            await _context.SaveChangesAsync();
            return $"{positions.Count} positions imported successfully!";
        }

        public async Task<bool> DeletePositionAsync(int id)
        {
            var pos = await _context.Positions.FindAsync(id);
            if (pos == null) return false;

            _context.Positions.Remove(pos);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
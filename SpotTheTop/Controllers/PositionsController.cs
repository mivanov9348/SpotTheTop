namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.DTOs.Players;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PositionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PositionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetPositions()
        {
            var positions = await _context.Positions.ToListAsync();
            return Ok(positions);
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> AddPosition([FromBody] PositionCreateDto dto)
        {
            var pos = new Position
            {
                Name = dto.Name,
                Abbreviation = dto.Abbreviation,
                Category = dto.Category
            };

            _context.Positions.Add(pos);
            await _context.SaveChangesAsync();

            return Ok($"Position '{pos.Name}' added successfully!");
        }

        [HttpPost("bulk")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> ImportPositions([FromBody] List<PositionCreateDto> dtos)
        {
            if (dtos == null || !dtos.Any()) return BadRequest("No data received.");

            var positions = dtos.Select(d => new SpotTheTop.Core.Models.Position
            {
                Name = d.Name,
                Abbreviation = d.Abbreviation,
                Category = d.Category
            }).ToList();

            await _context.Positions.AddRangeAsync(positions);
            await _context.SaveChangesAsync();

            return Ok($"{positions.Count} positions imported successfully!");
        }
    }
}
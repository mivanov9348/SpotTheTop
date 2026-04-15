namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Services;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PositionsController : ControllerBase
    {
        private readonly IPositionService _positionService;

        public PositionsController(IPositionService positionService)
        {
            _positionService = positionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPositions()
        {
            return Ok(await _positionService.GetPositionsAsync());
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> AddPosition([FromBody] dynamic dto) // Замести с PositionCreateDto
        {
            return Ok(await _positionService.AddPositionAsync(dto));
        }

        [HttpPost("bulk")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> ImportPositions([FromBody] List<dynamic> dtos) // Замести с PositionCreateDto
        {
            if (dtos == null || dtos.Count == 0) return BadRequest("No data received.");
            return Ok(await _positionService.ImportPositionsBulkAsync(dtos));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> DeletePosition(int id)
        {
            try
            {
                var success = await _positionService.DeletePositionAsync(id);
                if (!success) return NotFound("Position not found.");
                return Ok("Position deleted successfully!");
            }
            catch (DbUpdateException)
            {
                return BadRequest("Cannot delete this Position because there are Players assigned to it.");
            }
        }
    }
}
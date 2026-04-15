namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using SpotTheTop.Core.DTOs.Season;
    using SpotTheTop.Services;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SeasonsController : ControllerBase
    {
        private readonly ISeasonService _seasonService;

        public SeasonsController(ISeasonService seasonService)
        {
            _seasonService = seasonService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetSeasons([FromQuery] int? leagueId)
        {
            return Ok(await _seasonService.GetSeasonsAsync(leagueId));
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> AddSeason([FromBody] SeasonCreateDto dto)
        {
            if (!dto.LeagueIds.Any()) return BadRequest("Изберете поне една лига.");
            var result = await _seasonService.AddSeasonAsync(dto);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> DeleteSeason(int id)
        {
            try
            {
                var success = await _seasonService.DeleteSeasonAsync(id);
                if (!success) return NotFound("Season not found.");
                return Ok("Season deleted successfully!");
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException)
            {
                return BadRequest("Cannot delete this Season because it has scheduled matches or standings attached to it.");
            }
        }
    }
}
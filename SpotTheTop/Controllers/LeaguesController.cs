namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using SpotTheTop.Api.Interfaces;
    using SpotTheTop.Core.DTOs.Leagues;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LeaguesController : ControllerBase
    {
        private readonly ILeagueService _leagueService;

        public LeaguesController(ILeagueService leagueService)
        {
            _leagueService = leagueService;
        }

        [HttpGet]
        public async Task<IActionResult> GetLeagues()
        {
            return Ok(await _leagueService.GetLeaguesAsync());
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> AddLeague([FromBody] LeagueCreateDto dto)
        {
            var result = await _leagueService.AddLeagueAsync(dto);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLeagueDetails(int id)
        {
            var league = await _leagueService.GetLeagueDetailsAsync(id);
            if (league == null) return NotFound("League not found.");
            return Ok(league);
        }

        [HttpGet("{id}/standings")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLeagueStandings(int id, [FromQuery] int? seasonId)
        {
            var standingsData = await _leagueService.GetLeagueStandingsAsync(id, seasonId);
            if (standingsData == null) return NotFound("No active season found for this league.");
            return Ok(standingsData);
        }

        [HttpPost("bulk")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> ImportLeagues([FromBody] List<LeagueCreateDto> dtos)
        {
            if (dtos == null || dtos.Count == 0) return BadRequest("No data received.");
            var result = await _leagueService.ImportLeaguesBulkAsync(dtos);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> DeleteLeague(int id)
        {
            try
            {
                var success = await _leagueService.DeleteLeagueAsync(id);
                if (!success) return NotFound("League not found.");
                return Ok("League deleted successfully!");
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException)
            {
                return BadRequest("Cannot delete this League because it has Teams or Seasons attached to it.");
            }
        }
    }
}
namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.DTOs.Teams;
    using SpotTheTop.Services;
    using System.Collections.Generic;
    using System.Security.Claims;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TeamsController : ControllerBase
    {
        private readonly ITeamService _teamService;

        public TeamsController(ITeamService teamService)
        {
            _teamService = teamService;
        }

        [HttpGet]
        public async Task<IActionResult> GetTeams([FromQuery] int? leagueId)
        {
            return Ok(await _teamService.GetTeamsAsync(leagueId));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTeamDetails(int id)
        {
            var team = await _teamService.GetTeamDetailsAsync(id);
            if (team == null) return NotFound("Team not found.");
            return Ok(team);
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> AddTeam([FromBody] TeamCreateDto dto)
        {
            try
            {
                var currentUserEmail = User.FindFirstValue(ClaimTypes.Name) ?? "System";
                var result = await _teamService.AddTeamAsync(dto, currentUserEmail);
                return Ok(result);
            }
            catch (System.ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("bulk")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> ImportTeams([FromBody] List<TeamCreateDto> dtos)
        {
            if (dtos == null || dtos.Count == 0) return BadRequest("No data received.");
            var currentUserEmail = User.FindFirstValue(ClaimTypes.Name) ?? "System";
            return Ok(await _teamService.ImportTeamsBulkAsync(dtos, currentUserEmail));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> DeleteTeam(int id)
        {
            try
            {
                var success = await _teamService.DeleteTeamAsync(id);
                if (!success) return NotFound("Team not found.");
                return Ok("Team deleted successfully!");
            }
            catch (DbUpdateException)
            {
                return BadRequest("Cannot delete this Team because it has Players, Matches, or Standings attached to it.");
            }
        }
    }
}
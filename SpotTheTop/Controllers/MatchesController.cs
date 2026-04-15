namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.DTOs;
    using SpotTheTop.Services;
    using System.Collections.Generic;
    using System.Security.Claims;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin,Admin,Moderator")]
    public class MatchesController : ControllerBase
    {
        private readonly IMatchService _matchService;

        public MatchesController(IMatchService matchService)
        {
            _matchService = matchService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetMatches([FromQuery] int leagueId, [FromQuery] int? seasonId, [FromQuery] int? round)
        {
            var result = await _matchService.GetMatchesAsync(leagueId, seasonId, round);
            if (result == null) return NotFound("No active season found.");
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> AddMatch([FromBody] dynamic dto) // Замести с MatchCreateDto
        {
            try
            {
                await _matchService.AddMatchAsync(dto);
                return Ok("Match scheduled successfully!");
            }
            catch (System.ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateMatchResult(int id, [FromBody] dynamic dto) // Замести с MatchUpdateDto
        {
            var success = await _matchService.UpdateMatchResultAsync(id, dto);
            if (!success) return NotFound("Match not found.");
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMatch(int id)
        {
            try
            {
                var success = await _matchService.DeleteMatchAsync(id);
                if (!success) return NotFound("Match not found.");
                return Ok("Match deleted successfully!");
            }
            catch (DbUpdateException)
            {
                return BadRequest("Cannot delete this match because it has recorded appearances or stats.");
            }
        }

        [HttpPost("{id}/stats")]
        public async Task<IActionResult> SubmitMatchStats(int id, [FromBody] MatchStatsSubmitDto dto)
        {
            var currentUserEmail = User.FindFirstValue(ClaimTypes.Name) ?? "System";

            var success = await _matchService.SubmitMatchStatsAsync(id, dto, currentUserEmail);

            if (!success) return NotFound("Match not found.");

            return Ok("Match statistics and result saved successfully!");
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> ImportMatches([FromBody] List<dynamic> dtos) // Замести с MatchCreateDto
        {
            if (dtos == null || dtos.Count == 0) return BadRequest("No data received.");
            return Ok(await _matchService.ImportMatchesBulkAsync(dtos));
        }
    }
}
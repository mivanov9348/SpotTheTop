namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using SpotTheTop.Core.DTOs.Players;
    using SpotTheTop.Services;
    using System.Security.Claims;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PlayersController : ControllerBase
    {
        private readonly IPlayerService _playerService;

        public PlayersController(IPlayerService playerService)
        {
            _playerService = playerService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetApprovedPlayers([FromQuery] int? teamId, [FromQuery] int? leagueId, [FromQuery] int? seasonId)
        {
            var players = await _playerService.GetApprovedPlayersAsync(teamId, leagueId, seasonId);
            return Ok(players);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Scout")]
        public async Task<IActionResult> AddPlayer([FromBody] PlayerCreateDto dto)
        {
            var currentUserEmail = User.FindFirstValue(ClaimTypes.Name) ?? "Unknown";
            bool isAdmin = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");

            var message = await _playerService.AddPlayerAsync(dto, currentUserEmail, isAdmin);

            if (message.StartsWith("Грешка:"))
            {
                return BadRequest(message);
            }

            return Ok(message);
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingPlayers()
        {
            var pending = await _playerService.GetPendingPlayersAsync();
            return Ok(pending);
        }

        [HttpPatch("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApprovePlayer(int id)
        {
            var success = await _playerService.ApprovePlayerAsync(id);
            if (!success) return BadRequest("Player not found or already approved.");

            return Ok("Player approved successfully!");
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPlayerDetails(int id)
        {
            var currentUserEmail = User.FindFirstValue(ClaimTypes.Name) ?? "";
            bool isAdminOrMod = User.IsInRole("Admin") || User.IsInRole("SuperAdmin") || User.IsInRole("Moderator");

            try
            {
                var player = await _playerService.GetPlayerDetailsAsync(id, currentUserEmail, isAdminOrMod);
                if (player == null) return NotFound("Player not found.");

                return Ok(player);
            }
            catch (System.UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        [HttpPost("bulk")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> ImportPlayers([FromBody] System.Collections.Generic.List<PlayerCreateDto> dtos)
        {
            var currentUserEmail = User.FindFirstValue(ClaimTypes.Name) ?? "System";
            bool isAdmin = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");

            var message = await _playerService.ImportPlayersBulkAsync(dtos, currentUserEmail, isAdmin);
            return Ok(message);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> DeletePlayer(int id)
        {
            try
            {
                var success = await _playerService.DeletePlayerAsync(id);
                if (!success) return NotFound("Player not found.");

                return Ok("Player deleted successfully!");
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException)
            {
                return BadRequest("Cannot delete this Player because they have recorded match appearances.");
            }
        }
    }
}
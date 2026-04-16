namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using SpotTheTop.Core.DTOs.Auth;
    using SpotTheTop.Services;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var result = await _authService.LoginAsync(model);
            if (result == null) return Unauthorized("Invalid email/username or password!");
            return Ok(result);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            try
            {
                var result = await _authService.RegisterAsync(model);
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("pending-roles")]
        [Authorize(Roles = "SuperAdmin,Admin,Moderator")]
        public async Task<IActionResult> GetPendingRoles()
        {
            return Ok(await _authService.GetPendingRolesAsync());
        }

        [HttpPost("approve-role")]
        [Authorize(Roles = "SuperAdmin,Admin,Moderator")]
        public async Task<IActionResult> ApproveRole([FromBody] ApproveRoleDto model)
        {
            try
            {
                var message = await _authService.ApproveRoleAsync(model);
                if (message == null) return NotFound("User not found!");
                return Ok(message);
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("promote")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> PromoteUser([FromBody] PromoteDto model)
        {
            bool isSuperAdmin = User.IsInRole("SuperAdmin");
            bool isAdmin = User.IsInRole("Admin");

            try
            {
                var message = await _authService.PromoteUserAsync(model, isSuperAdmin, isAdmin);
                if (message == null) return NotFound("User not found!");
                return Ok(message);
            }
            catch (System.UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("demote")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> DemoteUser([FromBody] PromoteDto model)
        {
            bool isSuperAdmin = User.IsInRole("SuperAdmin");
            bool isAdmin = User.IsInRole("Admin");

            try
            {
                var message = await _authService.DemoteUserAsync(model, isSuperAdmin, isAdmin);
                if (message == null) return NotFound("User not found!");
                return Ok(message);
            }
            catch (System.UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("all-users")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            return Ok(await _authService.GetAllUsersAsync());
        }
    }
}
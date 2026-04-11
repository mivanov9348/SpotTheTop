namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.IdentityModel.Tokens;
    using SpotTheTop.Core.DTOs.Auth;
    using SpotTheTop.Data;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

        public AuthController(UserManager<IdentityUser> userManager, IConfiguration configuration, ApplicationDbContext context)
        {
            _userManager = userManager;
            _configuration = configuration;
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            // НОВО: Проверяваме дали е въведен Имейл или Username
            IdentityUser? user = null;
            if (model.UsernameOrEmail.Contains("@"))
            {
                user = await _userManager.FindByEmailAsync(model.UsernameOrEmail);
            }
            else
            {
                user = await _userManager.FindByNameAsync(model.UsernameOrEmail);
            }

            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                var userRoles = await _userManager.GetRolesAsync(user);

                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.UserName), // Вземаме Username-а
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                foreach (var userRole in userRoles)
                {
                    authClaims.Add(new Claim(ClaimTypes.Role, userRole));
                }

                var token = GetToken(authClaims);

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo,
                    roles = userRoles
                });
            }
            return Unauthorized("Invalid email/username or password!");
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            var userExists = await _userManager.FindByEmailAsync(model.Email);
            if (userExists != null)
                return StatusCode(StatusCodes.Status500InternalServerError, "User with this email already exists!");

            var usernameExists = await _userManager.FindByNameAsync(model.Username);
            if (usernameExists != null)
                return StatusCode(StatusCodes.Status500InternalServerError, "This Username is already taken!");

            IdentityUser user = new IdentityUser()
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Username
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
                return StatusCode(StatusCodes.Status500InternalServerError, "Error creating user! Check password rules.");

            await _userManager.AddClaimAsync(user, new Claim("FirstName", model.FirstName));
            await _userManager.AddClaimAsync(user, new Claim("LastName", model.LastName));

            await _userManager.AddToRoleAsync(user, "User");

            if (!string.IsNullOrEmpty(model.Role) && model.Role != "User" && model.Role != "Admin")
            {
                await _userManager.AddClaimAsync(user, new Claim("RequestedRole", model.Role));
            }

            if (model.TeamId.HasValue)
            {
                await _userManager.AddClaimAsync(user, new Claim("RequestedTeamId", model.TeamId.Value.ToString()));
            }

            if (model.ClaimedPlayerId.HasValue && model.Role == "Player")
            {
                await _userManager.AddClaimAsync(user, new Claim("RequestedPlayerClaim", model.ClaimedPlayerId.Value.ToString()));
            }

            var userRoles = await _userManager.GetRolesAsync(user);
            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };
            foreach (var userRole in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, userRole));
            }

            var token = GetToken(authClaims);

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                expiration = token.ValidTo,
                roles = userRoles,
                message = "User created successfully! Waiting for Admin approval if specific role requested."
            });
        }

        [HttpGet("pending-roles")]
        [Authorize(Roles = "SuperAdmin,Admin,Moderator")] // Модераторите също могат да виждат това
        public async Task<IActionResult> GetPendingRoles()
        {
            var pendingRequests = await _context.UserClaims
                .Where(c => c.ClaimType == "RequestedRole")
                .Join(_context.Users, claim => claim.UserId, user => user.Id, (claim, user) => new
                {
                    Email = user.Email,
                    RequestedRole = claim.ClaimValue
                })
                .ToListAsync();

            return Ok(pendingRequests);
        }

        [HttpPost("approve-role")]
        [Authorize(Roles = "SuperAdmin,Admin,Moderator")]
        public async Task<IActionResult> ApproveRole([FromBody] ApproveRoleDto model)
        {
            var targetUser = await _userManager.FindByEmailAsync(model.Email);
            if (targetUser == null) return NotFound("User not found!");

            var claims = await _userManager.GetClaimsAsync(targetUser);
            var reqClaim = claims.FirstOrDefault(c => c.Type == "RequestedRole");

            if (reqClaim == null) return BadRequest("No pending role request found for this user.");

            await _userManager.RemoveFromRoleAsync(targetUser, "User");
            await _userManager.AddToRoleAsync(targetUser, reqClaim.Value);
            await _userManager.RemoveClaimAsync(targetUser, reqClaim);

            var playerClaim = claims.FirstOrDefault(c => c.Type == "RequestedPlayerClaim");
            if (playerClaim != null && reqClaim.Value == "Player")
            {
                int playerId = int.Parse(playerClaim.Value);
                var playerEntity = await _context.Players.FindAsync(playerId);

                if (playerEntity != null && playerEntity.ClaimedByUserId == null)
                {
                    playerEntity.ClaimedByUserId = targetUser.Id; // СВЪРЗВАМЕ ГИ!
                    await _context.SaveChangesAsync();
                }
                await _userManager.RemoveClaimAsync(targetUser, playerClaim);
            }

            return Ok($"{model.Email} is now officially a {reqClaim.Value}!");
        }

        [HttpPost("promote")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> PromoteUser([FromBody] PromoteDto model)
        {
            var targetUser = await _userManager.FindByEmailAsync(model.Email);
            if (targetUser == null) return NotFound("User not found!");

            bool isCallerSuperAdmin = User.IsInRole("SuperAdmin");
            bool isCallerAdmin = User.IsInRole("Admin");

            if ((model.TargetRole == "Admin" || model.TargetRole == "SuperAdmin") && !isCallerSuperAdmin)
            {
                return Forbid("Only a SuperAdmin can grant Admin privileges.");
            }

            if (model.TargetRole == "Moderator" && !isCallerSuperAdmin && !isCallerAdmin)
            {
                return Forbid("You do not have permission to grant Moderator privileges.");
            }

            var currentRoles = await _userManager.GetRolesAsync(targetUser);
            if (currentRoles.Contains(model.TargetRole))
                return BadRequest($"User is already a {model.TargetRole}.");

            var result = await _userManager.AddToRoleAsync(targetUser, model.TargetRole);

            if (result.Succeeded) return Ok($"Successfully promoted {model.Email} to {model.TargetRole}!");

            return StatusCode(StatusCodes.Status500InternalServerError, "System Error while promoting.");
        }

        [HttpPost("demote")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> DemoteUser([FromBody] PromoteDto model)
        {
            var targetUser = await _userManager.FindByEmailAsync(model.Email);
            if (targetUser == null) return NotFound("User not found!");

            bool isCallerSuperAdmin = User.IsInRole("SuperAdmin");
            bool isCallerAdmin = User.IsInRole("Admin");

            if (model.TargetRole == "Admin" && !isCallerSuperAdmin)
            {
                return Forbid("Only a SuperAdmin can remove Admin privileges.");
            }

            if (model.TargetRole == "Moderator" && !isCallerSuperAdmin && !isCallerAdmin)
            {
                return Forbid("Only Admins and SuperAdmins can remove Moderator privileges.");
            }

            var currentRoles = await _userManager.GetRolesAsync(targetUser);
            if (!currentRoles.Contains(model.TargetRole))
                return BadRequest($"User does not have the {model.TargetRole} role.");

            var result = await _userManager.RemoveFromRoleAsync(targetUser, model.TargetRole);

            if (result.Succeeded) return Ok($"Successfully removed {model.TargetRole} role from {model.Email}!");

            return StatusCode(StatusCodes.Status500InternalServerError, "System Error while demoting.");
        }

        [HttpGet("all-users")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var userResponses = new List<UserResponseDto>();

            foreach (var u in users)
            {
                var roles = await _userManager.GetRolesAsync(u);
                var claims = await _userManager.GetClaimsAsync(u);

                userResponses.Add(new UserResponseDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    FirstName = claims.FirstOrDefault(c => c.Type == "FirstName")?.Value ?? "",
                    LastName = claims.FirstOrDefault(c => c.Type == "LastName")?.Value ?? "",
                    CurrentRoles = roles,
                    RequestedRole = claims.FirstOrDefault(c => c.Type == "RequestedRole")?.Value,
                    RequestedTeamId = claims.FirstOrDefault(c => c.Type == "RequestedTeamId")?.Value
                });
            }

            return Ok(userResponses);
        }

        private JwtSecurityToken GetToken(List<Claim> authClaims)
        {
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                expires: DateTime.Now.AddHours(3),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return token;
        }
    }
}
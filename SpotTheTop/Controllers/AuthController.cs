namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore; // НОВО: За ToListAsync
    using Microsoft.IdentityModel.Tokens;
    using SpotTheTop.Core.DTOs;
    using SpotTheTop.Data; // НОВО: За ApplicationDbContext
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context; // НОВО: Базата данни

        // Добавяме ApplicationDbContext в конструктора
        public AuthController(UserManager<IdentityUser> userManager, IConfiguration configuration, ApplicationDbContext context)
        {
            _userManager = userManager;
            _configuration = configuration;
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
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
                    roles = userRoles
                });
            }
            return Unauthorized("Invalid email or password!");
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            var userExists = await _userManager.FindByEmailAsync(model.Email);
            if (userExists != null)
                return StatusCode(StatusCodes.Status500InternalServerError, "User already exists!");

            IdentityUser user = new IdentityUser()
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Email
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
                return StatusCode(StatusCodes.Status500InternalServerError, "Error creating user! Check password rules.");

            // ВИНАГИ даваме базовата роля "User" при регистрация
            await _userManager.AddToRoleAsync(user, "User");

            // Ако иска друга роля (Scout, Player, Team), записваме я като "чакаща" заявка (Claim)
            if (!string.IsNullOrEmpty(model.Role) && model.Role != "User" && model.Role != "Admin")
            {
                await _userManager.AddClaimAsync(user, new Claim("RequestedRole", model.Role));
            }

            return Ok("User created successfully! Waiting for Admin approval if specific role requested.");
        }

        // Взима всички потребители, които чакат одобрение за роля
        [HttpGet("pending-roles")]
        [Authorize(Roles = "Admin")]
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

        // Одобрява чакащата роля
        [HttpPost("approve-role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveRole([FromBody] PromoteDto model)
        {
            var targetUser = await _userManager.FindByEmailAsync(model.Email);
            if (targetUser == null) return NotFound("User not found!");

            var claims = await _userManager.GetClaimsAsync(targetUser);
            var reqClaim = claims.FirstOrDefault(c => c.Type == "RequestedRole");

            if (reqClaim == null) return BadRequest("No pending role request found for this user.");

            await _userManager.RemoveFromRoleAsync(targetUser, "User");
            await _userManager.AddToRoleAsync(targetUser, reqClaim.Value);

            await _userManager.RemoveClaimAsync(targetUser, reqClaim);

            return Ok($"{model.Email} is now officially a {reqClaim.Value}!");
        }

        [HttpPost("promote-to-admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PromoteToAdmin([FromBody] PromoteDto model)
        {
            var targetUser = await _userManager.FindByEmailAsync(model.Email);
            if (targetUser == null) return NotFound("User not found!");

            var currentRoles = await _userManager.GetRolesAsync(targetUser);
            if (currentRoles.Contains("Admin")) return BadRequest("This user is already an Admin.");

            var result = await _userManager.AddToRoleAsync(targetUser, "Admin");

            if (result.Succeeded) return Ok($"Successfully promoted {model.Email} to Admin!");

            var errorMessages = string.Join(" | ", result.Errors.Select(e => e.Description));
            return StatusCode(StatusCodes.Status500InternalServerError, $"System Error: {errorMessages}");
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
namespace SpotTheTop.Services
{
    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Configuration;
    using Microsoft.IdentityModel.Tokens;
    using SpotTheTop.Core.DTOs.Auth;
    using SpotTheTop.Data;
    using System;
    using System.Collections.Generic;
    using System.IdentityModel.Tokens.Jwt;
    using System.Linq;
    using System.Security.Claims;
    using System.Text;
    using System.Threading.Tasks;

    public class AuthService : IAuthService
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

        public AuthService(UserManager<IdentityUser> userManager, IConfiguration configuration, ApplicationDbContext context)
        {
            _userManager = userManager;
            _configuration = configuration;
            _context = context;
        }

        public async Task<object?> LoginAsync(LoginDto model)
        {
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
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                foreach (var userRole in userRoles)
                {
                    authClaims.Add(new Claim(ClaimTypes.Role, userRole));
                }

                var token = GetToken(authClaims);

                return new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo,
                    roles = userRoles
                };
            }

            return null;
        }

        public async Task<object?> RegisterAsync(RegisterDto model)
        {
            var userExists = await _userManager.FindByEmailAsync(model.Email);
            if (userExists != null)
                throw new Exception("User with this email already exists!");

            var usernameExists = await _userManager.FindByNameAsync(model.Username);
            if (usernameExists != null)
                throw new Exception("This Username is already taken!");

            IdentityUser user = new IdentityUser()
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Username
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
                throw new Exception("Error creating user! Check password rules.");

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

            return new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                expiration = token.ValidTo,
                roles = userRoles,
                message = "User created successfully! Waiting for Admin approval if specific role requested."
            };
        }

        public async Task<object> GetPendingRolesAsync()
        {
            return await _context.UserClaims
                .Where(c => c.ClaimType == "RequestedRole")
                .Join(_context.Users, claim => claim.UserId, user => user.Id, (claim, user) => new
                {
                    Email = user.Email,
                    RequestedRole = claim.ClaimValue
                })
                .ToListAsync();
        }

        public async Task<string?> ApproveRoleAsync(ApproveRoleDto model)
        {
            var targetUser = await _userManager.FindByEmailAsync(model.Email);
            if (targetUser == null) return null;

            var claims = await _userManager.GetClaimsAsync(targetUser);
            var reqClaim = claims.FirstOrDefault(c => c.Type == "RequestedRole");

            if (reqClaim == null) throw new Exception("No pending role request found for this user.");

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
                    playerEntity.ClaimedByUserId = targetUser.Id;
                    await _context.SaveChangesAsync();
                }
                await _userManager.RemoveClaimAsync(targetUser, playerClaim);
            }

            return $"{model.Email} is now officially a {reqClaim.Value}!";
        }

        public async Task<string?> PromoteUserAsync(PromoteDto model, bool isCallerSuperAdmin, bool isCallerAdmin)
        {
            var targetUser = await _userManager.FindByEmailAsync(model.Email);
            if (targetUser == null) return null;

            if ((model.TargetRole == "Admin" || model.TargetRole == "SuperAdmin") && !isCallerSuperAdmin)
            {
                throw new UnauthorizedAccessException("Only a SuperAdmin can grant Admin privileges.");
            }

            if (model.TargetRole == "Moderator" && !isCallerSuperAdmin && !isCallerAdmin)
            {
                throw new UnauthorizedAccessException("You do not have permission to grant Moderator privileges.");
            }

            var currentRoles = await _userManager.GetRolesAsync(targetUser);
            if (currentRoles.Contains(model.TargetRole))
                throw new Exception($"User is already a {model.TargetRole}.");

            var result = await _userManager.AddToRoleAsync(targetUser, model.TargetRole);

            if (result.Succeeded) return $"Successfully promoted {model.Email} to {model.TargetRole}!";

            throw new Exception("System Error while promoting.");
        }

        public async Task<string?> DemoteUserAsync(PromoteDto model, bool isCallerSuperAdmin, bool isCallerAdmin)
        {
            var targetUser = await _userManager.FindByEmailAsync(model.Email);
            if (targetUser == null) return null;

            if (model.TargetRole == "Admin" && !isCallerSuperAdmin)
            {
                throw new UnauthorizedAccessException("Only a SuperAdmin can remove Admin privileges.");
            }

            if (model.TargetRole == "Moderator" && !isCallerSuperAdmin && !isCallerAdmin)
            {
                throw new UnauthorizedAccessException("Only Admins and SuperAdmins can remove Moderator privileges.");
            }

            var currentRoles = await _userManager.GetRolesAsync(targetUser);
            if (!currentRoles.Contains(model.TargetRole))
                throw new Exception($"User does not have the {model.TargetRole} role.");

            var result = await _userManager.RemoveFromRoleAsync(targetUser, model.TargetRole);

            if (result.Succeeded) return $"Successfully removed {model.TargetRole} role from {model.Email}!";

            throw new Exception("System Error while demoting.");
        }

        public async Task<object> GetAllUsersAsync()
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

            return userResponses;
        }

        private JwtSecurityToken GetToken(List<Claim> authClaims)
        {
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

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
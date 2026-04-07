namespace SpotTheTop.Api
{
    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.DependencyInjection;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;

    public static class DbSeeder
    {
        public static async Task SeedRolesAndAdminAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();

            string[] roleNames = { "SuperAdmin", "Admin", "Moderator", "Scout", "Team", "Player", "User" };

            foreach (var roleName in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            var adminEmail = "admin@spotthetop.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                var newAdmin = new IdentityUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(newAdmin, "1");

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(newAdmin, "SuperAdmin");
                    await userManager.AddToRoleAsync(newAdmin, "Admin");
                }
            }
            else
            {
                if (!await userManager.IsInRoleAsync(adminUser, "SuperAdmin"))
                    await userManager.AddToRoleAsync(adminUser, "SuperAdmin");
                if (!await userManager.IsInRoleAsync(adminUser, "Admin"))
                    await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }

        public static async Task SeedBasePositionsAsync(ApplicationDbContext context)
        {
            if (await context.Positions.AnyAsync()) return; 

            var positions = new List<Position>
            {
                new Position { Name = "Goalkeeper", Abbreviation = "GK", Category = "Goalkeeper" },
                new Position { Name = "Defender", Abbreviation = "DEF", Category = "Defender" },
                new Position { Name = "Midfielder", Abbreviation = "MID", Category = "Midfielder" },
                new Position { Name = "Forward", Abbreviation = "FWD", Category = "Forward" }
            };

            await context.Positions.AddRangeAsync(positions);
            await context.SaveChangesAsync();
        }
    }
}
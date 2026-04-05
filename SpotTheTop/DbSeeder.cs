namespace SpotTheTop.Api
{
    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.Entities;
    using SpotTheTop.Data;

    public static class DbSeeder
    {
        public static async Task SeedRolesAndAdminAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();

            string[] roleNames = { "Admin", "Scout", "Team", "Player", "User" };

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

                var result = await userManager.CreateAsync(newAdmin, "Ad!2");

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(newAdmin, "Admin");
                }
            }
        }

        public static async Task SeedDatabaseAsync(ApplicationDbContext context)
        {
            // Проверяваме дали вече имаме лиги. Ако ДА - значи базата е сийдната и спираме.
            if (await context.Leagues.AnyAsync()) return;

            // 1. Добавяме Позиции
            var positions = new List<Position>
    {
        new Position { Name = "Goalkeeper", Abbreviation = "GK", Category = "Goalkeeper" },
        new Position { Name = "Center Back", Abbreviation = "CB", Category = "Defender" },
        new Position { Name = "Central Midfielder", Abbreviation = "CM", Category = "Midfielder" },
        new Position { Name = "Striker", Abbreviation = "ST", Category = "Forward" }
        // Добави останалите после...
    };
            await context.Positions.AddRangeAsync(positions);
            await context.SaveChangesAsync();

            // 2. Добавяме Лига
            var league = new League { Name = "Efbet League", Country = "Bulgaria" };
            await context.Leagues.AddAsync(league);
            await context.SaveChangesAsync();

            // 3. Добавяме Отбори
            var levski = new Team { Name = "ПФК Левски", City = "София", Stadium = "Георги Аспарухов", LeagueId = league.Id, IsApproved = true, ManagerUserId = "System" };
            var cska = new Team { Name = "ПФК ЦСКА", City = "София", Stadium = "Васил Левски", LeagueId = league.Id, IsApproved = true, ManagerUserId = "System" };
            await context.Teams.AddRangeAsync(levski, cska);
            await context.SaveChangesAsync();

            // 4. Добавяме Играчи
            var players = new List<Player>
    {
        new Player { FirstName = "Пламен", LastName = "Андреев", DateOfBirth = new DateTime(2004, 12, 15), PositionId = positions[0].Id, TeamId = levski.Id, IsApproved = true, AddedByUserId = "System" },
        new Player { FirstName = "Хосе", LastName = "Кордоба", DateOfBirth = new DateTime(2001, 6, 3), PositionId = positions[1].Id, TeamId = levski.Id, IsApproved = true, AddedByUserId = "System" },
        new Player { FirstName = "Густаво", LastName = "Бусато", DateOfBirth = new DateTime(1990, 10, 23), PositionId = positions[0].Id, TeamId = cska.Id, IsApproved = true, AddedByUserId = "System" },
        new Player { FirstName = "Фернандо", LastName = "Каранга", DateOfBirth = new DateTime(1991, 4, 14), PositionId = positions[3].Id, TeamId = cska.Id, IsApproved = true, AddedByUserId = "System" }
    };
            await context.Players.AddRangeAsync(players);
            await context.SaveChangesAsync();
        }
    }
}
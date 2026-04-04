namespace SpotTheTop.Data
{
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.Entities;
    using System; // За DateTime

    public class ApplicationDbContext : IdentityDbContext<IdentityUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Player> Players { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<League> Leagues { get; set; } // НОВО
        public DbSet<Position> Positions { get; set; }
        public DbSet<Match> Matches { get; set; }
        public DbSet<ScoutingReport> ScoutingReports { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // =======================================================
            // 1. НАСТРОЙКА НА ВРЪЗКИТЕ
            // =======================================================

            // Лига -> Отбори
            builder.Entity<Team>()
                .HasOne(t => t.League)
                .WithMany(l => l.Teams)
                .HasForeignKey(t => t.LeagueId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Player>()
                .HasOne(p => p.Position)
                .WithMany(pos => pos.Players)
                .HasForeignKey(p => p.PositionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Player>()
                .HasOne(p => p.Team)
                .WithMany(t => t.Players)
                .HasForeignKey(p => p.TeamId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<Match>()
                .HasOne(m => m.HomeTeam)
                .WithMany()
                .HasForeignKey(m => m.HomeTeamId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Match>()
                .HasOne(m => m.AwayTeam)
                .WithMany()
                .HasForeignKey(m => m.AwayTeamId)
                .OnDelete(DeleteBehavior.Restrict);


            // =======================================================
            // 2. SEEDING НА ДАННИ (За тестове)
            // =======================================================

            // 2.1 Позиции (Оставям първите няколко за краткост, сложи всичките 15 от предишния код)
            builder.Entity<Position>().HasData(
                new Position { Id = 1, Name = "Goalkeeper", Abbreviation = "GK", Category = "Goalkeeper" },
                new Position { Id = 2, Name = "Center Back", Abbreviation = "CB", Category = "Defender" },
                new Position { Id = 8, Name = "Central Midfielder", Abbreviation = "CM", Category = "Midfielder" },
                new Position { Id = 15, Name = "Striker", Abbreviation = "ST", Category = "Forward" }
            );

            // 2.2 Лига
            builder.Entity<League>().HasData(
                new League { Id = 1, Name = "Efbet Лига", Country = "Bulgaria" }
            );

            // 2.3 Отбори
            builder.Entity<Team>().HasData(
                new Team { Id = 1, Name = "ПФК Левски", City = "София", Stadium = "Георги Аспарухов", LeagueId = 1, IsApproved = true, ManagerUserId = "System" },
                new Team { Id = 2, Name = "ПФК ЦСКА", City = "София", Stadium = "Васил Левски", LeagueId = 1, IsApproved = true, ManagerUserId = "System" }
            );

            // 2.4 Играчи (Закачени към отборите)
            builder.Entity<Player>().HasData(
                new Player { Id = 1, FirstName = "Пламен", LastName = "Андреев", DateOfBirth = new DateTime(2004, 12, 15), PositionId = 1, TeamId = 1, IsApproved = true, AddedByUserId = "System" },
                new Player { Id = 2, FirstName = "Хосе", LastName = "Кордоба", DateOfBirth = new DateTime(2001, 6, 3), PositionId = 2, TeamId = 1, IsApproved = true, AddedByUserId = "System" },
                new Player { Id = 3, FirstName = "Густаво", LastName = "Бусато", DateOfBirth = new DateTime(1990, 10, 23), PositionId = 1, TeamId = 2, IsApproved = true, AddedByUserId = "System" },
                new Player { Id = 4, FirstName = "Фернандо", LastName = "Каранга", DateOfBirth = new DateTime(1991, 4, 14), PositionId = 15, TeamId = 2, IsApproved = true, AddedByUserId = "System" }
            );

            // 2.5 Мачове
            builder.Entity<Match>().HasData(
                new Match { Id = 1, HomeTeamId = 1, AwayTeamId = 2, MatchDate = new DateTime(2024, 4, 7, 17, 0, 0), Result = "2-0" },
                new Match { Id = 2, HomeTeamId = 2, AwayTeamId = 1, MatchDate = new DateTime(2024, 5, 20, 18, 0, 0), Result = null } // Бъдещ мач
            );
        }
    }
}
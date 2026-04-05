namespace SpotTheTop.Data
{
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.Entities;

    public class ApplicationDbContext : IdentityDbContext<IdentityUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Player> Players { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<League> Leagues { get; set; }
        public DbSet<Position> Positions { get; set; }
        public DbSet<Match> Matches { get; set; }
        public DbSet<ScoutingReport> ScoutingReports { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

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
        }
    }
}
namespace SpotTheTop.Data
{
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.Models;

    public class ApplicationDbContext : IdentityDbContext<IdentityUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Player> Players { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<League> Leagues { get; set; }
        public DbSet<Season> Seasons { get; set; } 
        public DbSet<Position> Positions { get; set; }
        public DbSet<Match> Matches { get; set; }
        public DbSet<MatchAppearance> MatchAppearances { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Team>()
                .HasOne(t => t.League)
                .WithMany(l => l.Teams)
                .HasForeignKey(t => t.LeagueId)
                .OnDelete(DeleteBehavior.Restrict);

            // НОВО: Връзка между Сезон и Лига
            builder.Entity<Season>()
                .HasOne(s => s.League)
                .WithMany(l => l.Seasons)
                .HasForeignKey(s => s.LeagueId)
                .OnDelete(DeleteBehavior.Cascade);

            // НОВО: Връзка между Мач и Сезон
            builder.Entity<Match>()
                .HasOne(m => m.Season)
                .WithMany(s => s.Matches)
                .HasForeignKey(m => m.SeasonId)
                .OnDelete(DeleteBehavior.Restrict); // Не трием мачове автоматично, ако изтрием сезон

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

            builder.Entity<MatchAppearance>()
                .HasOne(ma => ma.Match)
                .WithMany(m => m.Appearances) // НОВО: Обратната връзка, която добавихме
                .HasForeignKey(ma => ma.MatchId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<MatchAppearance>()
                .HasOne(ma => ma.Player)
                .WithMany(p => p.Appearances) 
                .HasForeignKey(ma => ma.PlayerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<MatchAppearance>()
                .HasOne(ma => ma.Team)
                .WithMany()
                .HasForeignKey(ma => ma.TeamId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
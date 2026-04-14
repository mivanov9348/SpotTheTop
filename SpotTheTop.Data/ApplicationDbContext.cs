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
        public DbSet<TeamSeasonStanding> TeamSeasonStandings { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Like> Likes { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Фикс за грешката с MarketValueEuro, която ти излизаше в конзолата
            builder.Entity<Player>()
                .Property(p => p.MarketValueEuro)
                .HasColumnType("decimal(18,2)");

            builder.Entity<Team>()
                .HasOne(t => t.League)
                .WithMany(l => l.Teams)
                .HasForeignKey(t => t.LeagueId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Season>()
                .HasOne(s => s.League)
                .WithMany(l => l.Seasons)
                .HasForeignKey(s => s.LeagueId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<TeamSeasonStanding>()
                .HasOne(ts => ts.Season)
                .WithMany(s => s.Standings)
                .HasForeignKey(ts => ts.SeasonId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<TeamSeasonStanding>()
                .HasOne(ts => ts.Team)
                .WithMany(t => t.SeasonStandings)
                .HasForeignKey(ts => ts.TeamId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<TeamSeasonStanding>()
                .HasOne(ts => ts.League)
                .WithMany()
                .HasForeignKey(ts => ts.LeagueId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Match>()
                .HasOne(m => m.Season)
                .WithMany(s => s.Matches)
                .HasForeignKey(m => m.SeasonId)
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

            builder.Entity<MatchAppearance>()
                .HasOne(ma => ma.Match)
                .WithMany(m => m.Appearances)
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

            builder.Entity<Comment>()
                .HasOne(c => c.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Like>()
                .HasOne(l => l.Post)
                .WithMany(p => p.Likes)
                .HasForeignKey(l => l.PostId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
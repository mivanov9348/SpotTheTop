namespace SpotTheTop.Core.Entities
{
    using System.ComponentModel.DataAnnotations;

    public class Match
    {
        public int Id { get; set; }

        public int LeagueId { get; set; }
        public League League { get; set; } = null!;

        public int HomeTeamId { get; set; }
        public Team HomeTeam { get; set; } = null!;

        public int AwayTeamId { get; set; }
        public Team AwayTeam { get; set; } = null!;

        public DateTime MatchDate { get; set; }

        public int? HomeScore { get; set; }
        public int? AwayScore { get; set; }

        [Required, MaxLength(20)]
        public string Status { get; set; } = "Scheduled"; 
    }
}
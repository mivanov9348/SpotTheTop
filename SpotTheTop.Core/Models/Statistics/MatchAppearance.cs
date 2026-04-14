namespace SpotTheTop.Core.Models
{
    using System.ComponentModel.DataAnnotations;

    public class MatchAppearance
    {
        public int Id { get; set; }

        public int MatchId { get; set; }
        public Match Match { get; set; } = null!;

        public int PlayerId { get; set; }
        public Player Player { get; set; } = null!;

        public int TeamId { get; set; }
        public Team Team { get; set; } = null!;

        public int MinutesPlayed { get; set; }
        public int Goals { get; set; }
        public int Assists { get; set; }
        public int YellowCards { get; set; }
        public bool IsRedCard { get; set; }

        public int? Shots { get; set; }
        public int? ShotsOnTarget { get; set; }
        public int? ChancesCreated { get; set; }
        public int? DribblesCompleted { get; set; }

        public int? PassesCompleted { get; set; }
        public int? PassAccuracyPercent { get; set; } 
        public int? Crosses { get; set; }

        public int? TacklesWon { get; set; }
        public int? Interceptions { get; set; }
        public int? Clearances { get; set; }
        public int? Blocks { get; set; }

        public bool IsCleanSheet { get; set; } = false; 
        public int? Saves { get; set; }
        public int? GoalsConceded { get; set; } 

        public int? FoulsCommitted { get; set; }
        public int? FoulsDrawn { get; set; } 

        [Required]
        public string AddedByUserId { get; set; } = string.Empty;

        public bool IsVerified { get; set; } = false;

        public string? ProofUrl { get; set; }
    }
}
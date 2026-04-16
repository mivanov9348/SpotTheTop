namespace SpotTheTop.Core.DTOs
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public class MatchPlayerStatDto
    {
        [Required]
        public int PlayerId { get; set; }

        [Required]
        public int TeamId { get; set; }

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
        public bool IsCleanSheet { get; set; }
        public int? Saves { get; set; }
        public int? GoalsConceded { get; set; }
        public int? FoulsCommitted { get; set; }
        public int? FoulsDrawn { get; set; }
    }

    // Това е целият пакет (всички играчи), който идва от фронтенда
    public class MatchStatsSubmitDto
    {
        public List<MatchPlayerStatDto> PlayerStats { get; set; } = new List<MatchPlayerStatDto>();
    }
}
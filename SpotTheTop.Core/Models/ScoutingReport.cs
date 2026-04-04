namespace SpotTheTop.Core.Entities
{
    using System.ComponentModel.DataAnnotations;

    public class ScoutingReport
    {
        public int Id { get; set; }

        public DateTime ReportDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string Strengths { get; set; } = string.Empty;

        [Required]
        public string Weaknesses { get; set; } = string.Empty;

        [Range(1, 10)]
        public int OverallRating { get; set; }

        public int PlayerId { get; set; }
        public Player Player { get; set; } = null!;

        public int MatchId { get; set; }
        public Match Match { get; set; } = null!;

        [Required]
        public string ScoutUserId { get; set; } = string.Empty;

        public bool IsApproved { get; set; } = false;
    }
}
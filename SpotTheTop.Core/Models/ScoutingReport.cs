namespace SpotTheTop.Core.Entities
{
    using System.ComponentModel.DataAnnotations;

    public class ScoutingReport
    {
        public int Id { get; set; }

        public DateTime ReportDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string Strengths { get; set; } 

        [Required]
        public string Weaknesses { get; set; }

        [Range(1, 10)]
        public int OverallRating { get; set; } 

        public int PlayerId { get; set; }
        public Player Player { get; set; }

        public string ScoutId { get; set; }

        public bool IsApproved { get; set; } = false;
    }
}
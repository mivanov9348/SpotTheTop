namespace SpotTheTop.Core.Models
{
    using System.ComponentModel.DataAnnotations;

    public class MatchEvent
    {
        public int Id { get; set; }

        public int MatchId { get; set; }
        public Match Match { get; set; } = null!;

        public int Minute { get; set; }

        public int? ExtraMinute { get; set; }

        [Required, MaxLength(50)]
        public string EventType { get; set; } = string.Empty;

        public int TeamId { get; set; }
        public Team Team { get; set; } = null!;

        public int? PrimaryPlayerId { get; set; }
        public Player? PrimaryPlayer { get; set; }

        public int? SecondaryPlayerId { get; set; }
        public Player? SecondaryPlayer { get; set; }

        [MaxLength(255)]
        public string? Notes { get; set; }
    }
}
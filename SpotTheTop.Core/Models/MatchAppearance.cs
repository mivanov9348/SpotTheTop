namespace SpotTheTop.Core.Entities
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

        [Required]
        public string AddedByUserId { get; set; } = string.Empty;

        public bool IsVerified { get; set; } = false; 

        public string? ProofUrl { get; set; }
    }
}
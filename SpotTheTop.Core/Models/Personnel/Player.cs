namespace SpotTheTop.Core.Models
{
    using System.ComponentModel.DataAnnotations;

    public class Player
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        public DateTime DateOfBirth { get; set; }

        public int? HeightCm { get; set; }
        public int? WeightKg { get; set; }

        [MaxLength(20)]
        public string? PreferredFoot { get; set; }

        [Required, MaxLength(50)]
        public string Nationality { get; set; } = string.Empty;

        public string? ProfileImageUrl { get; set; }

        public int? JerseyNumber { get; set; } 

        public decimal? MarketValueEuro { get; set; } 

        public DateTime? ContractEndDate { get; set; } 

        [MaxLength(100)]
        public string? AgentName { get; set; } 

        public int PositionId { get; set; }
        public Position Position { get; set; } = null!;

        public int? TeamId { get; set; }
        public Team? Team { get; set; }

        public bool IsApproved { get; set; } = false;

        public string AddedByUserId { get; set; } = string.Empty;
        public string? ClaimedByUserId { get; set; }

        public ICollection<MatchAppearance> Appearances { get; set; } = new List<MatchAppearance>();
    }
}
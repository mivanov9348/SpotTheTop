namespace SpotTheTop.Core.DTOs.Players
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public class PlayerCreateDto
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        public string Nationality { get; set; } = string.Empty;

        public int? HeightCm { get; set; }
        public int? WeightKg { get; set; }
        public string? PreferredFoot { get; set; }
        public string? ProfileImageUrl { get; set; }
        public int? JerseyNumber { get; set; }
        public decimal? MarketValueEuro { get; set; }
        public DateTime? ContractEndDate { get; set; }
        public string? AgentName { get; set; }

        [Required]
        public int PositionId { get; set; }

        public int? TeamId { get; set; }
    }
}
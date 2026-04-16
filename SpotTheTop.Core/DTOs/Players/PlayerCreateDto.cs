namespace SpotTheTop.Core.DTOs.Players
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    // 1. Имплементираме интерфейса IValidatableObject
    public class PlayerCreateDto : IValidatableObject
    {
        public string? FirstName { get; set; }

        public string? LastName { get; set; }

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

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (string.IsNullOrWhiteSpace(FirstName) && string.IsNullOrWhiteSpace(LastName))
            {
                yield return new ValidationResult(
                    "The Player must have at least a first name or a last name.",
                    new[] { nameof(FirstName), nameof(LastName) }
                );
            }
        }
    }
}
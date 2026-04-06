using System.ComponentModel.DataAnnotations;

namespace SpotTheTop.Core.DTOs
{
    public class PositionCreateDto
    {
        [Required, MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(4)]
        public string Abbreviation { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string Category { get; set; } = string.Empty; // Напр. "Forward", "Midfielder"
    }
}
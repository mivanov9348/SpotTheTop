namespace SpotTheTop.Core.DTOs
{
    using System.ComponentModel.DataAnnotations;

    public class PlayerCreateDto
    {
        [Required, MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        public DateTime DateOfBirth { get; set; }

        [Required]
        public int PositionId { get; set; }

        public int? TeamId { get; set; }
    }
}
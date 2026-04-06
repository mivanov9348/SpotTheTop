namespace SpotTheTop.Core.DTOs
{
    using System.ComponentModel.DataAnnotations;

    public class LeagueCreateDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Country { get; set; } = string.Empty;
    }
}
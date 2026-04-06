namespace SpotTheTop.Core.DTOs
{
    using System.ComponentModel.DataAnnotations;

    public class TeamCreateDto
    {
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string Stadium { get; set; } = string.Empty;

        [Required]
        public int LeagueId { get; set; }
    }
}
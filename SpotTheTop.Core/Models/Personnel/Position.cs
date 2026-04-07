namespace SpotTheTop.Core.Models
{
    using System.ComponentModel.DataAnnotations;
    public class Position
    {
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(4)]
        public string Abbreviation { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string Category { get; set; } = string.Empty;

        public ICollection<Player> Players { get; set; } = new List<Player>();
    }
}
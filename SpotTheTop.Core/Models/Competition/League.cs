namespace SpotTheTop.Core.Models
{
    using SpotTheTop.Core.Models;
    using System.ComponentModel.DataAnnotations;
    public class League
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Country { get; set; } = string.Empty;

        public ICollection<Team> Teams { get; set; } = new List<Team>();

        // ТОВА ЛИПСВАШЕ:
        public ICollection<Season> Seasons { get; set; } = new List<Season>();
    }
}
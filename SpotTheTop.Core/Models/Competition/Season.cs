namespace SpotTheTop.Core.Models
{
    using System.ComponentModel.DataAnnotations;
    public class Season
    {
        public int Id { get; set; }

        [Required, MaxLength(20)]
        public string Name { get; set; } = string.Empty; 

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; } = true;

        public int LeagueId { get; set; }
        public League League { get; set; } = null!;

        public ICollection<Match> Matches { get; set; } = new List<Match>();
    }
}
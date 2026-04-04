namespace SpotTheTop.Core.Entities
{
    using System.ComponentModel.DataAnnotations;

    public class Team
    {
        public int Id { get; set; }

        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string Stadium { get; set; } = string.Empty;

        public bool IsApproved { get; set; } = false;

        public string ManagerUserId { get; set; } = string.Empty;

        public int LeagueId { get; set; }
        public League League { get; set; } = null!;

        public ICollection<Player> Players { get; set; } = new List<Player>();
    }
}
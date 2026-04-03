namespace SpotTheTop.Core.Entities
{
    using System.ComponentModel.DataAnnotations;
    public class Team
    {
        public int Id { get; set; }

        [Required, MaxLength(150)]
        public string Name { get; set; }

        public string City { get; set; }
        public string Stadium { get; set; }

        public bool IsApproved { get; set; } = false;

        public ICollection<Player> Players { get; set; } = new List<Player>();
    }
}
namespace SpotTheTop.Core.Entities
{
    using System.ComponentModel.DataAnnotations;
    public class Player
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string FirstName { get; set; }

        [Required, MaxLength(100)]
        public string LastName { get; set; }

        public DateTime DateOfBirth { get; set; }
        public string Position { get; set; } 

        public int? TeamId { get; set; }
        public Team Team { get; set; }

        public bool IsApproved { get; set; } = false;

        public string AddedByUserId { get; set; }

        public ICollection<ScoutingReport> Reports { get; set; } = new List<ScoutingReport>();
    }
}
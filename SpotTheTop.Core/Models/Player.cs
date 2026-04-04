
namespace SpotTheTop.Core.Entities
{
    using System.ComponentModel.DataAnnotations;

    public class Player
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        public DateTime DateOfBirth { get; set; }

        public int PositionId { get; set; }
        public Position Position { get; set; } = null!; 

        public int? TeamId { get; set; }
        public Team? Team { get; set; } 

        public bool IsApproved { get; set; } = false;

        public string AddedByUserId { get; set; } = string.Empty;

        // public ICollection<ScoutingReport> Reports { get; set; } = new List<ScoutingReport>();
    }
}
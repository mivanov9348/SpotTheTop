namespace SpotTheTop.Core.DTOs
{
    public class PlayerResponseDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Position { get; set; } = string.Empty;

        public int? TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty; 

        public bool IsApproved { get; set; }
        public string AddedBy { get; set; } = string.Empty;

        public int TotalGoals { get; set; }
        public int TotalAssists { get; set; }

        public int? HeightCm { get; set; }
        public string? PreferredFoot { get; set; }
    }
}
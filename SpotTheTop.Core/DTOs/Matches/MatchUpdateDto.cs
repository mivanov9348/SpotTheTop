namespace SpotTheTop.Core.DTOs
{       

    public class MatchUpdateDto
    {
        public int? HomeScore { get; set; }
        public int? AwayScore { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
namespace SpotTheTop.Core.DTOs.Leagues
{
    public class MatchUpdateDto
    {
        public int HomeScore { get; set; }
        public int AwayScore { get; set; }
        public string Status { get; set; } = "Finished";
    }
}
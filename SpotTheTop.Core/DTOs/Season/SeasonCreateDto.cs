namespace SpotTheTop.Core.DTOs.Season
{
    public class SeasonCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public int LeagueId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
    }
}

namespace SpotTheTop.Core.DTOs.Season
{
    public class SeasonCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public List<int> LeagueIds { get; set; } = new List<int>();
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
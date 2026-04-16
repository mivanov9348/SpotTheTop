namespace SpotTheTop.Core.DTOs
{
    using System;
    using System.ComponentModel.DataAnnotations;
    public class MatchCreateDto
    {
        [Required]
        public int LeagueId { get; set; }
        [Required]
        public int SeasonId { get; set; }
        [Required]
        public int Round { get; set; }
        [Required]
        public int HomeTeamId { get; set; }
        [Required]
        public int AwayTeamId { get; set; }
        [Required]
        public DateTime MatchDate { get; set; }
    }

   
}
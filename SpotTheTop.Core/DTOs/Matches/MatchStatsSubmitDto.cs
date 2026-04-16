namespace SpotTheTop.Core.DTOs // Или SpotTheTop.Core.DTOs.Matches
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    public class MatchPlayerStatDto
    {
        [Required] public int PlayerId { get; set; }
        [Required] public int TeamId { get; set; }
        public int MinutesPlayed { get; set; }
        public int Goals { get; set; }
        public int Assists { get; set; }
        public int YellowCards { get; set; }
        public bool IsRedCard { get; set; }

        // Разширени (опционални)
        public int? Shots { get; set; }
        public int? ShotsOnTarget { get; set; }
        public int? ChancesCreated { get; set; }
        public int? DribblesCompleted { get; set; }
        public int? PassesCompleted { get; set; }
        public int? PassAccuracyPercent { get; set; }
        public int? Crosses { get; set; }
        public int? TacklesWon { get; set; }
        public int? Interceptions { get; set; }
        public int? Clearances { get; set; }
        public int? Blocks { get; set; }
        public bool IsCleanSheet { get; set; }
        public int? Saves { get; set; }
        public int? GoalsConceded { get; set; }
        public int? FoulsCommitted { get; set; }
        public int? FoulsDrawn { get; set; }
    }

    // 2. Събитие по време на мача (Timeline)
    public class MatchEventDto
    {
        public int Minute { get; set; }
        public int? ExtraMinute { get; set; }
        [Required] public string EventType { get; set; } = string.Empty;
        public int TeamId { get; set; }
        public int? PrimaryPlayerId { get; set; }
        public int? SecondaryPlayerId { get; set; }
        public string? Notes { get; set; }
    }

    // 3. Пълният пакет, който React изпраща към сървъра при Save (ЗАМЕСТВА СТАРИЯ MatchStatsSubmitDto)
    public class MatchFullSaveDto
    {
        public List<MatchPlayerStatDto> PlayerStats { get; set; } = new List<MatchPlayerStatDto>();
        public List<MatchEventDto> Events { get; set; } = new List<MatchEventDto>();
    }

    // 4. DTO за извличане на данните, когато модалът се отвори
    public class MatchDetailsForEditDto
    {
        public int HomeTeamId { get; set; }
        public int AwayTeamId { get; set; }
        public List<MatchPlayerBasicDto> HomePlayers { get; set; } = new();
        public List<MatchPlayerBasicDto> AwayPlayers { get; set; } = new();
        public List<MatchPlayerStatDto> ExistingStats { get; set; } = new();
        public List<MatchEventDto> ExistingEvents { get; set; } = new();
    }

    public class MatchPlayerBasicDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
    }
}
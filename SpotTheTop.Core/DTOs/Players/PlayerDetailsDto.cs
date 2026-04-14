namespace SpotTheTop.Core.DTOs.Players
{
    public class PlayerDetailsDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public int Age { get; set; }
        public string DateOfBirthFormatted { get; set; } = string.Empty;
        public string PositionName { get; set; } = string.Empty;
        public string PositionCategory { get; set; } = string.Empty;
        public string TeamName { get; set; } = string.Empty;
        public string? LeagueName { get; set; }

        public int? HeightCm { get; set; }
        public int? WeightKg { get; set; }
        public string? PreferredFoot { get; set; }
        public string Nationality { get; set; } = string.Empty;
        public decimal? MarketValueEuro { get; set; }

        public int TotalMatchesPlayed { get; set; }
        public int TotalMinutesPlayed { get; set; }
        public int TotalGoals { get; set; }
        public int TotalAssists { get; set; }
        public int TotalYellowCards { get; set; }
        public int TotalRedCards { get; set; }

        public int? TotalShots { get; set; }
        public int? TotalShotsOnTarget { get; set; }
        public int? TotalChancesCreated { get; set; }
        public int? TotalDribblesCompleted { get; set; }
        public int? TotalPassesCompleted { get; set; }
        public int? AveragePassAccuracy { get; set; }
        public int? TotalTacklesWon { get; set; }
        public int? TotalInterceptions { get; set; }
        public int? TotalClearances { get; set; }
        public int? TotalCleanSheets { get; set; }
        public int? TotalSaves { get; set; }
    }
}
namespace SpotTheTop.Core.DTOs.Players
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

        public int? HeightCm { get; set; }
        public string? PreferredFoot { get; set; }

        // --- Core Stats ---
        public int MatchesPlayed { get; set; }
        public int MinutesPlayed { get; set; }
        public int TotalGoals { get; set; }
        public int TotalAssists { get; set; }
        public int TotalYellowCards { get; set; }
        public int TotalRedCards { get; set; }

        // --- Advanced Stats (Nullable) ---
        public int? TotalShots { get; set; }
        public int? TotalChancesCreated { get; set; }
        public int? TotalPassesCompleted { get; set; }
        public int? AveragePassAccuracy { get; set; }
        public int? TotalTacklesWon { get; set; }
        public int? TotalCleanSheets { get; set; }
        public int? TotalSaves { get; set; }
    }
}
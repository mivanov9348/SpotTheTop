namespace SpotTheTop.Core.Entities
{
    using System.ComponentModel.DataAnnotations;

    public class Match
    {
        public int Id { get; set; }

        // Домакин
        public int HomeTeamId { get; set; }
        public Team HomeTeam { get; set; } = null!;

        // Гост
        public int AwayTeamId { get; set; }
        public Team AwayTeam { get; set; } = null!;

        public DateTime MatchDate { get; set; }

        [MaxLength(10)]
        public string? Result { get; set; } // Пример: "2-1" (може да е null, ако мачът предстои)

        // В този мач може да са скаутвани много играчи
        public ICollection<ScoutingReport> ScoutingReports { get; set; } = new List<ScoutingReport>();
    }
}
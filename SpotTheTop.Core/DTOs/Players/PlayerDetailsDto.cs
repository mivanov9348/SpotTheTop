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

        public string? TeamName { get; set; }
        public string? LeagueName { get; set; }

        // По-късно тук ще добавим и списък със Scouting Reports!
    }
}
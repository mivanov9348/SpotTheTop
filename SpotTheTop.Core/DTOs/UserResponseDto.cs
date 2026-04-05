namespace SpotTheTop.Core.DTOs
{
    public class UserResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public IList<string> CurrentRoles { get; set; } = new List<string>();
        public string? RequestedRole { get; set; }
        public string? RequestedTeamId { get; set; } 
    }
}
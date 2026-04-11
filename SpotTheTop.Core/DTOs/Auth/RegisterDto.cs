namespace SpotTheTop.Core.DTOs.Auth
{
    using System.ComponentModel.DataAnnotations;

    public class RegisterDto
    {
        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Username { get; set; } = string.Empty; 

        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty;

        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        public int? ClaimedPlayerId { get; set; }
        public int? TeamId { get; set; }
    }
}
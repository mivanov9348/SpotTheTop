namespace SpotTheTop.Core.DTOs.Auth
{
    using System.ComponentModel.DataAnnotations;
    public class LoginDto
    {
        [Required]
        public string UsernameOrEmail { get; set; } = string.Empty; 

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
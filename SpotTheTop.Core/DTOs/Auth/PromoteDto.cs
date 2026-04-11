namespace SpotTheTop.Core.DTOs.Auth
{
    using System.ComponentModel.DataAnnotations;
    public class PromoteDto
    {
        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string TargetRole { get; set; } = string.Empty;
    }
}
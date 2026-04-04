namespace SpotTheTop.Core.DTOs
{
    using System.ComponentModel.DataAnnotations;
    public class PromoteDto
    {
        [Required]
        public string Email { get; set; } = string.Empty;
    }
}
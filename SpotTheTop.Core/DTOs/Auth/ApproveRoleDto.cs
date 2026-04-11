namespace SpotTheTop.Core.DTOs.Auth
{
    using System.ComponentModel.DataAnnotations;

    public class ApproveRoleDto
    {
        [Required]
        public string Email { get; set; } = string.Empty;
    }
}
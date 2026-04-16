namespace SpotTheTop.Services
{
    using SpotTheTop.Core.DTOs.Auth;
    using System.Threading.Tasks;
    public interface IAuthService
    {
        Task<object?> LoginAsync(LoginDto model);
        Task<object?> RegisterAsync(RegisterDto model);
        Task<object> GetPendingRolesAsync();
        Task<string?> ApproveRoleAsync(ApproveRoleDto model);
        Task<string?> PromoteUserAsync(PromoteDto model, bool isCallerSuperAdmin, bool isCallerAdmin);
        Task<string?> DemoteUserAsync(PromoteDto model, bool isCallerSuperAdmin, bool isCallerAdmin);
        Task<object> GetAllUsersAsync();
    }
}
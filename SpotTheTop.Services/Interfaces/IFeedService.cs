namespace SpotTheTop.Services
{
    using System.Threading.Tasks;

    public interface IFeedService
    {
        Task<object> GetPostsAsync(string currentUserId);
        Task CreatePostAsync(string content, string currentUserId, string currentUserRole);
        Task<bool> AddCommentAsync(int postId, string content, string currentUserId);
        Task<bool> ToggleLikeAsync(int postId, string currentUserId);
        Task<bool> DeletePostAsync(int postId, string currentUserId, bool isAdmin);
        Task<bool> DeleteCommentAsync(int commentId, string currentUserId, bool isAdmin);
    }
}
namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;
    using System;
    using System.Linq;
    using System.Security.Claims;
    using System.Threading.Tasks;
    public class FeedActionDto { public string Content { get; set; } = string.Empty; }

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FeedController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FeedController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetPosts()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.Name);

            var posts = await _context.Posts
                .Include(p => p.Comments)
                .Include(p => p.Likes)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.Id,
                    p.Content,
                    p.CreatedAt,
                    p.AuthorUserId,
                    p.AuthorRole,
                    LikesCount = p.Likes.Count,
                    HasLiked = p.Likes.Any(l => l.UserId == currentUserId),
                    Comments = p.Comments.OrderBy(c => c.CreatedAt).Select(c => new
                    {
                        c.Id,
                        c.Content,
                        c.AuthorUserId,
                        c.CreatedAt
                    })
                })
                .ToListAsync();

            return Ok(posts);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePost([FromBody] FeedActionDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content)) return BadRequest("Post cannot be empty.");

            var post = new Post
            {
                Content = dto.Content,
                AuthorUserId = User.FindFirstValue(ClaimTypes.Name) ?? "Unknown",
                AuthorRole = User.FindFirstValue(ClaimTypes.Role) ?? "User",
                CreatedAt = DateTime.UtcNow
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("{postId}/comment")]
        public async Task<IActionResult> AddComment(int postId, [FromBody] FeedActionDto dto)
        {
            var post = await _context.Posts.FindAsync(postId);
            if (post == null) return NotFound("Post not found.");

            var comment = new Comment
            {
                PostId = postId,
                Content = dto.Content,
                AuthorUserId = User.FindFirstValue(ClaimTypes.Name) ?? "Unknown",
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("{postId}/like")]
        public async Task<IActionResult> ToggleLike(int postId)
        {
            var post = await _context.Posts.FindAsync(postId);
            if (post == null) return NotFound("Post not found.");

            var userId = User.FindFirstValue(ClaimTypes.Name) ?? "Unknown";
            var existingLike = await _context.Likes.FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);

            if (existingLike != null)
            {
                _context.Likes.Remove(existingLike); 
            }
            else
            {
                _context.Likes.Add(new Like { PostId = postId, UserId = userId });
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        // 5. ИЗТРИВАНЕ НА ПОСТ (Само за Автор или Админ)
        [HttpDelete("{postId}")]
        public async Task<IActionResult> DeletePost(int postId)
        {
            var post = await _context.Posts.FindAsync(postId);
            if (post == null) return NotFound("Post not found.");

            var currentUserId = User.FindFirstValue(ClaimTypes.Name);
            bool isAdmin = User.IsInRole("SuperAdmin") || User.IsInRole("Admin") || User.IsInRole("Moderator");

            if (post.AuthorUserId != currentUserId && !isAdmin)
            {
                return Forbid("You do not have permission to delete this post.");
            }

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("comment/{commentId}")]
        public async Task<IActionResult> DeleteComment(int commentId)
        {
            var comment = await _context.Comments.FindAsync(commentId);
            if (comment == null) return NotFound("Comment not found.");

            var currentUserId = User.FindFirstValue(ClaimTypes.Name);
            bool isAdmin = User.IsInRole("SuperAdmin") || User.IsInRole("Admin") || User.IsInRole("Moderator");

            if (comment.AuthorUserId != currentUserId && !isAdmin)
            {
                return Forbid("You do not have permission to delete this comment.");
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using SpotTheTop.Core.DTOs;
    using SpotTheTop.Services;
    using System;
    using System.Security.Claims;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FeedController : ControllerBase
    {
        private readonly IFeedService _feedService;

        public FeedController(IFeedService feedService)
        {
            _feedService = feedService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPosts()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.Name) ?? "";
            var posts = await _feedService.GetPostsAsync(currentUserId);
            return Ok(posts);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePost([FromBody] FeedActionDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content)) return BadRequest("Post cannot be empty.");

            var currentUserId = User.FindFirstValue(ClaimTypes.Name) ?? "Unknown";
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role) ?? "User";

            await _feedService.CreatePostAsync(dto.Content, currentUserId, currentUserRole);
            return Ok();
        }

        [HttpPost("{postId}/comment")]
        public async Task<IActionResult> AddComment(int postId, [FromBody] FeedActionDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content)) return BadRequest("Comment cannot be empty.");

            var currentUserId = User.FindFirstValue(ClaimTypes.Name) ?? "Unknown";
            var success = await _feedService.AddCommentAsync(postId, dto.Content, currentUserId);

            if (!success) return NotFound("Post not found.");
            return Ok();
        }

        [HttpPost("{postId}/like")]
        public async Task<IActionResult> ToggleLike(int postId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.Name) ?? "Unknown";
            var success = await _feedService.ToggleLikeAsync(postId, currentUserId);

            if (!success) return NotFound("Post not found.");
            return Ok();
        }

        [HttpDelete("{postId}")]
        public async Task<IActionResult> DeletePost(int postId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.Name) ?? "";
            bool isAdmin = User.IsInRole("SuperAdmin") || User.IsInRole("Admin") || User.IsInRole("Moderator");

            try
            {
                var success = await _feedService.DeletePostAsync(postId, currentUserId, isAdmin);
                if (!success) return NotFound("Post not found.");
                return Ok();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        [HttpDelete("comment/{commentId}")]
        public async Task<IActionResult> DeleteComment(int commentId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.Name) ?? "";
            bool isAdmin = User.IsInRole("SuperAdmin") || User.IsInRole("Admin") || User.IsInRole("Moderator");

            try
            {
                var success = await _feedService.DeleteCommentAsync(commentId, currentUserId, isAdmin);
                if (!success) return NotFound("Comment not found.");
                return Ok();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }
    }
}
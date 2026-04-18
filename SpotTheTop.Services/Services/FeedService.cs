namespace SpotTheTop.Services
{
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Api.Interfaces;
    using SpotTheTop.Core.Models;
    using SpotTheTop.Data;
    using System;
    using System.Linq;
    using System.Text.RegularExpressions;
    using System.Threading.Tasks;

    public class FeedService : IFeedService
    {
        private readonly ApplicationDbContext _context;

        public FeedService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetPostsAsync(string currentUserId)
        {
            return await _context.Posts
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
        }

        public async Task CreatePostAsync(string content, string authorUserId, string authorRole)
        {
            var post = new Post
            {
                Content = content,
                AuthorUserId = authorUserId,
                AuthorRole = authorRole,
                CreatedAt = DateTime.UtcNow
            };

            _context.Posts.Add(post);

            await ProcessTagsAndNotifyAsync(content, authorUserId, $"/feed", $"tagged you in a new post!");
        }

        public async Task<bool> AddCommentAsync(int postId, string content, string authorUserId)
        {
            var post = await _context.Posts.FindAsync(postId);
            if (post == null) return false;

            var comment = new Comment
            {
                PostId = postId,
                Content = content,
                AuthorUserId = authorUserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);

            // НОВО: Нотификация за автора на поста (ако не коментира собствения си пост)
            if (post.AuthorUserId != authorUserId)
            {
                _context.Notifications.Add(new Notification
                {
                    TargetUserId = post.AuthorUserId,
                    Content = $"**{authorUserId}** commented on your post.",
                    LinkUrl = "/feed",
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            // НОВО: Сканираме за тагове в коментара
            await ProcessTagsAndNotifyAsync(content, authorUserId, "/feed", "tagged you in a comment!");

            return true;
        }

        // ПОМОЩЕН МЕТОД ЗА ТАГОВЕТЕ
        private async Task ProcessTagsAndNotifyAsync(string content, string authorUserId, string linkUrl, string actionText)
        {
            // Намира всички думи, започващи с @ (напр. @Pesho, @Ivan123)
            var matches = Regex.Matches(content, @"@([A-Za-z0-9_]+)");

            var taggedUsers = matches.Select(m => m.Groups[1].Value).Distinct().ToList();

            foreach (var taggedUser in taggedUsers)
            {
                if (taggedUser.Equals(authorUserId, StringComparison.OrdinalIgnoreCase)) continue;

                _context.Notifications.Add(new Notification
                {
                    TargetUserId = taggedUser,
                    Content = $"**{authorUserId}** {actionText}",
                    LinkUrl = linkUrl,
                    CreatedAt = DateTime.UtcNow
                });
            }

            if (taggedUsers.Any())
            {
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ToggleLikeAsync(int postId, string currentUserId)
        {
            var post = await _context.Posts.FindAsync(postId);
            if (post == null) return false;

            var existingLike = await _context.Likes.FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == currentUserId);

            if (existingLike != null)
            {
                _context.Likes.Remove(existingLike);
            }
            else
            {
                _context.Likes.Add(new Like { PostId = postId, UserId = currentUserId });
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletePostAsync(int postId, string currentUserId, bool isAdmin)
        {
            var post = await _context.Posts.FindAsync(postId);
            if (post == null) return false;

            if (post.AuthorUserId != currentUserId && !isAdmin)
            {
                throw new UnauthorizedAccessException("You do not have permission to delete this post.");
            }

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCommentAsync(int commentId, string currentUserId, bool isAdmin)
        {
            var comment = await _context.Comments.FindAsync(commentId);
            if (comment == null) return false;

            if (comment.AuthorUserId != currentUserId && !isAdmin)
            {
                throw new UnauthorizedAccessException("You do not have permission to delete this comment.");
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
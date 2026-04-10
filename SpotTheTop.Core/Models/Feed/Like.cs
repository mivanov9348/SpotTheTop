namespace SpotTheTop.Core.Models
{
    public class Like
    {
        public int Id { get; set; }

        public int PostId { get; set; }
        public Post Post { get; set; } = null!;

        public string UserId { get; set; } = string.Empty; 
    }
}
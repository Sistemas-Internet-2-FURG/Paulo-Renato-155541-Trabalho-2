namespace BlogSPI.Api.Models;

public class Post
{
    public int Id { get; set; }
    
    public DateTime TimeStamp { get; set; }
    public required string Title { get; set; } = String.Empty;
    public required string Content { get; set; } = String.Empty;
    
    public int UserId { get; set; }
    public User User { get; set; }
}
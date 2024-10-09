namespace BlogSPI.Api.Models.DTOs;

public class PostDto
{
    public required string Title { get; set; } = String.Empty;
    public required string Content { get; set; } = String.Empty;
}
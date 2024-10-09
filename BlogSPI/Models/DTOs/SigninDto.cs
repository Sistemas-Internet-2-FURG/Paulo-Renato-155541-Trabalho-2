namespace BlogSPI.Api.Models.DTOs;

public class SigninDto
{
    public required string Username { get; set; }
    
    public required string Password { get; set; }
}
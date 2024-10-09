using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace BlogSPI.Api.Models;

public class User
{
    public int Id { get; set; }
    
    public string Username { get; set; }

    public required string Password { get; set; }
    
    public ICollection<Post> Posts { get; } = new List<Post>();
}
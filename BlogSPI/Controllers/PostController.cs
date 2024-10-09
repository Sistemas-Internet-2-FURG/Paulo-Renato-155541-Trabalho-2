using BlogSPI.Api.Data;
using BlogSPI.Api.Models;
using BlogSPI.Api.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogSPI.Api.Controllers;

[ApiController]
[Route("api/post")]
public class PostController : ControllerBase
{
    private readonly AppDbContext _context;

    public PostController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    [Authorize]
    public IActionResult GetAllPosts()
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id");

        if (userIdClaim == null)
        {
            return Unauthorized("Invalid token.");
        }

        int userId = int.Parse(userIdClaim.Value);

        var posts = _context.Posts.Where(p => p.UserId == userId).ToList();
        
        return Ok(posts);
    }
    
    

    // GET: api/Post/5
    [HttpGet("{id}")]
    public IActionResult GetPost(int id)
    {
        var post = _context.Posts.Find(id);
        
        if (post == null)
        {
            return NotFound();
        }

        return Ok(post);
    }

    // PUT: api/Post/5
    [HttpPut("{id}")]
    [Authorize]
    public IActionResult UpdatePost(int id, [FromBody] PostDto postDto)
    {
        var post = _context.Posts.Find(id);
        
        if (post == null)
        {
            return NotFound();
        }

        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id");
        if (userIdClaim == null || int.Parse(userIdClaim.Value) != post.UserId)
        {
            return Forbid();
        }

        post.Title = postDto.Title;
        post.Content = postDto.Content;
        // Note: Geralmente não atualizamos o TimeStamp em uma edição

        _context.SaveChanges();

        return Ok(post);
    }

    // DELETE: api/Post/5
    [HttpDelete("{id}")]
    [Authorize]
    public IActionResult DeletePost(int id)
    {
        var post = _context.Posts.Find(id);
        
        if (post == null)
        {
            return NotFound();
        }

        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id");
        if (userIdClaim == null || int.Parse(userIdClaim.Value) != post.UserId)
        {
            return Forbid();
        }

        _context.Posts.Remove(post);
        _context.SaveChanges();

        return NoContent();
    }

    [HttpPost]
    [Authorize] // Garante que o usuário está autenticado
    public IActionResult CreatePost([FromBody] PostDto postDto)
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id");

        if (userIdClaim == null)
        {
            return Unauthorized("Invalid token.");
        }

        int userId = int.Parse(userIdClaim.Value);

        var newPost = new Post
        {
            Title = postDto.Title,
            Content = postDto.Content,
            TimeStamp = DateTime.UtcNow,
            UserId = userId
        };

        _context.Posts.Add(newPost);
        _context.SaveChanges();

        return StatusCode(201, newPost);
    }
}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.DTOs.Task;
using TaskManager.Application.Interfaces;

namespace TaskManager.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TasksController(ITaskService taskService) : ControllerBase
{
    private readonly ITaskService _taskService = taskService;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] bool? isCompleted,
        [FromQuery] string? sortBy)
    {
        var tasks = await this._taskService.GetAllAsync(search, isCompleted, sortBy);
        return this.Ok(tasks);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var task = await this._taskService.GetByIdAsync(id);

        if (task == null)
            return this.NotFound("Task not found");

        return this.Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> Create(TaskCreateDto dto)
    {
        try
        {
            var createdTask = await this._taskService.CreateAsync(dto);
            return this.CreatedAtAction(nameof(GetById), new { id = createdTask.Id }, createdTask);
        }
        catch (ArgumentException ex)
        {
            return this.BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, TaskUpdateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return this.BadRequest("Title is required");

        var updated = await this._taskService.UpdateAsync(id, dto);

        if (!updated)
            return this.NotFound("Task not found");

        return this.NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await this._taskService.DeleteAsync(id);

        if (!deleted)
            return this.NotFound("Task not found");

        return this.NoContent();
    }
}
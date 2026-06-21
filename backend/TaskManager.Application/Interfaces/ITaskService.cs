using TaskManager.Application.DTOs.Task;

namespace TaskManager.Application.Interfaces;

public interface ITaskService
{
    Task<List<TaskResponseDto>> GetAllAsync(string? search, bool? isCompleted, string? sortBy);
    Task<TaskResponseDto?> GetByIdAsync(int id);
    Task<TaskResponseDto> CreateAsync(TaskCreateDto dto);
    Task<bool> UpdateAsync(int id, TaskUpdateDto dto);
    Task<bool> DeleteAsync(int id);
}
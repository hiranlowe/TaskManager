using Microsoft.AspNetCore.Mvc;
using Moq;
using TaskManager.Api.Controllers;
using TaskManager.Application.DTOs.Task;
using TaskManager.Application.Interfaces;
using Xunit;

namespace TaskManager.Application.Tests;

public class TasksControllerTests
{
    private readonly Mock<ITaskService> _taskServiceMock = new();

    [Fact]
    public async Task GetById_ReturnsNotFoundWhenTaskDoesNotExist()
    {
        this._taskServiceMock
            .Setup(service => service.GetByIdAsync(1))
            .ReturnsAsync((TaskResponseDto?)null);

        var controller = new TasksController(this._taskServiceMock.Object);

        var result = await controller.GetById(1);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Task not found", notFound.Value);
    }

    [Fact]
    public async Task Create_ReturnsBadRequestWhenTitleIsInvalid()
    {
        this._taskServiceMock
            .Setup(service => service.CreateAsync(It.IsAny<TaskCreateDto>()))
            .ThrowsAsync(new ArgumentException("Title is required"));

        var controller = new TasksController(this._taskServiceMock.Object);

        var result = await controller.Create(new TaskCreateDto { Title = " " });

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Title is required", badRequest.Value);
    }

    [Fact]
    public async Task Update_ReturnsNoContentWhenUpdateSucceeds()
    {
        this._taskServiceMock
            .Setup(service => service.UpdateAsync(7, It.IsAny<TaskUpdateDto>()))
            .ReturnsAsync(true);

        var controller = new TasksController(this._taskServiceMock.Object);

        var result = await controller.Update(7, new TaskUpdateDto { Title = "Updated" });

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNotFoundWhenTaskDoesNotExist()
    {
        this._taskServiceMock
            .Setup(service => service.DeleteAsync(9))
            .ReturnsAsync(false);

        var controller = new TasksController(this._taskServiceMock.Object);

        var result = await controller.Delete(9);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Task not found", notFound.Value);
    }
}
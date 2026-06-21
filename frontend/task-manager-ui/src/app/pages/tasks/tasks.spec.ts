import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Tasks } from './tasks';
import { TaskService } from '../../services/task';
import { Task } from '../../models/task';
import { AuthService } from '../../services/auth';

const mockTask: Task = {
  id: 1,
  title: 'Test task',
  description: 'Desc',
  isCompleted: false,
  dueDate: '2026-07-01T00:00:00',
  createdAt: '2026-06-20T00:00:00'
};

const taskServiceMock = {
  getTasks: vi.fn().mockReturnValue(of([])),
  createTask: vi.fn().mockReturnValue(of({})),
  updateTask: vi.fn().mockReturnValue(of({})),
  deleteTask: vi.fn().mockReturnValue(of({}))
};

const authServiceMock = {
  clearAuthToken: vi.fn()
};

const routerMock = {
  navigate: vi.fn()
};

describe('Tasks', () => {
  let component: Tasks;
  let fixture: ComponentFixture<Tasks>;

  beforeEach(async () => {
    vi.clearAllMocks();
    taskServiceMock.getTasks.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [Tasks],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: routerMock },
        { provide: TaskService, useValue: taskServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Tasks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hasTasks is false when tasks signal is empty', () => {
    expect(component.hasTasks).toBe(false);
  });

  it('hasTasks is true when tasks signal has items', () => {
    component.tasks.set([mockTask]);
    expect(component.hasTasks).toBe(true);
  });

  it('hasNoTasks is the inverse of hasTasks', () => {
    expect(component.hasNoTasks).toBe(true);
    component.tasks.set([mockTask]);
    expect(component.hasNoTasks).toBe(false);
  });

  it('calls getTasks on init with empty filters', () => {
    expect(taskServiceMock.getTasks).toHaveBeenCalledWith('', '', '');
  });

  it('sets tasks signal from API response', () => {
    taskServiceMock.getTasks.mockReturnValue(of([mockTask]));
    component.loadTasks();
    expect(component.tasks().length).toBe(1);
    expect(component.tasks()[0].title).toBe('Test task');
  });

  it('sets loadError on generic HTTP failure', () => {
    taskServiceMock.getTasks.mockReturnValue(throwError(() => ({ status: 500 })));
    component.loadTasks();
    expect(component.loadError()).toContain('Could not load tasks');
  });

  it('sets session-expired message on 401', () => {
    taskServiceMock.getTasks.mockReturnValue(throwError(() => ({ status: 401 })));
    component.loadTasks();
    expect(component.loadError()).toContain('session expired');
  });

  it('clears tasks and sets error message on failure', () => {
    component.tasks.set([mockTask]);
    taskServiceMock.getTasks.mockReturnValue(throwError(() => ({ status: 500 })));
    component.loadTasks();
    expect(component.tasks().length).toBe(0);
  });

  it('editTask populates form and sets selectedTaskId', () => {
    component.editTask(mockTask);
    expect(component.selectedTaskId).toBe(1);
    expect(component.taskForm.title).toBe('Test task');
    expect(component.taskForm.isCompleted).toBe(false);
  });

  it('editTask trims dueDate to date-only string', () => {
    component.editTask(mockTask);
    expect(component.taskForm.dueDate).toBe('2026-07-01');
  });

  it('resetForm clears selectedTaskId and form fields', () => {
    component.selectedTaskId = 5;
    component.taskForm = { title: 'Old', description: 'Old', dueDate: '2026-01-01', isCompleted: true };
    component.resetForm();
    expect(component.selectedTaskId).toBeNull();
    expect(component.taskForm.title).toBe('');
    expect(component.taskForm.isCompleted).toBe(false);
  });

  it('clearFilters resets searchText, statusFilter and sortBy then reloads', () => {
    component.searchText = 'search';
    component.statusFilter = 'true';
    component.sortBy = 'title';
    component.clearFilters();
    expect(component.searchText).toBe('');
    expect(component.statusFilter).toBe('');
    expect(component.sortBy).toBe('');
    expect(taskServiceMock.getTasks).toHaveBeenCalledTimes(2); // once on init, once on clearFilters
  });

  it('logout clears the auth token and navigates to login', () => {
    component.logout();

    expect(authServiceMock.clearAuthToken).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});

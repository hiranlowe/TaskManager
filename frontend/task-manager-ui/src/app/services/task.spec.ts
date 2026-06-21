import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { APP_CONFIG } from '../config/app-config';
import { TaskService } from './task';
import { AuthService } from './auth';

const authMock = {
  getAuthHeader: vi.fn().mockReturnValue({ Authorization: 'Basic dXNlcjpwYXNz' })
};

const appConfigMock = {
  apiBaseUrl: 'https://localhost:7111'
};

describe('TaskService', () => {
  let service: TaskService;
  let http: HttpTestingController;

  const API = `${appConfigMock.apiBaseUrl}/api/tasks`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: appConfigMock },
        { provide: AuthService, useValue: authMock }
      ]
    });
    service = TestBed.inject(TaskService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getTasks sends GET to /api/tasks with no params by default', () => {
    service.getTasks().subscribe();
    const req = http.expectOne(API);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush([]);
  });

  it('getTasks passes search param when provided', () => {
    service.getTasks('my task').subscribe();
    const req = http.expectOne(r => r.url === API);
    expect(req.request.params.get('search')).toBe('my task');
    req.flush([]);
  });

  it('getTasks passes isCompleted param when provided', () => {
    service.getTasks('', 'true').subscribe();
    const req = http.expectOne(r => r.url === API);
    expect(req.request.params.get('isCompleted')).toBe('true');
    req.flush([]);
  });

  it('getTasks passes sortBy param when provided', () => {
    service.getTasks('', '', 'duedate').subscribe();
    const req = http.expectOne(r => r.url === API);
    expect(req.request.params.get('sortBy')).toBe('duedate');
    req.flush([]);
  });

  it('getTasks omits isCompleted param when empty string', () => {
    service.getTasks('', '').subscribe();
    const req = http.expectOne(r => r.url === API);
    expect(req.request.params.has('isCompleted')).toBe(false);
    req.flush([]);
  });

  it('createTask sends POST with task body', () => {
    const body = { title: 'New task', description: 'Desc' };
    service.createTask(body).subscribe();
    const req = http.expectOne(API);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('updateTask sends PUT to /api/tasks/:id with body', () => {
    const body = { title: 'Updated', description: '', isCompleted: true };
    service.updateTask(3, body).subscribe();
    const req = http.expectOne(`${API}/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('deleteTask sends DELETE to /api/tasks/:id', () => {
    service.deleteTask(7).subscribe();
    const req = http.expectOne(`${API}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('all requests include the Authorization header', () => {
    service.getTasks().subscribe();
    const req = http.expectOne(API);
    expect(req.request.headers.get('Authorization')).toBe('Basic dXNlcjpwYXNz');
    req.flush([]);
  });
});

import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { APP_CONFIG } from '../config/app-config';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5195';

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } }
      ]
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login validates credentials before storing the token', () => {
    service.login('alice', 'secret').subscribe();

    const req = http.expectOne(`${apiBaseUrl}/api/tasks`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Basic ${btoa('alice:secret')}`);

    req.flush([], { status: 200, statusText: 'OK' });

    expect(localStorage.getItem('authToken')).toBe(btoa('alice:secret'));
  });

  it('login does not store the token when validation fails', () => {
    service.login('alice', 'wrong').subscribe({
      error: () => undefined
    });

    const req = http.expectOne(`${apiBaseUrl}/api/tasks`);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('authToken')).toBeNull();
  });

  it('getAuthHeader returns Basic Authorization header when token exists', () => {
    localStorage.setItem('authToken', btoa('alice:secret'));
    expect(service.getAuthHeader()['Authorization']).toBe(`Basic ${btoa('alice:secret')}`);
  });

  it('getAuthHeader returns empty object when no token', () => {
    expect(service.getAuthHeader()).toEqual({});
  });

  it('hasAuthToken returns true when a token exists', () => {
    localStorage.setItem('authToken', btoa('alice:secret'));
    expect(service.hasAuthToken()).toBe(true);
  });

  it('hasAuthToken returns false before login', () => {
    expect(service.hasAuthToken()).toBe(false);
  });

  it('clearAuthToken removes the stored token', () => {
    localStorage.setItem('authToken', 'token');
    service.clearAuthToken();
    expect(localStorage.getItem('authToken')).toBeNull();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { Login } from './login';
import { AuthService } from '../../services/auth';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: {
    login: ReturnType<typeof vi.fn>;
    clearAuthToken: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authService = {
      login: vi.fn(),
      clearAuthToken: vi.fn()
    };
    router = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('submits the form when Enter is pressed in the password field', () => {
    const usernameInput: HTMLInputElement = fixture.nativeElement.querySelector('#username');
    const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector('#password');

    authService.login.mockReturnValue(of(void 0));

    usernameInput.value = 'admin';
    usernameInput.dispatchEvent(new Event('input'));

    passwordInput.value = 'admin123';
    passwordInput.dispatchEvent(new Event('input'));

    passwordInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(authService.login).toHaveBeenCalledWith('admin', 'admin123');
    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('shows an error and does not navigate when credentials are invalid', () => {
    authService.login.mockReturnValue(throwError(() => ({ status: 401 })));

    const usernameInput: HTMLInputElement = fixture.nativeElement.querySelector('#username');
    const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector('#password');

    usernameInput.value = 'wrong';
    usernameInput.dispatchEvent(new Event('input'));

    passwordInput.value = 'credentials';
    passwordInput.dispatchEvent(new Event('input'));

    component.login();
    fixture.detectChanges();

    const alert: HTMLElement = fixture.nativeElement.querySelector('.error');

    expect(authService.clearAuthToken).toHaveBeenCalled();
    expect(component.errorMessage()).toBe('Login failed. Check your username or password and try again.');
    expect(alert.textContent).toContain('Login failed. Check your username or password and try again.');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('clears the error message when the user types again', () => {
    authService.login.mockReturnValue(throwError(() => ({ status: 401 })));

    const usernameInput: HTMLInputElement = fixture.nativeElement.querySelector('#username');
    const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector('#password');

    usernameInput.value = 'wrong';
    usernameInput.dispatchEvent(new Event('input'));

    passwordInput.value = 'credentials';
    passwordInput.dispatchEvent(new Event('input'));

    component.login();
    fixture.detectChanges();

    usernameInput.value = 'admin';
    usernameInput.dispatchEvent(new Event('input'));

    expect(component.errorMessage()).toBe('');
  });
});

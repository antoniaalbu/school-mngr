import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogService } from '../../logs/log.service';
import { LogActionType } from '../../logs/log-action-type.enum';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class LoginComponent implements OnInit {
  isLogin: boolean = true;
  name: string = '';
  email: string = '';
  password: string = '';
  role: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private logService: LogService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.role = params['role'];
      console.log('Role received:', this.role);
    });
  }

  toggleForm(): void {
    this.isLogin = !this.isLogin;
  }

  async onSubmit(): Promise<void> {
    if (this.isLogin) {
      await this.login();
    } else {
      await this.register();
    }
  }

  async login(): Promise<void> {
    try {
      const user = await this.authService.login(this.email, this.password);
      console.log('User logged in:', user);

      if (user) {
        const userProfile = await this.authService.getUserProfile(user.uid);
        const role = userProfile?.role;

        if (role) {
          console.log(`Logged in as ${role}`);

          await this.logService.logAction(
            user.uid,
            role,
            LogActionType.LOGIN,
            { email: this.email }
          );

          this.redirectBasedOnRole(role, user.uid);
        } else {
          console.log('Role not found in Firestore. Redirecting to login page.');

          await this.logService.logAction(
            user.uid,
            'unknown',
            LogActionType.LOGIN_FAILED,
            { reason: 'Role missing' }
          );

          this.router.navigate(['/auth']);
        }
      }
    } catch (error: any) {
      this.errorMessage = error.message;
      console.error('Login failed:', error.message);

      await this.logService.logAction(
        'unknown',
        'unknown',
        LogActionType.LOGIN_FAILED,
        { email: this.email, error: error.message }
      );
    }
  }

  

  async register(): Promise<void> {
    try {
      await this.authService.register(this.email, this.password, this.name, this.role);
      console.log('User registered successfully');
  
      const user = await firstValueFrom(this.authService.currentUser$);
        const uid = user?.uid;

        if (uid) {
          await this.logService.logAction(
            uid,
            this.role,
            LogActionType.REGISTER,
            {
              email: this.email,
              name: this.name,
              role: this.role
            }
          );
        }

    } catch (error: any) {
      console.error('Error registering user:', error);
  
      await this.logService.logAction(
        'unknown',
        this.role || 'unknown',
        LogActionType.REGISTER_FAILED,
        { email: this.email, name: this.name, error: error.message }
      );
    }
  }
  

  private async redirectBasedOnRole(role: string, userId: string): Promise<void> {
    const routeMap: { [key: string]: string } = {
      student: '/student',
      teacher: '/teacher',
      principal: '/principal'
    };

    const targetRoute = routeMap[role] || '/';

    await this.logService.logAction(
      userId,
      role,
      LogActionType.REDIRECT,
      { to: targetRoute }
    );

    this.router.navigate([targetRoute]);
  }
}

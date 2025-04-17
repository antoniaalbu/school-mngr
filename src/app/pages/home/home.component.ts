import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LogService } from '../../logs/log.service';
import { LogActionType } from '../../logs/log-action-type.enum';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(
    private router: Router,
    private logService: LogService,
    private authService: AuthService
  ) {}

  async goToLogin(role: string) {
    await this.logNavigation(role);
    this.router.navigate(['/auth'], { queryParams: { role } });
  }

  async goToSimpleLogin() {
    await this.logNavigation(); // fără rol specific
    this.router.navigate(['/auth']);
  }

  private async logNavigation(role?: string) {
    try {
      const user = await firstValueFrom(this.authService.currentUser$);
      if (user) {
        const userProfile = await this.authService.getUserProfile(user.uid);

        await this.logService.logAction(
          user.uid,
          userProfile.role,
          LogActionType.NAVIGATE_TO_AUTH,
          {
            role: role || 'not specified',
            from: 'home'
          }
        );
      } else {
        // Log anonim
        await this.logService.logAction(
          'anonymous',
          'guest',
          LogActionType.NAVIGATE_TO_AUTH,
          {
            role: role || 'not specified',
            from: 'home'
          }
        );
      }
    } catch (error) {
      console.error('Error logging navigation to login:', error);
    }
  }
}

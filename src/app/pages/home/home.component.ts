import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(
    private router: Router
  ) {}

  goToLogin(role: string) {
    this.router.navigate(['/auth'], { queryParams: { role } });
  }

  goToSimpleLogin() {
    this.router.navigate(['/auth']);
  }
  
}

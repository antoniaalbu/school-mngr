import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  isLogin: boolean = true;  // Flag to toggle between login and register form
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  // Method to toggle between login and register forms
  toggleForm(): void {
    this.isLogin = !this.isLogin;
  }

  // Method to handle form submission (login or register)
  onSubmit(): void {
    if (this.isLogin) {
      this.login(); // Login logic
    } else {
      this.register(); // Registration logic
    }
  }

  // Method to handle login
  login(): void {
    console.log('Logging in with:', this.email, this.password);
    // Add actual login logic here, e.g., call an AuthService to authenticate
  }

  // Method to handle registration
  register(): void {
    console.log('Registering with:', this.firstName, this.lastName, this.email, this.password);
    // Add actual registration logic here, e.g., call an AuthService to create the user
  }
}

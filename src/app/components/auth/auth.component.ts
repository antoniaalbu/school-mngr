import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) {}

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
  
      // Retrieve role from AuthService
      const role = this.authService.getRole();
      
      if (role) {
        console.log(`Logged in as ${role}`);
        
        // Now redirect based on the role
        this.redirectBasedOnRole(role);  // Pass the role here
      } else {
        console.log('Role is undefined. Redirecting to login page.');
        this.router.navigate(['/auth']);
      }
    } catch (error: any) {
      this.errorMessage = error.message;
      console.error('Login failed:', error.message);
    }
  }
  

  register(): void {
    this.authService.register(this.email, this.password, this.name, this.role) 
      .then(() => {
        console.log('User registered successfully');
      })
      .catch((error) => {
        console.error('Error registering user:', error);
      });
  }

  // Redirect the user based on their role
  private redirectBasedOnRole(role: string): void {
    if (role === 'student') {
      this.router.navigate(['/student']);  // Navigate to student dashboard
    } else if (role === 'teacher') {
      console.log("redirecting to teacher")
      this.router.navigate(['/teacher']);  // Navigate to teacher dashboard
    } else if (role === 'principal') {
      this.router.navigate(['/principal']);  // Navigate to principal dashboard
    } else {
      // Default redirect (if no valid role found)
      this.router.navigate(['/auth']);
    }
  }
}

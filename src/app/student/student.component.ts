import { Component, OnInit } from '@angular/core';
import { StudentService } from '../services/student.service';  
import { AuthService } from '../services/auth.service'; 
import { Observable } from 'rxjs';  
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class StudentComponent implements OnInit {
  courses$!: Observable<any[]>; 
  loading = true;
  error: string | null = null;  
  hasCourses = false;  
  activeView: string | null = null;
  username: string | undefined; 
  activeButton: string = '';

  constructor(private studentService: StudentService, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUserName$.subscribe(name => {
      this.username = name;
      console.log('Username:', this.username); 
    });

    this.authService.currentUser$.subscribe({
      next: (currentUser) => {
        if (currentUser) {
          console.log('Current User ID:', currentUser.uid);
        
          this.courses$ = this.studentService.getCourses(currentUser.uid); 
          this.courses$.subscribe({
            next: (courses) => {
              console.log('Courses fetched:', courses);  
              this.loading = false;  


              if (courses.length > 0) {
                this.hasCourses = true;  
              } else {
                this.hasCourses = false; 
                this.error = 'No courses assigned to this user.';  
              }
            },
            error: (err) => {
              console.error('Error fetching courses:', err);  
              this.error = 'Error occurred while fetching courses.';  
              this.loading = false;
            }
          });
        } else {
          console.log('No user is logged in.');
          this.error = 'Please log in to view courses.';  
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error in getting current user:', err); 
        this.error = 'Error occurred while fetching user data.'; 
        this.loading = false;
      }
    });
  }

  toggleActiveButton(button: string) {
    this.activeButton = button;
    this.activeView = button;  
  }
}

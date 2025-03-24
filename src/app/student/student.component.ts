import { Component, OnInit } from '@angular/core';
import { StudentService } from '../services/student.service';  // Import the service
import { AuthService } from '../services/auth.service';  // Import the AuthService to get current user
import { Observable } from 'rxjs';  // For observables
import { CommonModule } from '@angular/common';  // For CommonModule (used for *ngIf)

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class StudentComponent implements OnInit {
  courses$!: Observable<any[]>;  // Declare the observable for courses
  loading = true;  // A flag to show loading state
  error: string | null = null;  // To hold any error message
  hasCourses = false;  // To track whether the user has courses
  activeView: string | null = null;
  username: string | undefined;  // Property to hold the user's name
  activeButton: string = '';

  constructor(private studentService: StudentService, private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to the username observable from AuthService
    this.authService.currentUserName$.subscribe(name => {
      this.username = name;
      console.log('Username:', this.username); // Log the username
    });

    this.authService.currentUser$.subscribe({
      next: (currentUser) => {
        if (currentUser) {
          console.log('Current User ID:', currentUser.uid);  // Log the uid
          
          // Assign the observable from the service to the courses$ property if user is logged in
          this.courses$ = this.studentService.getCourses(currentUser.uid); // Pass the user id to fetch courses
          
          // Subscribe to courses$ observable to log the courses and check if they are assigned
          this.courses$.subscribe({
            next: (courses) => {
              console.log('Courses fetched:', courses);  // Log the courses
              this.loading = false;  // Set loading to false once the courses are fetched

              // Check if there are any courses assigned to the user
              if (courses.length > 0) {
                this.hasCourses = true;  // Set hasCourses to true if courses are found
              } else {
                this.hasCourses = false;  // Set hasCourses to false if no courses are found
                this.error = 'No courses assigned to this user.';  // Display error if no courses
              }
            },
            error: (err) => {
              console.error('Error fetching courses:', err);  // Log the error if any
              this.error = 'Error occurred while fetching courses.';  // Display error message
              this.loading = false;
            }
          });
        } else {
          console.log('No user is logged in.');
          this.error = 'Please log in to view courses.';  // Prompt the user to log in if no user is found
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error in getting current user:', err);  // Log error in fetching current user
        this.error = 'Error occurred while fetching user data.';  // Display error message
        this.loading = false;
      }
    });
  }

  toggleActiveButton(button: string) {
    // Set the active button
    this.activeButton = button;

    // Also set the active view based on the button clicked
    this.activeView = button;  // This will control which content to show
  }
}

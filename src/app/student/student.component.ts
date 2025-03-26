import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { loadStudentCourses, loadStudentCoursesSuccess, loadStudentCoursesFailure } from './store/student.actions';
import { selectCourses, selectLoading, selectError } from './store/student.selector';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { StudentService } from '../services/student.service';  // Import the service to get courses

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class StudentComponent implements OnInit {
  courses$!: Observable<any[]>; // Observable for courses
  loading$!: Observable<boolean>;  // Observable for loading state
  error$!: Observable<string | null>;  // Observable for error state
  hasCourses = false;
  activeView: string | null = null;
  username: string | undefined;
  activeButton: string = '';

  constructor(
    private store: Store,
    private authService: AuthService,
    private studentService: StudentService  
  ) {}

  ngOnInit(): void {
    // Subscribe to the username from AuthService
    this.authService.currentUserName$.subscribe(name => {
      this.username = name;
      console.log('Username:', this.username); // Log username
    });

    // Subscribe to the current user from AuthService to get their UID
    this.authService.currentUser$.subscribe({
      next: (currentUser) => {
        console.log('currentUser:', currentUser); // Log currentUser
        if (currentUser) {
          console.log('Current User ID:', currentUser.uid);

          // Dispatch action to load courses and set loading state
          this.store.dispatch(loadStudentCourses({ studentId: currentUser.uid }));
          console.log('Dispatched loadStudentCourses action for user:', currentUser.uid);
          this.store.dispatch(loadStudentCourses({ studentId: currentUser.uid }));


          // Directly use selectors to get courses, loading, and error states from the store
          this.courses$ = this.store.select(selectCourses);  // Automatically updates with store data
          this.loading$ = this.store.select(selectLoading);
          this.error$ = this.store.select(selectError);

          // Add logging to see the observable state for courses, loading, and error
          this.courses$.subscribe(courses => {
            console.log('Courses from the store selector:', courses);
          });

          this.loading$.subscribe(loading => {
            console.log('Loading state from the store:', loading);
          });

          this.error$.subscribe(error => {
            console.log('Error state from the store:', error);
          });

          // Optionally, fetch courses via the service and update the state via NgRx
          this.studentService.getCourses(currentUser.uid).subscribe({
            next: (courses) => {
              console.log('Courses fetched:', courses);
              console.log('✅ Dispatching loadStudentCoursesSuccess with:', courses);
              // Dispatch success action to update the state with courses
              this.store.dispatch(loadStudentCoursesSuccess({ courses }));
              
            },
            error: (err) => {
              console.error('Error fetching courses:', err);
              // Dispatch failure action to store the error
              this.store.dispatch(loadStudentCoursesFailure({ error: 'Error occurred while fetching courses.' }));
            }
          });
        } else {
          console.log('No user is logged in.');
          this.error$ = of('Please log in to view courses.');
        }
      },
      error: (err) => {
        console.error('Error in getting current user:', err);
        this.error$ = of('Error occurred while fetching user data.');
      }
    });
  }

  toggleActiveButton(button: string) {
    this.activeButton = button;
    this.activeView = button;
    console.log('Button pressed:', button); // Log the button press
  }
}

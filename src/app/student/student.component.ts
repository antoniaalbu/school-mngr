import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { loadStudentCourses, loadStudentCoursesSuccess, loadStudentCoursesFailure } from './store/student.actions';
import { selectCourses, selectLoading, selectError } from './store/student.selector';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { StudentService } from '../services/student.service'; 
@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class StudentComponent implements OnInit {
  courses$!: Observable<any[]>; 
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;
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
    this.authService.currentUserName$.subscribe(name => {
      this.username = name;
      console.log('Username:', this.username); 
    });

    this.authService.currentUser$.subscribe({
      next: (currentUser) => {
        console.log('currentUser:', currentUser); 
        if (currentUser) {
          console.log('Current User ID:', currentUser.uid);

          // Dispatch action to load the courses of the student
          this.store.dispatch(loadStudentCourses({ studentId: currentUser.uid }));
          
          // Fetch courses and teacher information from the service
          this.studentService.getCourses(currentUser.uid).subscribe({
            next: (courses) => {
              console.log('Courses fetched:', courses);
              this.store.dispatch(loadStudentCoursesSuccess({ courses }));
            },
            error: (err) => {
              console.error('Error fetching courses:', err);
              this.store.dispatch(loadStudentCoursesFailure({ error: 'Error occurred while fetching courses.' }));
            }
          });

          // Subscribe to courses$ observable from the store
          this.courses$ = this.store.select(selectCourses);
          this.loading$ = this.store.select(selectLoading);
          this.error$ = this.store.select(selectError);

          // Log the courses, loading, and error states for debugging
          this.courses$.subscribe(courses => {
            console.log('Courses from the store selector:', courses);
          });

          this.loading$.subscribe(loading => {
            console.log('Loading state from the store:', loading);
          });

          this.error$.subscribe(error => {
            console.log('Error state from the store:', error);
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
    console.log('Button pressed:', button); 
  }
}

import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { loadStudentCourses, loadStudentCoursesSuccess, loadStudentCoursesFailure, enrollInCourse } from './store/student.actions';
import { selectCourses, selectLoading, selectError } from './store/student.selector';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { StudentService } from './store/student.service'; 
import { Course } from '../teacher/models/teacher.state';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class StudentComponent implements OnInit {
  courses$!: Observable<any[]>; 
  availableCourses$!: Observable<any[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  hasCourses = false;
  activeView: string | null = null;
  username: string | undefined;
  activeButton: string = '';
  selectedCourse: any = null;
  manageView: string = '';
  userId: string | null = null;

  constructor(
    private store: Store,
    private authService: AuthService,
    private studentService: StudentService,
    private router: Router
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
          this.userId = currentUser.uid;
          
       
          this.store.dispatch(loadStudentCourses({ studentId: currentUser.uid }));
          
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

      
          this.courses$ = this.store.select(selectCourses);
          this.loading$ = this.store.select(selectLoading);
          this.error$ = this.store.select(selectError);
          
       
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

  selectCourse(course: any) {
    this.selectedCourse = course;
    console.log('Selected course:', course);
  }

  toggleActiveButton(button: string) {
    this.activeButton = button;
    this.activeView = button;
    console.log('Button pressed:', button);
    
    
    if (button === 'manageCourses') {
      this.manageView = '';
    }
  }
  
  setManageView(view: string) {
    this.manageView = view;
    console.log('Manage view set to:', view);
    
    if (view === 'available') {
      this.loadAvailableCourses();
    }
  }
  
  clearManageView() {
    this.manageView = '';
  }
  
  loadAvailableCourses() {
    if (this.userId) {
      this.availableCourses$ = this.studentService.getAvailableCourses(this.userId);
    }
  }

  onLogout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/']); 
    });
  }

  
  enrollInCourse(courseId: string): void {
    if (this.userId) {
      this.store.dispatch(enrollInCourse({ studentId: this.userId, courseId }));
    }
  }
  
  
  

  unenrollFromCourse(courseId: string) {
    if (this.userId) {
      this.studentService.unenrollFromCourse(this.userId, courseId).subscribe({
        next: () => {
          console.log('Successfully unenrolled from course:', courseId);

          this.loadAvailableCourses();
          if (this.userId) {
            this.studentService.getCourses(this.userId).subscribe(courses => {
              this.store.dispatch(loadStudentCoursesSuccess({ courses }));
            });
          }
        },
        error: (err) => {
          console.error('Error unenrolling from course:', err);
        }
      });
    }
  }
}
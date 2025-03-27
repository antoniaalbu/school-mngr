import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { loadStudents, loadCourses, addCourse, assignGrade } from './store/teacher.actions';
import { selectStudents, selectCourses, selectLoading, selectError, selectTeacher } from './store/teacher.selectors';
import { CommonModule } from '@angular/common';
import { Student, Course } from './models/teacher.state';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service'; // Import AuthService to get the current user info

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TeacherComponent implements OnInit {
  newCourse: Course = {
    id: '',
    name: '',
    teacherId: '' // Will be dynamically set from the authenticated user
  };

  students$: Observable<Student[]>;
  courses$: Observable<Course[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  teacher$: Observable<{ id: string; name: string } | null>;

  selectedStudentId: string | null = null;
  selectedCourseId: string | null = null;
  selectedGrade: number | null = null;

  teacherId: string | undefined;

  constructor(
    private store: Store,
    private authService: AuthService // Inject AuthService to get the current authenticated user's teacherId
  ) {
    this.students$ = this.store.select(selectStudents);
    this.courses$ = this.store.select(selectCourses);
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
    this.teacher$ = this.store.select(selectTeacher);
  }

  ngOnInit() {
    // Subscribe to the authenticated user's ID
    this.authService.currentUserUid$.subscribe(userId => {
      if (userId) {
        this.teacherId = userId; // Assign the teacherId from authenticated user
        this.loadData(); // Call method to load data once we have the teacher's ID
      }
    });
  }

  loadData() {
    if (this.teacherId) {
      // Dispatch actions with the correct teacherId
      this.store.dispatch(loadStudents({ userId: this.teacherId }));
      this.store.dispatch(loadCourses({ userId: this.teacherId }));
    }
  }

  onSubmit() {
    if (this.teacherId) {
      this.newCourse.teacherId = this.teacherId;
      this.store.dispatch(addCourse({ course: this.newCourse }));
      this.newCourse = { id: '', name: '', teacherId: '' };
    } else {
      console.log('Teacher is not authenticated.');
    }
  }

  gradeStudent(studentId: string | null, courseId: string | null, grade: number | null) {
    if (studentId && courseId && grade != null) {
      this.store.dispatch(assignGrade({
        studentId: studentId as string,
        courseId: courseId as string,
        grade: grade
      }));
    } else {
      console.log('Please select both a student, a course, and a grade.');
    }
  }
}

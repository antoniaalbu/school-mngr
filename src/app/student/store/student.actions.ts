import { createAction, props } from '@ngrx/store';
import { Course } from '../models/student.state';

// Action to load student-specific courses
export const loadStudentCourses = createAction(
  '[Student] Load Courses',
  props<{ studentId: string }>() // Pass the studentId to fetch their courses
);

// Action when courses are successfully loaded
export const loadStudentCoursesSuccess = createAction(
  '[Student] Load Courses Success',
  props<{ courses: Course[] }>()
);

// Action for when loading courses fails
export const loadStudentCoursesFailure = createAction(
  '[Student] Load Courses Failure',
  props<{ error: string }>()
);

import { createAction, props } from '@ngrx/store';
import { Course } from '../models/student.state';

export const loadStudentCourses = createAction(
  '[Student] Load Courses',
  props<{ studentId: string }>() 
);

export const loadStudentCoursesSuccess = createAction(
  '[Student] Load Courses Success',
  props<{ courses: Course[] }>()
);

export const loadStudentCoursesFailure = createAction(
  '[Student] Load Courses Failure',
  props<{ error: string }>()
);

export const enrollInCourse = createAction(
  '[Student] Enroll in Course',
  props<{ studentId: string, courseId: string }>()
);

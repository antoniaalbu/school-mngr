
import { createAction, props } from '@ngrx/store';
import { Student, Course } from '../models/teacher.state';

export const setTeacher = createAction(
  '[Teacher] Set Teacher',
  props<{ teacher: { id: string; name: string } | null }>()
);

export const loadStudents = createAction(
  '[Teacher] Load Students',
  props<{ userId: string }>()
);

export const loadStudentsSuccess = createAction(
  '[Teacher] Load Students Success',
  props<{ students: Student[] }>()
);

export const loadStudentsFailure = createAction(
  '[Teacher] Load Students Failure',
  props<{ error: string }>()
);


export const loadCourses = createAction(
  '[Teacher] Load Courses',
  props<{ userId: string }>()
);

export const loadCoursesSuccess = createAction(
  '[Teacher] Load Courses Success',
  props<{ courses: Course[] }>()
);

export const loadCoursesFailure = createAction(
  '[Teacher] Load Courses Failure',
  props<{ error: string }>()
);

export const assignGrade = createAction(
  '[Teacher] Assign Grade',
  props<{ studentId: string, courseId: string, grade: number }>()
);

export const addCourse = createAction(
  '[Teacher] Add Course',
  props<{ course: Course }>()
);

export const addCourseSuccess = createAction(
  '[Teacher] Add Course Success',
  props<{ course: Course }>()
);

export const addCourseFailure = createAction(
  '[Teacher] Add Course Failure',
  props<{ error: string }>()
);

export const updateGrade = createAction(
  '[Teacher] Update Grade',
  props<{ studentId: string; courseId: string; grade: number }>()
);

export const updateGradeSuccess = createAction(
  '[Teacher] Update Grade Success',
  props<{ studentId: string; courseId: string; grade: number }>()
);

export const updateGradeFailure = createAction(
  '[Teacher] Update Grade Failure',
  props<{ error: string }>()
);

export const deleteGrade = createAction(
  '[Teacher] Delete Grade',
  props<{ studentId: string, courseId: string }>()
);
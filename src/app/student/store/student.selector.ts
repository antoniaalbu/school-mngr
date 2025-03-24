import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StudentState } from '../models/student.state';

export const selectStudentState = createFeatureSelector<StudentState>('student');

export const selectCourses = createSelector(
    selectStudentState,
    (studentState: StudentState | undefined) => {
      const courses = studentState?.courses || [];
      return courses;
    }
);

export const selectLoading = createSelector(
    selectStudentState,
    (studentState: StudentState | undefined) => {
      const loading = studentState?.loading || false; 
      return loading;
    }
);

export const selectError = createSelector(
  selectStudentState,
  (studentState: StudentState | undefined) => {
    const error = studentState?.error || ''; 
    return error;
  }
);

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StudentState } from '../models/student.state';

export const selectStudentState = createFeatureSelector<StudentState>('student');

export const selectCourses = createSelector(
    selectStudentState,
    (studentState: StudentState | undefined) => {
      // Use optional chaining to safely access studentState?.courses
      // If studentState is undefined, return an empty array
      const courses = studentState?.courses || []; // Default to empty array
      return courses;
    }
);

export const selectLoading = createSelector(
    selectStudentState,
    (studentState: StudentState | undefined) => {
      // If studentState is undefined, return false
      const loading = studentState?.loading || false; // Default to false
      return loading;
    }
);

export const selectError = createSelector(
  selectStudentState,
  (studentState: StudentState | undefined) => {
    // If studentState is undefined, return an empty string
    const error = studentState?.error || ''; // Default to empty string
    return error;
  }
);

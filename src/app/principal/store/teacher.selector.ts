import { createSelector, createFeatureSelector } from '@ngrx/store';
import { TeacherState } from '../reducer/teacher.reducer';

// Feature selector for the teacher state
export const selectTeacherState = createFeatureSelector<TeacherState>('teachers');

export const selectAllTeachers = createSelector(
    selectTeacherState,
    (state) => {
        console.log('Selecting Courses:', state.teachers);
        return state.teachers;
      }
  );
  

// You can also create selectors for loading and errors if needed
export const selectLoading = createSelector(
  selectTeacherState,
  (state: TeacherState) => state.loading
);

export const selectError = createSelector(
  selectTeacherState,
  (state: TeacherState) => state.error
);

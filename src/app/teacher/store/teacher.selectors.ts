// store/teacher.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TeacherState } from '../models/teacher.state';

export const selectTeacherState = createFeatureSelector<TeacherState>('teacher');

export const selectTeacher = createSelector(
  selectTeacherState,
  (state: TeacherState) => state.teacher
);

export const selectStudents = createSelector(
  selectTeacherState,
  (state: TeacherState) => state.students
);

export const selectCourses = createSelector(
  selectTeacherState,
  (state: TeacherState) => state.courses
);

export const selectLoading = createSelector(
  selectTeacherState,
  (state: TeacherState) => state.loading
);

export const selectError = createSelector(
  selectTeacherState,
  (state: TeacherState) => state.error
);

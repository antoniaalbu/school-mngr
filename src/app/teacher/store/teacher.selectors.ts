
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Teacher} from '../models/teacher.state';

export const selectTeacherState = createFeatureSelector<Teacher>('teacher');

export const selectTeacher = createSelector(
  selectTeacherState,
  (state: Teacher) => state.teacher
);

export const selectStudents = createSelector(
  selectTeacherState,
  (state: Teacher) => state.students
);

export const selectCourses = createSelector(
  selectTeacherState,
  (state: Teacher) => state.courses
);

export const selectLoading = createSelector(
  selectTeacherState,
  (state: Teacher) => state.loading
);

export const selectError = createSelector(
  selectTeacherState,
  (state: Teacher) => state.error
);

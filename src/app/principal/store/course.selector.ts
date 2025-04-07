import { createSelector, createFeatureSelector } from '@ngrx/store';
import { CourseState } from '../reducer/course.reducer';

export const selectCourseState = createFeatureSelector<CourseState>('courses'); // ✅ Ensure it matches StoreModule

export const selectAllCourses = createSelector(
    selectCourseState,
    (state) => {
      console.log('Selecting Courses:', state.courses);
      return state.courses;
    }
  );
  
  export const selectLoading = createSelector(
    selectCourseState,
    (state) => {
      console.log('Selecting Loading State:', state.loading);
      return state.loading;
    }
  );
  
  export const selectError = createSelector(
    selectCourseState,
    (state) => {
      console.log('Selecting Error:', state.error);
      return state.error;
    }
  );
  
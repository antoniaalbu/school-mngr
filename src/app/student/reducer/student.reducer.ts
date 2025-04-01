import { createReducer, on } from '@ngrx/store';
import { loadStudentCoursesSuccess, loadStudentCoursesFailure, loadStudentCourses } from '../store/student.actions';
import { StudentState } from '../models/student.state';

export const initialState: StudentState = {
  courses: [],
  loading: false,
  error: null
};

export const studentReducer = createReducer(
  initialState,
  on(loadStudentCoursesSuccess, (state, { courses }) => {
    console.log('Reducer state after courses are loaded:', { ...state, courses });  
    return {
      ...state,
      loading: false,
      courses: courses,
      error: null
    };
  }),  
  on(loadStudentCoursesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
    courses: []
  }))
);

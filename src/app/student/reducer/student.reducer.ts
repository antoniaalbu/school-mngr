
import { createReducer, on } from '@ngrx/store';
import { loadStudentCoursesSuccess, loadStudentCoursesFailure } from '../store/student.actions';
import { StudentState } from '../models/student.state';

export const initialState: StudentState = {
  courses: [],  
  loading: false,  
  error: null, 
};

export const studentReducer = createReducer(
  initialState,
  on(loadStudentCoursesSuccess, (state, { courses }) => ({
    ...state,
    courses,
    loading: false,
    error: null,
  })),
  on(loadStudentCoursesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);

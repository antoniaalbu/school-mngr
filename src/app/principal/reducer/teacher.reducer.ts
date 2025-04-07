import { createReducer, on } from '@ngrx/store';
import * as TeacherActions from '../store/teacher.actions';
import { Teacher } from '../../teacher/models/teacher.state';


// TeacherState interface (no changes)
export interface TeacherState {
    teachers: Teacher[]; // Array of Teacher models
    loading: boolean;
    error: string | null;
  }
  
  // Initial state
  export const initialState: TeacherState = {
    teachers: [],  // Ensure this is always initialized as an empty array
    loading: false,
    error: null
  };
  

// Reducer with correct action payloads
export const teacherPrinicipalReducer = createReducer(
  initialState,
  on(TeacherActions.loadTeachers, (state) => ({ ...state, loading: true })),
  on(TeacherActions.loadTeachersSuccess, (state, { teachers }) => {
    console.log('Teachers loaded into state:', teachers); // Log the teachers here
    return { ...state, loading: false, teachers };
  }),
  
  on(TeacherActions.loadTeachersFailure, (state, { error }) => ({ ...state, loading: false, error }))
);

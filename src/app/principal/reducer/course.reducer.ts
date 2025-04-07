import { createReducer, on } from '@ngrx/store';
import * as CourseActions from '../store/course.actions'; // Your actions file
import { Course } from '../../teacher/models/teacher.state'; // Ensure this file has the correct Course type

export interface CourseState {
  courses: Course[];
  loading: boolean;
  error: string | null;
}

export const initialState: CourseState = {
  courses: [],
  loading: false,
  error: null
};

export const courseReducer = createReducer(
  initialState,

  // Action to load courses
  on(CourseActions.loadCourses, (state) => ({ ...state, loading: true })),
  on(CourseActions.loadCoursesSuccess, (state, { courses }) => ({ ...state, loading: false, courses })),
  on(CourseActions.loadCoursesFailure, (state, { error }) => ({ ...state, loading: false, error })),

   // Action to assign teacher to a course
   on(CourseActions.assignTeacher, (state, { courseId, teacherId }) => {
    const updatedCourses = state.courses.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          teacherId: teacherId // Update the course with the selected teacher's ID
        };
      }
      return course;
    });
    return { ...state, courses: updatedCourses };
  }),
  
  
  on(CourseActions.editCourse, (state, { courseId, name }) => ({
    ...state,
    courses: state.courses.map(course =>
      course.id === courseId ? { ...course, name } : course
    ),
  })),

  on(CourseActions.updateCourseSuccess, (state, { courseId, name }) => {
    const updatedCourses = state.courses.map(course => 
      course.id === courseId ? { ...course, name } : course
    );
    return { ...state, courses: updatedCourses };
  }),
  on(CourseActions.updateCourseFailure, (state, { error }) => ({
    ...state,
    error
  }))

  
);

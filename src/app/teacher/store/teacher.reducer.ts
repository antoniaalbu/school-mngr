
import { createReducer, on } from '@ngrx/store';
import { Teacher } from '../models/teacher.state';
import {
  setTeacher,
  loadStudents,
  loadStudentsSuccess,
  loadStudentsFailure,
  loadCourses,
  loadCoursesSuccess,
  loadCoursesFailure,
  assignGrade,
  addCourse,
  addCourseSuccess,
  addCourseFailure,
  updateGrade,
  deleteGrade
} from './teacher.actions';

export const initialState: Teacher = {
  teacher: null,
  students: [],
  courses: [],
  loading: false,
  error: null
};

export const teacherReducer = createReducer(
  initialState,
  on(setTeacher, (state, { teacher }) => ({
    ...state,
    teacher: teacher,
  })),
  on(loadStudents, state => ({
    ...state,
    loading: true
  })),
  on(loadStudentsSuccess, (state, { students }) => ({
    ...state,
    loading: false,
    students,
    error: null
  })),
  on(loadStudentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(loadCourses, state => ({
    ...state,
    loading: true
  })),
  on(loadCoursesSuccess, (state, { courses }) => ({
    ...state,
    loading: false,
    courses,
    error: null
  })),
  on(loadCoursesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(assignGrade, (state, { studentId, courseId, grade }) => {
    const updatedStudents = state.students.map(student => {
      if (student.id === studentId) {
        const updatedGrades = { ...student.grades, [courseId]: grade };
        return { ...student, grades: updatedGrades };
      }
      return student;
    });

    return {
      ...state,
      students: updatedStudents
    };
  }),
  on(addCourse, (state) => ({
    ...state,
    loading: true
  })),
  on(addCourseSuccess, (state, { course }) => ({
    ...state,
    loading: false,
    courses: [...state.courses, course]
  })),
  on(addCourseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(updateGrade, (state, { studentId, courseId, grade }) => {
    const updatedStudents = state.students.map(student => {
      if (student.id === studentId) {
        const updatedGrades = { ...student.grades, [courseId]: grade };
        return { ...student, grades: updatedGrades };
      }
      return student;
    });
    return {
      ...state,
      students: updatedStudents,
    };
  }),

  // Delete Grade
  on(deleteGrade, (state, { studentId, courseId }) => {
    const updatedStudents = state.students.map(student => {
      if (student.id === studentId) {
        const { [courseId]: _, ...updatedGrades } = student.grades; // Remove the grade for the given courseId
        return { ...student, grades: updatedGrades };
      }
      return student;
    });
    return {
      ...state,
      students: updatedStudents,
    };
  })
);

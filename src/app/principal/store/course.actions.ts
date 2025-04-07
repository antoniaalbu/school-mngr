import { createAction, props } from '@ngrx/store';


export const loadCourses = createAction('[Courses] Load Courses');
export const loadCoursesSuccess = createAction('[Courses] Load Courses Success', props<{ courses: any[] }>());
export const loadCoursesFailure = createAction('[Courses] Load Courses Failure', props<{ error: string }>());

export const addCourse = createAction('[Courses] Add Course', props<{ course: any }>());
export const addCourseSuccess = createAction('[Courses] Add Course Success', props<{ course: any }>());
export const addCourseFailure = createAction('[Courses] Add Course Failure', props<{ error: string }>());

export const editCourse = createAction(
    '[Course] Edit Course',
    props<{ courseId: string; name: string }>()
  );
export const editCourseSuccess = createAction('[Courses] Edit Course Success', props<{ courseId: string, changes: any }>());
export const editCourseFailure = createAction('[Courses] Edit Course Failure', props<{ error: string }>());

export const deleteCourse = createAction('[Courses] Delete Course', props<{ courseId: string }>());
export const deleteCourseSuccess = createAction('[Courses] Delete Course Success', props<{ courseId: string }>());
export const deleteCourseFailure = createAction('[Courses] Delete Course Failure', props<{ error: string }>());

export const assignTeacher = createAction(
    '[Course] Assign Teacher', 
    props<{ courseId: string, teacherId: string }>()
  );
  
 

 export const updateCourse = createAction(
  '[Course] Update Course',
  props<{ courseId: string; name: string }>()
);

export const updateCourseSuccess = createAction(
  '[Course] Update Course Success',
  props<{ courseId: string; name: string }>()
);

export const updateCourseFailure = createAction(
  '[Course] Update Course Failure',
  props<{ error: string }>()
);
  
export const assignTeacherSuccess = createAction('[Courses] Assign Teacher Success', props<{ courseId: string, teacherId: string }>());
export const assignTeacherFailure = createAction('[Courses] Assign Teacher Failure', props<{ error: string }>());

export const unassignTeacher = createAction('[Courses] Unassign Teacher', props<{ courseId: string }>());
export const unassignTeacherSuccess = createAction('[Courses] Unassign Teacher Success', props<{ courseId: string }>());
export const unassignTeacherFailure = createAction('[Courses] Unassign Teacher Failure', props<{ error: string }>());

import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, mergeMap } from 'rxjs/operators';
import { TeacherService } from '../services/teacher.service';
import {
  loadStudents, loadStudentsSuccess, loadStudentsFailure,
  loadCourses, loadCoursesSuccess, loadCoursesFailure,
  addCourse, addCourseSuccess, addCourseFailure
} from './teacher.actions';
import { Course, Student } from '../models/teacher.state';

@Injectable()
export class TeacherEffects {
  constructor(
    private actions$: Actions,
    private teacherService: TeacherService
  ) {}

  /** Load Students Effect */
  loadStudents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadStudents),
      switchMap(action =>
        this.teacherService.getStudents(action.userId).pipe(
          map((students: Student[]) => loadStudentsSuccess({ students })), // Explicit typing of students
          catchError(error => {
            console.error('❌ Error loading students:', error);
            return of(loadStudentsFailure({ error: error.message })); // Return the failure action
          })
        )
      )
    )
  );

  /** Load Courses Effect */
  loadCourses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCourses),
      switchMap(action =>
        this.teacherService.getCourses(action.userId).pipe(
          map((courses: Course[]) => loadCoursesSuccess({ courses })), // Explicit typing of courses
          catchError(error => {
            console.error('❌ Error loading courses:', error);
            return of(loadCoursesFailure({ error: error.message })); // Return the failure action
          })
        )
      )
    )
  );

  /** Add Course Effect */
  addCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addCourse),
      mergeMap((action) => {
        console.log('📢 Effect received addCourse action:', action);

        return this.teacherService.addCourse(action.course).pipe(
          map((docRef) => {
            console.log('✅ Firestore added course with ID:', docRef.id);
            const addedCourse: Course = { ...action.course, id: docRef.id };

            console.log('🚀 Dispatching addCourseSuccess with:', addedCourse);
            return addCourseSuccess({ course: addedCourse }); // Return the success action
          }),
          catchError((error) => {
            console.error('❌ Error adding course:', error);
            return of(addCourseFailure({ error: error.message })); // Return failure action directly
          })
        );
      })
    )
  );
}

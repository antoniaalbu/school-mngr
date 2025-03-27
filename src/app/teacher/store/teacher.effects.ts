import { Injectable } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { TeacherService } from '../services/teacher.service';
import { loadStudents, loadStudentsSuccess, loadStudentsFailure, loadCourses, loadCoursesSuccess, loadCoursesFailure, addCourse, addCourseSuccess, addCourseFailure } from './teacher.actions';
import { createEffect } from '@ngrx/effects'; // Import createEffect
import { from } from 'rxjs'; // Import from to convert Promise to Observable
import { Course } from '../models/teacher.state';

@Injectable()
export class TeacherEffects {
  constructor(
    private actions$: Actions,
    private teacherService: TeacherService
  ) {}

  loadStudents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadStudents),
      mergeMap(action =>
        from(this.teacherService.getStudents(action.userId)).pipe(
          map(students => loadStudentsSuccess({ students })),
          catchError(error => of(loadStudentsFailure({ error: error.message })))
        )
      )
    )
  );

  loadCourses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCourses),
      mergeMap(action =>
        from(this.teacherService.getCourses(action.userId)).pipe(
          map(courses => loadCoursesSuccess({ courses })),
          catchError(error => of(loadCoursesFailure({ error: error.message })))
        )
      )
    )
  );

  addCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addCourse),
      mergeMap((action) => {
        console.log('📢 Effect received addCourse action:', action); // Debug log
        
        return this.teacherService.addCourse(action.course).pipe(
          map((docRef) => {
            console.log('✅ Firestore added course with ID:', docRef.id);
            const addedCourse: Course = { ...action.course, id: docRef.id };

            console.log('🚀 Dispatching addCourseSuccess with:', addedCourse);
            return addCourseSuccess({ course: addedCourse });
          }),
          catchError((error) => {
            console.error('❌ Error adding course:', error);
            return from([addCourseFailure({ error: error.message })]);
          })
        );
      })
    )
  );
  
  
}

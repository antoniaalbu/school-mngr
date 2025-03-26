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
      mergeMap((action) =>
        from(this.teacherService.addCourse(action.course)) // Convert Promise to Observable using 'from'
          .pipe(
            map((docRef) => {
              // Log the DocumentReference to track it
              console.log('Course successfully added with DocumentReference:', docRef);

              // Get the course ID from Firestore
              const addedCourse: Course = {
                ...action.course, // Spread the course fields
                id: docRef.id // Add the Firestore document ID
              };

              console.log('Course object with ID:', addedCourse); // Log the full course object
              return addCourseSuccess({ course: addedCourse }); // Dispatch success action with the full course object
            }),
            catchError((error) => {
              console.error('Error adding course:', error); // Log the error
              return of(addCourseFailure({ error: error.message }));
            })
          )
      )
    )
  );
}

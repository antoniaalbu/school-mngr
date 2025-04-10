import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { StudentService } from './student.service';
import { Store } from '@ngrx/store';
import { loadStudentCoursesSuccess, loadStudentCoursesFailure } from './student.actions';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { enrollInCourse } from './student.actions';

@Injectable()
export class StudentEffects {
  constructor(
    private actions$: Actions,
    private studentService: StudentService,
    private store: Store
  ) {}

  enrollInCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(enrollInCourse), // Triggered when the action is dispatched
      switchMap(({ studentId, courseId }) => 
        this.studentService.enrollInCourse(studentId, courseId).pipe( // Enroll the student
          switchMap(() => {
            return this.studentService.getCourses(studentId); // Fetch updated list of courses
          }),
          map((courses) => {
            return loadStudentCoursesSuccess({ courses }); // Dispatch success with updated courses
          }),
          catchError((error) => {
            return of(loadStudentCoursesFailure({ error: 'Enrollment failed' }));
          })
        )
      )
    )
  );
}


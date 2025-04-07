import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { TeacherService } from '../services/teacher.service';
import * as TeacherActions from '../store/teacher.actions';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class TeacherPrincipalEffects {
  constructor(private actions$: Actions, private teacherService: TeacherService) {}

  loadTeachers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeacherActions.loadTeachers),
      mergeMap(() =>
        this.teacherService.getAllTeachers().pipe(
          map(teachers => {
            console.log('Teachers fetched successfully:', teachers); // Log teachers
            return TeacherActions.loadTeachersSuccess({ teachers });
          }),
          catchError(error => {
            console.error('Error loading teachers:', error);
            return of(TeacherActions.loadTeachersFailure({ error: error.message }));
          })
        )
      )
    )
  );
}

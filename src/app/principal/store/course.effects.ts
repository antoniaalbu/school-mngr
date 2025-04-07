import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CourseService } from '../services/course.service';
import * as CourseActions from './course.actions';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { from } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { tap } from 'rxjs';


@Injectable()
export class CourseEffects {
    constructor(
        private actions$: Actions,
        private courseService: CourseService, // Ensure you have a service for interacting with Firestore
        private firestore: Firestore
      ) {}

  loadCourses$ = createEffect(() => 
    this.actions$.pipe(
      ofType(CourseActions.loadCourses),
      mergeMap(() => 
        this.courseService.getAllCourses().pipe(
          map(courses => CourseActions.loadCoursesSuccess({ courses })),
          catchError(error => of(CourseActions.loadCoursesFailure({ error: error.message })))
        )
      )
    )
  );

  addCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CourseActions.addCourse),
      mergeMap(({ course }) => 
        this.courseService.addCourse(course).pipe(
          map(newCourse => CourseActions.addCourseSuccess({ course: newCourse })),
          catchError(error => of(CourseActions.addCourseFailure({ error: error.message })))
        )
      )
    )
  );

  updateCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CourseActions.updateCourse),
      mergeMap(({ courseId, name }) =>
        this.courseService.updateCourse(courseId, name).pipe(
          map(() => CourseActions.updateCourseSuccess({ courseId, name })),
          catchError((error) =>
            of(CourseActions.updateCourseFailure({ error: error.message }))
          )
        )
      )
    )
  );
  
  deleteCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CourseActions.deleteCourse),
      mergeMap(({ courseId }) => 
        this.courseService.deleteCourse(courseId).pipe(
          map(() => CourseActions.deleteCourseSuccess({ courseId })),
          catchError(error => of(CourseActions.deleteCourseFailure({ error: error.message })))
        )
      )
    )
  );
  assignTeacher$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CourseActions.assignTeacher),
      mergeMap(({ courseId, teacherId }) =>
        this.courseService.assignTeacher(courseId, teacherId).pipe(
          map(() => CourseActions.assignTeacherSuccess({ courseId, teacherId })),
          catchError((error) => 
            of(CourseActions.assignTeacherFailure({ error: error.message }))
          )
        )
      )
    )
  );
  
  
  
}
import { createAction, props } from '@ngrx/store';
import { Teacher } from '../../teacher/models/teacher.state';

export const loadTeachers = createAction('[Teacher] Load Teachers');

export const loadTeachersSuccess = createAction(
    '[Teacher] Load Teachers Success',
    props<{ teachers: Teacher[] }>() // Ensure this is an array of Teacher objects
  );

export const loadTeachersFailure = createAction(
  '[Teacher] Load Teachers Failure',
  props<{ error: string }>()
);
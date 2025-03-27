import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where, getDocs, DocumentData, addDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Student, Course } from '../models/teacher.state';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private firestore: Firestore = inject(Firestore);

  constructor() {
    if (!this.firestore) {
      throw new Error('Firestore instance is undefined.');
    }
  }

  /** Get Students for a specific teacher (returns Observable directly) */
  getStudents(teacherId: string): Observable<Student[]> {
    const studentsRef = collection(this.firestore, 'students');
    const studentsQuery = query(studentsRef, where('teacherId', '==', teacherId));
    
    return collectionData(studentsQuery, { idField: 'id' }) as Observable<Student[]>; // directly returning Observable
  }

  /** Get Courses for a specific teacher (returns Observable directly) */
  getCourses(teacherId: string): Observable<Course[]> {
    const coursesRef = collection(this.firestore, 'courses');
    const coursesQuery = query(coursesRef, where('teacherId', '==', teacherId));
    
    return collectionData(coursesQuery, { idField: 'id' }) as Observable<Course[]>; // directly returning Observable
  }

  /** Add Course (returns Observable for success/failure) */
  addCourse(course: Course): Observable<any> {
    const coursesRef = collection(this.firestore, 'courses');
    return new Observable(observer => {
      addDoc(coursesRef, course)
        .then(docRef => {
          observer.next(docRef); // Success
          observer.complete();
        })
        .catch(error => {
          observer.error(error); // Failure
        });
    });
  }
}

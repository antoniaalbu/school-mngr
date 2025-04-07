import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, updateDoc, getDocs } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

import { throwError } from 'rxjs';
import { getDoc } from 'firebase/firestore';
import { catchError, switchMap, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private coursesCollection = collection(this.firestore, 'courses');

  constructor(private firestore: Firestore) {}

  getAllCourses(): Observable<any[]> {
    return from(getDocs(this.coursesCollection).then(snapshot => 
      snapshot.docs.map(doc => ({ courseId: doc.id, ...doc.data() }))
    ));
  }

  addCourse(course: any): Observable<any> {
    return from(addDoc(this.coursesCollection, course).then(docRef => ({ ...course, courseId: docRef.id })));
  }

  deleteCourse(courseId: string): Observable<void> {
    return from(deleteDoc(doc(this.firestore, 'courses', courseId)));
  }

  loadCourses(): Observable<any[]> {
    const coursesRef = collection(this.firestore, 'courses');
    return from(getDocs(coursesRef)).pipe(
      map((querySnapshot) => {
        return querySnapshot.docs.map(docSnap => ({
          docId: docSnap.id, // Get Firestore document ID
          ...docSnap.data(),
        }));
      }),
      catchError((error) => {
        console.error('Error loading courses:', error);
        return throwError(error);
      })
    );
  }

  assignTeacher(courseId: string, teacherId: string): Observable<void> {
    // Get reference to the course document by courseId
    const courseRef = doc(this.firestore, 'courses', courseId);

    // Update the teacherId in the course document and return it as an Observable
    return from(updateDoc(courseRef, { teacherId }));
  }

  updateCourse(courseId: string, name: string): Observable<void> {
    // Get a reference to the document in Firestore using the Firestore Document ID
    const courseDocRef = doc(this.firestore, 'courses', courseId);  // courseId is Firestore Document ID
    
    // Update the course name
    return from(updateDoc(courseDocRef, { name }));  // Update the name field
  }

  getCourseByDocId(docId: string) {
    const courseDocRef = doc(this.firestore, 'courses', docId); // Create a reference to the course document

    return getDoc(courseDocRef).then(docSnap => {
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }; // Return course data along with the docId
      } else {
        return null; // No course found
      }
    });
  }
}
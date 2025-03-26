import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private firestore: Firestore = inject(Firestore);

  getCourses(studentId: string): Observable<any[]> {
    const coursesRef = collection(this.firestore, 'courses');
    const q = query(coursesRef, where('studentId', '==', studentId));
  
    return new Observable((observer) => {
      getDocs(q).then((querySnapshot) => {
        if (querySnapshot.empty) {
          observer.next([]);  // Return an empty array if no courses found
        } else {
          const courses = querySnapshot.docs.map(doc => doc.data());
          observer.next(courses);  // Emit the courses array
        }
        observer.complete();
      }).catch((error) => {
        observer.error(error);  // Handle errors
      });
    });
  }
  
}

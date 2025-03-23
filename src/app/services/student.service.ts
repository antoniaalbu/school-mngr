import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private firestore: Firestore = inject(Firestore);

  // Get courses assigned to a student (by studentId)
  getCourses(studentId: string): Observable<any[]> {
    // Reference to the courses collection
    const coursesRef = collection(this.firestore, 'courses');
    
    // Query to get courses where studentId matches
    const q = query(coursesRef, where('studentId', '==', studentId));
    
    // Fetch the documents
    return new Observable((observer) => {
      getDocs(q)
        .then((querySnapshot) => {
          // If no courses are found, return an empty array
          if (querySnapshot.empty) {
            observer.next([]); // No courses found, emit an empty array
          } else {
            const courses = querySnapshot.docs.map(doc => doc.data());
            observer.next(courses);  // Emit courses data if found
          }
          observer.complete();
        })
        .catch((error) => {
          console.error('Error getting courses:', error);
          observer.error(error);
        });
    });
  }
}

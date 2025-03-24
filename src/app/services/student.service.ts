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
      getDocs(q)
        .then((querySnapshot) => {
          
          if (querySnapshot.empty) {
            observer.next([]); 
          } else {
            const courses = querySnapshot.docs.map(doc => doc.data());
            observer.next(courses);  
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

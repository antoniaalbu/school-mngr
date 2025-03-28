import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, collectionData, addDoc, getDocs, doc, updateDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Student, Course } from '../models/teacher.state';

@Injectable({
  providedIn: 'root',
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
  
    return new Observable<Student[]>((observer) => {
      getDocs(studentsQuery)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            // Log raw data to see what Firestore is returning
            console.log('Raw Firestore data:', querySnapshot.docs);
  
            const students: Student[] = querySnapshot.docs.map(doc => {
              const student = doc.data() as Student;
              student.id = doc.id;  // You can also add the document ID to the student object
              return student;
            });
  
            console.log('Mapped Students:', students); // Log the final mapped data
            observer.next(students);  // Emit the students data
          } else {
            console.log('No students found for this teacher.');
            observer.next([]);  // No students found
          }
        })
        .catch((error) => {
          console.error('Error fetching students:', error);
          observer.error(error);  // Emit error if fetching fails
        });
    });
  }

  // Update grade for a course
  updateGrade(studentId: string, courseId: string, newGrade: number): Observable<any> {
    const studentRef = doc(this.firestore, 'students', studentId);

    return new Observable((observer) => {
      updateDoc(studentRef, {
        [`grades.${courseId}`]: newGrade, // Dynamically update grade for the specific course
      })
        .then(() => {
          observer.next('Grade updated successfully');
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
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

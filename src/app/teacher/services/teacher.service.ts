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

  getStudents(teacherId: string): Observable<Student[]> {
    const studentsRef = collection(this.firestore, 'students');
    const studentsQuery = query(studentsRef, where('teacherId', '==', teacherId));
  
    return new Observable<Student[]>((observer) => {
      getDocs(studentsQuery)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            
            console.log('Raw Firestore data:', querySnapshot.docs);
  
            const students: Student[] = querySnapshot.docs.map(doc => {
              const student = doc.data() as Student;
              student.id = doc.id;  
              return student;
            });
  
            console.log('Mapped Students:', students); 
            observer.next(students); 
          } else {
            console.log('No students found for this teacher.');
            observer.next([]);  
          }
        })
        .catch((error) => {
          console.error('Error fetching students:', error);
          observer.error(error);  
        });
    });
  }

 
  getCourses(teacherId: string): Observable<Course[]> {
    console.log(`Fetching courses for teacherId: ${teacherId}`);
    const coursesRef = collection(this.firestore, 'courses');
    const coursesQuery = query(coursesRef, where('teacherId', '==', teacherId));

    return new Observable<Course[]>((observer) => {
      getDocs(coursesQuery)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            
            console.log('Raw Firestore for teacher data:', querySnapshot.docs);
  
            const courses: Course[] = querySnapshot.docs.map(doc => {
              const course = doc.data() as Course;
              course.id = doc.id;  
              return course;
              }
            )
            console.log('Mapped Courses:', courses); 
            observer.next(courses); 
          } else {
            console.log('No courses found for this teacher.');
            observer.next([]);  
          }
        })
        .catch((error) => {
          console.error('Error fetching courses:', error);
          observer.error(error);  
        });
    });
  }
  

  addCourse(course: Course): Observable<any> {
    const coursesRef = collection(this.firestore, 'courses');
    return new Observable(observer => {
      addDoc(coursesRef, course)
        .then(docRef => {
          observer.next(docRef); 
          observer.complete();
        })
        .catch(error => {
          observer.error(error); 
        });
    });
  }

  updateGrade(studentId: string, courseId: string, newGrade: number): Observable<any> {
    const studentRef = doc(this.firestore, 'students', studentId);
  
    return new Observable((observer) => {
      updateDoc(studentRef, {
        [`grades.${courseId}`]: newGrade, 
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
  
}

import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, addDoc, DocumentData, DocumentReference } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Student, Course } from '../models/teacher.state';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private firestore: Firestore = inject(Firestore);

  getStudents(teacherId: string) {
    const studentsRef = collection(this.firestore, 'students');
    return getDocs(studentsRef).then(snapshot => {
      const students: Student[] = snapshot.docs.map(doc => doc.data() as Student);
      return students.filter(student => student.teacherId === teacherId);
    });
  }

  getCourses(teacherId: string) {
    const coursesRef = collection(this.firestore, 'courses');
    return getDocs(coursesRef).then(snapshot => {
      return snapshot.docs.map(doc => doc.data() as Course).filter(course => course.teacherId === teacherId);
    });
  }

  addCourse(course: Course): Observable<DocumentReference<DocumentData>> {
    console.log('🔥 Calling Firestore addCourse with:', course); // Debug log
    const coursesRef = collection(this.firestore, 'courses');
    
    return from(addDoc(coursesRef, course)); // Convert Promise to Observable
  }

}

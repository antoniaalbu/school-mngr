import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, DocumentReference} from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Student, Course } from '../models/teacher.state';
import { addDoc } from 'firebase/firestore';
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

  addCourse(course: Course): Observable<DocumentReference> {
    console.log('🔥 Calling Firestore addCourse with:', course);
    
    // Ensure Firestore instance exists before using
    if (!this.firestore) {
      throw new Error('Firestore instance is undefined.');
    }

    const coursesRef = collection(this.firestore, 'courses');
    return from(addDoc(coursesRef, course)); // ✅ Correct conversion of Promise to Observable
  }
}

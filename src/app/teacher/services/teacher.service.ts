import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Student, Course } from '../models/teacher.state';
import { from } from 'rxjs';
import { addDoc } from 'firebase/firestore';

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

  addCourse(course: Course) {
    const coursesRef = collection(this.firestore, 'courses');
    return from(addDoc(coursesRef, course)); // Adds the course to Firestore and returns an observable
  }
}

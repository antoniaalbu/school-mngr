import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, collectionData, addDoc, getDocs, doc, updateDoc, getDoc} from '@angular/fire/firestore';
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
    const coursesRef = collection(this.firestore, 'courses');
    const coursesQuery = query(coursesRef, where('teacherId', '==', teacherId));

    return new Observable<Course[]>((observer) => {
      getDocs(coursesQuery)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            const courses: Course[] = querySnapshot.docs.map(doc => {
              const course = doc.data() as Course;
              course.id = doc.id;  
              return course;
            });

            observer.next(courses);
          } else {
            observer.next([]);
          }
        })
        .catch((error) => {
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

  getStudentGrades(studentId: string): Observable<{ courseId: string; courseName: string; grade: number }[]> {
    const studentRef = doc(this.firestore, 'students', studentId); // Reference to student doc
    const coursesRef = collection(this.firestore, 'courses'); // Reference to courses collection
  
    return new Observable(observer => {
      // Fetch courses first
      getDocs(coursesRef)
        .then(coursesSnapshot => {
          const coursesMap = new Map<string, string>(); // Map courseId to courseName
          coursesSnapshot.forEach(courseDoc => {
            const courseData = courseDoc.data();
            coursesMap.set(courseDoc.id, courseData?.['name']); // Store course name
          });
  
          // Fetch student grades
          getDoc(studentRef)
            .then(docSnapshot => {
              if (docSnapshot.exists()) {
                const studentData = docSnapshot.data();
                const gradesData = studentData?.['grades'];
  
                if (gradesData && typeof gradesData === 'object') {
                  const grades = Object.entries(gradesData).map(([courseId, grade]) => ({
                    courseId, // Keep courseId
                    courseName: coursesMap.get(courseId) || 'Unknown Course', // Get course name
                    grade: grade as number,
                  }));
                  observer.next(grades);
                } else {
                  observer.next([]); // No grades available
                }
              } else {
                observer.next([]); // Student not found
              }
            })
            .catch(error => observer.error(error));
        })
        .catch(error => observer.error(error));
    });
  }
  
  addGrade(studentId: string, newGradeEntry: { courseId: string; grade: number; courseName: string }): Observable<void> {
    const studentRef = doc(this.firestore, 'students', studentId);
  
    return new Observable((observer) => {
      // Fetch the current grades for the student
      getDoc(studentRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            const studentData = docSnapshot.data();
            const grades = studentData?.['grades'] || {};
  
            // Check if the course already has grades and ensure it's an array
            if (grades[newGradeEntry.courseId]) {
              if (Array.isArray(grades[newGradeEntry.courseId])) {
                // If the course already has an array of grades, push the new grade to the array
                grades[newGradeEntry.courseId].push(newGradeEntry.grade);
              } else {
                // If the grades field is not an array, convert it into an array
                grades[newGradeEntry.courseId] = [grades[newGradeEntry.courseId], newGradeEntry.grade];
              }
            } else {
              // If the course doesn't have grades yet, initialize an array with the new grade
              grades[newGradeEntry.courseId] = [newGradeEntry.grade];
            }
  
            // Update the grades field with the new grade
            updateDoc(studentRef, {
              grades: grades,
            })
              .then(() => {
                observer.next(); // Emit success
                observer.complete();
              })
              .catch((error) => {
                observer.error(error);
              });
          } else {
            observer.error('Student not found.');
          }
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
  
  
  
  
}

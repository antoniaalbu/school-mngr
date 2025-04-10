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
  
  return new Observable<Student[]>((observer) => {
    getDocs(studentsRef)
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          console.log('Raw Firestore data:', querySnapshot.docs);

          const students: Student[] = querySnapshot.docs
            .map((doc) => {
              const student = doc.data() as Student;
              student.id = doc.id;

              console.log('Teachers field for student:', student.teachers);

              if (student.teachers && Object.values(student.teachers).includes(teacherId)) {
                console.log('Student assigned to this teacher:', student);
                return student; 
              } else {
                return null;
              }
            })
            .filter((student) => student !== null); 

          console.log('Mapped and filtered Students:', students);
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

  getStudentGrades(studentId: string, teacherId: string): Observable<{ courseId: string; courseName: string; grade: number }[]> {
    const studentRef = doc(this.firestore, 'students', studentId); 
    const coursesRef = collection(this.firestore, 'courses');
  
    return new Observable(observer => {
      // Fetch the courses taught by the teacher
      getDocs(query(coursesRef, where('teacherId', '==', teacherId))) 
        .then(coursesSnapshot => {
          const coursesMap = new Map<string, string>();  
  
          
          coursesSnapshot.forEach(courseDoc => {
            const courseData = courseDoc.data();
            const courseName = courseData?.['name'];
            if (courseName) {
              coursesMap.set(courseDoc.id, courseName);  
            }
          });
  
        
          getDoc(studentRef)
            .then(docSnapshot => {
              if (docSnapshot.exists()) {
                const studentData = docSnapshot.data();
                const gradesData = studentData?.['grades'];
  
                if (gradesData && typeof gradesData === 'object') {
                  
                  const filteredGrades = Object.entries(gradesData)
                    .filter(([courseId, _]) => coursesMap.has(courseId)) 
                    .map(([courseId, grade]) => ({
                      courseId,
                      courseName: coursesMap.get(courseId) || 'Unknown Course', 
                      grade: grade as number,
                    }));
  
                  observer.next(filteredGrades);  
                } else {
                  observer.next([]);  
                }
              } else {
                observer.next([]);  
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
     
      getDoc(studentRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            const studentData = docSnapshot.data();
            const grades = studentData?.['grades'] || {};
  
            
            if (grades[newGradeEntry.courseId]) {
              if (Array.isArray(grades[newGradeEntry.courseId])) {
                grades[newGradeEntry.courseId].push(newGradeEntry.grade);
              } else {

                grades[newGradeEntry.courseId] = [grades[newGradeEntry.courseId], newGradeEntry.grade];
              }
            } else {
              grades[newGradeEntry.courseId] = [newGradeEntry.grade];
            }
  
           
            updateDoc(studentRef, {
              grades: grades,
            })
              .then(() => {
                observer.next(); 
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
  
  updateGradeInServer(studentId: string, courseId: string, grade: number): Observable<void> {
    return new Observable((observer) => {
      const studentRef = doc(this.firestore, `students/${studentId}`);

      // Fetch the student document to update the grade
      getDoc(studentRef).then((studentDoc) => {
        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          const updatedGrades = { ...studentData?.['grades'], [courseId]: grade };

          // Update the student's grade for the course
          updateDoc(studentRef, { grades: updatedGrades })
            .then(() => {
              observer.next();
              observer.complete();
            })
            .catch((err) => {
              console.error('Error updating grade:', err);
              observer.error('Error updating grade');
            });
        } else {
          observer.error('Student not found');
        }
      }).catch((err) => {
        console.error('Error fetching student data:', err);
        observer.error('Error fetching student data');
      });
    });
  }

  // Delete the grade for a student in a specific course
  deleteGradeFromServer(studentId: string, courseId: string): Observable<void> {
    return new Observable((observer) => {
      const studentRef = doc(this.firestore, `students/${studentId}`);

      // Fetch the student document to delete the grade
      getDoc(studentRef).then((studentDoc) => {
        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          const { [courseId]: removedGrade, ...updatedGrades } = studentData?.['grades'] || {};

          // Remove the grade for the course
          updateDoc(studentRef, { grades: updatedGrades })
            .then(() => {
              observer.next();
              observer.complete();
            })
            .catch((err) => {
              console.error('Error deleting grade:', err);
              observer.error('Error deleting grade');
            });
        } else {
          observer.error('Student not found');
        }
      }).catch((err) => {
        console.error('Error fetching student data:', err);
        observer.error('Error fetching student data');
      });
    });
  }

  
  
}

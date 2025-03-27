import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private firestore: Firestore = inject(Firestore);

  // Fetch courses along with grades and teacher details for a specific student
  getCourses(studentId: string): Observable<any[]> {
    console.log('Fetching courses for student with ID:', studentId);
    
    // Reference to the students collection
    const studentsRef = collection(this.firestore, 'students');
    const studentQuery = query(studentsRef, where('uid', '==', studentId));

    return new Observable((observer) => {
      getDocs(studentQuery).then(async (studentSnapshot) => {
        if (studentSnapshot.empty) {
          console.log('No student found with ID:', studentId);
          observer.next([]);
        } else {
          const studentDoc = studentSnapshot.docs[0];
          const studentData = studentDoc.data();
          console.log('Student data retrieved:', studentData);

          // Get the grades field from the student document
          const grades = studentData['grades'] ?? {};
          console.log('Grades retrieved for student:', grades);

          const coursesWithDetails = [];

          // Fetch the courses for each courseId in the grades field
          for (const [courseId, grade] of Object.entries(grades)) {
            console.log(`Fetching details for courseId: ${courseId} with grade: ${grade}`);

            // Query the courses collection to get the course name using courseId
            const courseRef = collection(this.firestore, 'courses');
            const courseQuery = query(courseRef, where('id', '==', courseId));

            const courseSnapshot = await getDocs(courseQuery);
            if (!courseSnapshot.empty) {
              const courseData = courseSnapshot.docs[0].data();
              const courseName = courseData['name'] ?? 'Unknown Course';
              console.log(`Course data retrieved for ${courseId}:`, courseData);

              // Fetch the teacherId for the course and resolve teacher's name
              const teacherId = courseData['teacherId'];
              console.log('Teacher ID for this course:', teacherId);

              const teacherQuery = query(
                collection(this.firestore, 'teachers'),
                where('uid', '==', teacherId)
              );

              const teacherSnapshot = await getDocs(teacherQuery);
              const teacherName = teacherSnapshot.empty
                ? 'Unknown Teacher'
                : teacherSnapshot.docs[0].data()['name'];
              console.log(`Teacher data retrieved for course ${courseId}:`, teacherName);

              // Push the course details along with grade and teacher info
              coursesWithDetails.push({
                courseId,
                courseName,
                grade,
                teacher: teacherName,
              });
            } else {
              console.log(`No course found with courseId: ${courseId}`);
            }
          }

          console.log('Final list of courses with grades and teachers:', coursesWithDetails);
          observer.next(coursesWithDetails);
        }
        observer.complete();
      }).catch((error) => {
        console.error('Error fetching student data or courses:', error);
        observer.error(error);
      });
    });
  }
}

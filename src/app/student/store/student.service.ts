import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, query, where, updateDoc, setDoc, deleteField } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { Course } from '../../teacher/models/teacher.state';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private firestore: Firestore = inject(Firestore);

  getCourses(studentId: string): Observable<any[]> {
    console.log('Fetching courses for student with ID:', studentId);
    const studentsRef = collection(this.firestore, 'students');
    const studentQuery = query(studentsRef, where('uid', '==', studentId));
  
    return new Observable((observer) => {
      getDocs(studentQuery)
        .then(async (studentSnapshot) => {
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
  
            // Loop through the grades object to get course details
            for (const [courseId, grade] of Object.entries(grades)) {
              console.log(`Fetching details for courseId: ${courseId} with grade: ${grade}`);
  
              // Get the course document reference using the courseId
              const courseDocRef = doc(this.firestore, 'courses', courseId); // courseId here is the document ID
              const courseSnapshot = await getDoc(courseDocRef);
  
              if (courseSnapshot.exists()) {
                const courseData = courseSnapshot.data();
                const courseName = courseData['name'] ?? 'Unknown Course';
                console.log(`Course data retrieved for courseId: ${courseId}`, courseData);
  
                const teacherId = courseData['teacherId'];
                console.log('Teacher ID for this course:', teacherId);
  
                const teacherDocRef = doc(this.firestore, 'teachers', teacherId);
                const teacherSnapshot = await getDoc(teacherDocRef);
  
                const teacherName = teacherSnapshot.exists() ? teacherSnapshot.data()?.['name'] : 'Unknown Teacher';
                console.log(`Teacher data retrieved for course ${courseId}:`, teacherName);
  
                // Store the course details with the document ID
                coursesWithDetails.push({
                  courseId: courseSnapshot.id,  // This is the Firestore document ID
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
        })
        .catch((error) => {
          console.error('Error fetching student data or courses:', error);
          observer.error(error);
        });
    });
  }
  
  
  getAvailableCourses(studentId: string): Observable<any[]> {
    console.log('Fetching available courses for student with ID:', studentId);
    
    return new Observable((observer) => {
      getDocs(query(collection(this.firestore, 'students'), where('uid', '==', studentId)))
        .then(async (studentSnapshot) => {
          const enrolledCourseIds: string[] = [];
  
          if (!studentSnapshot.empty) {
            const studentData = studentSnapshot.docs[0].data();
            const grades = studentData['grades'] ?? {};
            Object.keys(grades).forEach(courseId => enrolledCourseIds.push(courseId));
          }
  
          console.log('Enrolled course IDs:', enrolledCourseIds);
  
          const coursesSnapshot = await getDocs(collection(this.firestore, 'courses'));
  
          const availableCourses = await Promise.all(
            coursesSnapshot.docs
              .filter(courseDoc => !enrolledCourseIds.includes(courseDoc.id))
              .map(async (courseDoc) => {
                const courseData = courseDoc.data();
                const courseId = courseDoc.id;
  
                let teacherName = 'Unknown';
                if (courseData['teacherId']) {
                  const teacherSnapshot = await getDoc(doc(this.firestore, 'teachers', courseData['teacherId']));
                  if (teacherSnapshot.exists()) {
                    teacherName = teacherSnapshot.data()?.['name'] ?? 'Unknown';
                  }
                }
  
                return {
                  id: courseId,
                  name: courseData['name'] || 'Unnamed Course',
                  teacherId: courseData['teacherId'],
                  teacherName
                };
              })
          );
  
          console.log('Available courses:', availableCourses);
          observer.next(availableCourses);
          observer.complete();
        })
        .catch((error) => {
          console.error('Error fetching available courses:', error);
          observer.error(error);
        });
    });
  }
  


getCourseById(courseId: string): Observable<Course> {
  return new Observable<Course>((observer) => {
    const courseDocRef = doc(this.firestore, 'courses', courseId);
    getDoc(courseDocRef)
      .then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const courseData = docSnapshot.data(); 
          const course: Course = {
            id: docSnapshot.id,  
            name: courseData['name'],  
            teacherId: courseData['teacherId'],  
           
          };
          console.log('Course data retrieved:', course); 
          observer.next(course);  
          observer.complete();
        } else {
          console.error(`Course with ID ${courseId} does not exist.`);
          observer.error('Course not found');
        }
      })
      .catch((error) => {
        console.error('Error retrieving course document:', error);
        observer.error(error);
      });
  });
}

  
enrollInCourse(studentId: string, courseDocId: string): Observable<void> {
  console.log(`Starting enrollment for student: ${studentId}`);
  console.log(`Course ID: ${courseDocId}`);

 
  const fetchCourse = async (courseDocId: string) => {
    try {
      const courseDocRef = doc(this.firestore, 'courses', courseDocId); 
      const courseSnapshot = await getDoc(courseDocRef); 

      if (courseSnapshot.exists()) {
        const courseDoc = courseSnapshot.data(); 
        console.log('Course Document:', courseDoc);


        if (!courseDoc || !courseDoc['name'] || !courseDoc['id'] || !courseDoc['teacherId']) {
          console.error('Course document is missing required information:', courseDoc);
          throw new Error('Course document is incomplete');
        }

        return courseDoc; 
      } else {
        console.error('No course found with ID:', courseDocId);
        throw new Error('Course not found');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  };

  return new Observable((observer) => {
    fetchCourse(courseDocId)  // Fetch the course document
      .then((courseDoc) => {
        getDocs(query(collection(this.firestore, 'students'), where('uid', '==', studentId)))  // Get student
          .then(async (studentSnapshot) => {
            if (studentSnapshot.empty) {
              console.error(`No student found with UID: ${studentId}`);
              observer.error('Student not found');
              return;
            }
  
            const studentDocRef = studentSnapshot.docs[0].ref;
            const studentData = studentSnapshot.docs[0].data();
            console.log(`Student document found. Name: ${studentData?.['name'] || 'Unknown'}`);
  
            // Use Firestore document ID as course ID
            const courseId = courseDocId;  // This is the document ID from Firestore
            const courseName = courseDoc?.['name'] || 'Unknown Course';
            const teacherId = courseDoc?.['teacherId'] || null;
  
            if (!courseId) {
              console.error('Course document is missing an ID.');
              observer.error('Invalid course document');
              return;
            }
  
            if (!teacherId) {
              console.warn(`Course "${courseName}" does not have an assigned teacher.`);
            }
  
            // Now, store the course document ID as the course ID in the student's grades field
            const updatedGrades = { ...studentData['grades'] || {} };
            updatedGrades[courseId] = [];  // Assign course by document ID
  
            // Store teacher details in the teachers field (if applicable)
            const updatedTeachers = { ...studentData['teachers'] || {} };
            if (teacherId) {
              updatedTeachers[courseId] = teacherId;
              console.log(`Assigning teacherId "${teacherId}" to course "${courseName}" (${courseId})`);
            }
  
            // Update the student document with the new grades and teachers data
            await updateDoc(studentDocRef, {
              grades: updatedGrades,
              teachers: updatedTeachers
            });
  
            console.log(`Successfully enrolled student ${studentId} in "${courseName}" (${courseId})`);
            observer.next();  // Notify completion
            observer.complete();  // Mark the observable as complete
          })
          .catch((error) => {
            console.error('Error during enrollment:', error);
            observer.error(error);
          });
      })
      .catch((error) => {
        console.error('Error fetching course data:', error);
        observer.error(error);
      });
  });
  
}


  unenrollFromCourse(studentId: string, courseId: string): Observable<void> {
    console.log(`Unenrolling student ${studentId} from course ${courseId}`);
    
    return new Observable((observer) => {

      getDocs(query(collection(this.firestore, 'students'), where('uid', '==', studentId)))
        .then(async (studentSnapshot) => {
          if (studentSnapshot.empty) {
            console.error('No student found with ID:', studentId);
            observer.error('Student not found');
            return;
          }
          
          const studentDocRef = studentSnapshot.docs[0].ref;
          const studentData = studentSnapshot.docs[0].data();
          
         
          const updatedGrades = { ...studentData['grades'] || {} };
          
          
          if (!(courseId in updatedGrades)) {
            console.log(`Student ${studentId} is not enrolled in course ${courseId}`);
            observer.next();
            observer.complete();
            return;
          }
          
       
          delete updatedGrades[courseId];
          
          await updateDoc(studentDocRef, { grades: updatedGrades });
          
          console.log(`Successfully unenrolled student ${studentId} from course ${courseId}`);
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          console.error('Error unenrolling from course:', error);
          observer.error(error);
        });
    });
  }
}
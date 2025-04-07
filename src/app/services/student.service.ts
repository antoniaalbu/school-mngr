import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, query, where, updateDoc, setDoc, deleteField } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { Course } from '../teacher/models/teacher.state';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private firestore: Firestore = inject(Firestore);

  getCourses(studentId: string): Observable<any[]> {
    console.log('Fetching courses for student with ID:', studentId);

    // Reference to the students collection
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

            // Fetch the courses for each courseId in the grades field
            for (const [courseId, grade] of Object.entries(grades)) {
              console.log(`Fetching details for courseId: ${courseId} with grade: ${grade}`);

              // Fetch the course document directly by its ID
              const courseDocRef = doc(this.firestore, 'courses', courseId);
              const courseSnapshot = await getDoc(courseDocRef);

              if (courseSnapshot.exists()) {
                const courseData = courseSnapshot.data();
                const courseName = courseData['name'] ?? 'Unknown Course';
                console.log(`Course data retrieved for ${courseId}:`, courseData);

                // Fetch the teacherId for the course and resolve teacher's name
                const teacherId = courseData['teacherId'];
                console.log('Teacher ID for this course:', teacherId);

                // Fetch teacher document directly by its ID
                const teacherDocRef = doc(this.firestore, 'teachers', teacherId);
                const teacherSnapshot = await getDoc(teacherDocRef);

                const teacherName = teacherSnapshot.exists() ? teacherSnapshot.data()?.['name'] : 'Unknown Teacher';
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
        })
        .catch((error) => {
          console.error('Error fetching student data or courses:', error);
          observer.error(error);
        });
    });
  }
  
  // Get available courses (courses the student is not enrolled in)
  getAvailableCourses(studentId: string): Observable<any[]> {
    console.log('Fetching available courses for student with ID:', studentId);
    
    return new Observable((observer) => {
      // First, get the courses the student is already enrolled in
      getDocs(query(collection(this.firestore, 'students'), where('uid', '==', studentId)))
        .then(async (studentSnapshot) => {
          const enrolledCourseIds: string[] = [];
          
          // Get enrolled course IDs
          if (!studentSnapshot.empty) {
            const studentData = studentSnapshot.docs[0].data();
            const grades = studentData['grades'] ?? {};
            enrolledCourseIds.push(...Object.keys(grades));
          }
          
          console.log('Student is enrolled in these courses:', enrolledCourseIds);
          
          // Fetch all courses
          const coursesRef = collection(this.firestore, 'courses');
          const coursesSnapshot = await getDocs(coursesRef);
          
          const availableCourses = [];
          
          // Process each course
          for (const courseDoc of coursesSnapshot.docs) {
            const courseId = courseDoc.id;
            const courseData = courseDoc.data();
            
            // Skip courses the student is already enrolled in
            if (enrolledCourseIds.includes(courseId)) {
              continue;
            }
            
            // Get teacher information
            let teacherName = 'Unknown';
            if (courseData['teacherId']) {
              const teacherDocRef = doc(this.firestore, 'teachers', courseData['teacherId']);
              const teacherSnapshot = await getDoc(teacherDocRef);
              teacherName = teacherSnapshot.exists() ? teacherSnapshot.data()?.['name'] : 'Unknown';
            }
            
            availableCourses.push({
              id: courseId,
              name: courseData['name'] || 'Unnamed Course',
              teacherId: courseData['teacherId'],
              teacherName: teacherName
            });
          }
          
          console.log('Available courses for enrollment:', availableCourses);
          observer.next(availableCourses);
          observer.complete();
        })
        .catch((error) => {
          console.error('Error fetching available courses:', error);
          observer.error(error);
        });
    });
  }

  // In your StudentService
getCourseById(courseId: string): Observable<Course> {
  return new Observable<Course>((observer) => {
    const courseDocRef = doc(this.firestore, 'courses', courseId); // Reference to the specific course document
    getDoc(courseDocRef)
      .then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const courseData = docSnapshot.data(); // Get the course data from Firestore
          const course: Course = {
            id: docSnapshot.id,  // Get the document ID (it's already passed as courseId)
            name: courseData['name'],  // Ensure 'name' is fetched correctly
            teacherId: courseData['teacherId'],  // Ensure 'teacherId' is fetched correctly
            // You can add more fields here if needed
          };
          console.log('Course data retrieved:', course);  // Debug the course object here
          observer.next(course);  // Emit the course object
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

  // Fetch the course document using its ID
  const fetchCourse = async (courseDocId: string) => {
    try {
      const courseDocRef = doc(this.firestore, 'courses', courseDocId); // Get the course document reference
      const courseSnapshot = await getDoc(courseDocRef); // Fetch the course document

      if (courseSnapshot.exists()) {
        const courseDoc = courseSnapshot.data(); // Get the course data from the snapshot
        console.log('Course Document:', courseDoc);

        // Check that the course document has the necessary fields
        if (!courseDoc || !courseDoc['name'] || !courseDoc['id'] || !courseDoc['teacherId']) {
          console.error('❌ Course document is missing required information:', courseDoc);
          throw new Error('Course document is incomplete');
        }

        return courseDoc; // Return the course document
      } else {
        console.error('❌ No course found with ID:', courseDocId);
        throw new Error('Course not found');
      }
    } catch (error) {
      console.error('❗ Error fetching course:', error);
      throw error; // Rethrow error to handle in the main method
    }
  };

  return new Observable((observer) => {
    // Fetch the course document first
    fetchCourse(courseDocId)
      .then((courseDoc) => {
        // Proceed with the student enrollment process
        getDocs(query(collection(this.firestore, 'students'), where('uid', '==', studentId)))
          .then(async (studentSnapshot) => {
            if (studentSnapshot.empty) {
              console.error(`❌ No student found with UID: ${studentId}`);
              observer.error('Student not found');
              return;
            }

            const studentDocRef = studentSnapshot.docs[0].ref;
            const studentData = studentSnapshot.docs[0].data();
            console.log(`✅ Student document found. Name: ${studentData?.['name'] || 'Unknown'}`);

            const courseId = courseDoc?.['id'];
            const teacherId = courseDoc?.['teacherId'] || null;

            // Check if courseId is valid
            if (!courseId) {
              console.error('❌ Course document is missing an ID.');
              observer.error('Invalid course document');
              return;
            }

            // If no teacherId, warn about it
            if (!teacherId) {
              console.warn(`⚠️ Course "${courseDoc?.['name']}" does not have an assigned teacher.`);
            }

            // Initialize grades and teachers
            const updatedGrades = { ...studentData['grades'] || {} };
            updatedGrades[courseId] = []; // Set to an empty array for new course

            const updatedTeachers = { ...studentData['teachers'] || {} };
            if (teacherId) {
              updatedTeachers[courseId] = teacherId;
              console.log(`📌 Assigning teacherId "${teacherId}" to course "${courseId}"`);
            }

            // Update student document with new grades and teachers
            await updateDoc(studentDocRef, { 
              grades: updatedGrades,
              teachers: updatedTeachers
            });

            console.log(`🎉 Successfully enrolled student ${studentId} in "${courseDoc?.['name']}" (${courseId})`);
            observer.next();
            observer.complete();
          })
          .catch((error) => {
            console.error('❗ Error during enrollment:', error);
            observer.error(error);
          });
      })
      .catch((error) => {
        console.error('❗ Error fetching course data:', error);
        observer.error(error);
      });
  });
}


  
  
  // Unenroll student from a course
  unenrollFromCourse(studentId: string, courseId: string): Observable<void> {
    console.log(`Unenrolling student ${studentId} from course ${courseId}`);
    
    return new Observable((observer) => {
      // Find the student document
      getDocs(query(collection(this.firestore, 'students'), where('uid', '==', studentId)))
        .then(async (studentSnapshot) => {
          if (studentSnapshot.empty) {
            console.error('No student found with ID:', studentId);
            observer.error('Student not found');
            return;
          }
          
          const studentDocRef = studentSnapshot.docs[0].ref;
          const studentData = studentSnapshot.docs[0].data();
          
          // Create updated grades object without the specified course
          const updatedGrades = { ...studentData['grades'] || {} };
          
          // Check if the course exists in the student's grades
          if (!(courseId in updatedGrades)) {
            console.log(`Student ${studentId} is not enrolled in course ${courseId}`);
            observer.next();
            observer.complete();
            return;
          }
          
          // Remove the course from grades
          delete updatedGrades[courseId];
          
          // Update the student document
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
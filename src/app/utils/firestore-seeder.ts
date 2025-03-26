import { Firestore, collection, addDoc, getDocs, deleteDoc } from '@angular/fire/firestore'; 
import { Student, Course } from '../teacher/models/teacher.state'; 
import { environment } from '../enviroment';  

export class FirestoreSeeder {   
  static async seedData(firestore: Firestore) {     
    
    try {
      const studentsRef = collection(firestore, 'students');
      const studentSnapshot = await getDocs(studentsRef);

      if (studentSnapshot.empty) {
        console.log('No students found. Seeding data...');
        await this.clearExistingData(firestore);
        await this.addSampleData(firestore);
      }
    } catch (error) {
      console.error('Error checking/seeding Firestore:', error);
    }
  }

  private static async clearExistingData(firestore: Firestore) {     
        
    const studentsRef = collection(firestore, 'students');     
    const studentSnapshot = await getDocs(studentsRef);     
    for (const doc of studentSnapshot.docs) {       
      await deleteDoc(doc.ref);     
    }      

   
    const coursesRef = collection(firestore, 'courses');     
    const courseSnapshot = await getDocs(coursesRef);     
    for (const doc of courseSnapshot.docs) {       
      await deleteDoc(doc.ref);     
    }   
  }

  private static async addSampleData(firestore: Firestore) {     
    const teacherId = 'Oy2Tx08QIya4WdV7TyRSDiPZGE23';      

    const students: Student[] = [       
      {         
        id: 'student1',         
        name: 'Alice Johnson',         
        email: 'alice.johnson@school.com',         
        teacherId: teacherId,         
        grades: {           
          'course1': 92,           
          'course2': 88,           
          'course3': 95         
        }       
      },       
      {         
        id: 'student2',          
        name: 'Bob Smith',         
        email: 'bob.smith@school.com',         
        teacherId: teacherId,         
        grades: {           
          'course1': 85,           
          'course2': 90,           
          'course3': 82         
        }       
      },       
      {         
        id: 'student3',         
        name: 'Charlie Brown',         
        email: 'charlie.brown@school.com',          
        teacherId: teacherId,         
        grades: {           
          'course1': 78,           
          'course2': 82,           
          'course3': 80         
        }       
      }     
    ];      

    const courses: Course[] = [       
      {         
        id: 'course1',         
        name: 'Mathematics',         
        teacherId: teacherId       
      },       
      {         
        id: 'course2',          
        name: 'Science',         
        teacherId: teacherId       
      },       
      {         
        id: 'course3',         
        name: 'English Literature',         
        teacherId: teacherId       
      }     
    ];      

    
    const studentsRef = collection(firestore, 'students');     
    for (const student of students) {       
      await addDoc(studentsRef, student);     
    }      

    
    const coursesRef = collection(firestore, 'courses');     
    for (const course of courses) {       
      await addDoc(coursesRef, course);     
    }      

    console.log('Sample data seeded successfully');   
  } 
}
import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  private teachersCollection = collection(this.firestore, 'teachers');

  constructor(private firestore: Firestore) {}

  getAllTeachers(): Observable<any[]> {
    return from(getDocs(this.teachersCollection).then(snapshot => {
      const teachers = snapshot.docs.map(doc => ({
        teacherId: doc.id,
        ...doc.data()
      }));
      console.log('Fetched teachers from Firestore:', teachers); // Log the fetched data
      return teachers;
    }));
  }
}

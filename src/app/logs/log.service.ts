import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  constructor(private firestore: Firestore) {}

  logAction(userId: string, userType: string, action: string, details: any = null) {
    const logsRef = collection(this.firestore, 'logs');
    return addDoc(logsRef, {
      userId,
      userType,
      action,
      details,
      timestamp: new Date()
    });
  }
}

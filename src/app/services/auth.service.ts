import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, user} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserRole: string | undefined;
  private auth: Auth = inject(Auth);  // Inject Firebase Auth
  private firestore: Firestore = inject(Firestore);  // Inject Firestore

  getCurrentUser(): Observable<any> {
    return user(this.auth);  // Return an observable of the current user
  }

  register(email: string, password: string, name: string, role: string): Promise<void> {
    console.log('Attempting to register user with email:', email);
    
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('User registered successfully:', user);

        // Log role and name to verify
        console.log('Storing user details in Firestore with role:', role);

        // Store the user details in Firestore, including the role
        return setDoc(doc(this.firestore, 'users', user.uid), {
          name: name,
          email: email,
          role: role, // Use the passed role here
          createdAt: new Date(),
        });
      })
      .catch((error) => {
        // Log error details for debugging
        console.error('Error during registration:', error);
        
        // If the error is Firebase specific, log the code and message
        if (error.code) {
          console.error(`Firebase Error Code: ${error.code}`);
        }
        if (error.message) {
          console.error(`Firebase Error Message: ${error.message}`);
        }
        
        // Throw the error to be caught by the calling component/service
        throw error;
      });
  }

  async login(email: string, password: string): Promise<any> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;
    const userProfile = await this.getUserProfile(user.uid);
    
    // Store the role in the service
    this.currentUserRole = userProfile.role;
    
    return { ...user, role: this.currentUserRole };  // Return user data with role
  }

  getRole(): string | undefined {
    console.log(this.currentUserRole);
    return this.currentUserRole;  // Retrieve the stored role
  }
  

  // Retrieve user profile from Firestore
  private getUserProfile(uid: string): Promise<any> {
    const userRef = doc(this.firestore, 'users', uid);
    return getDoc(userRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          return docSnap.data();
        } else {
          throw new Error('User profile not found');
        }
      })
      .catch((error) => {
        console.error('Error fetching user profile:', error);
        throw error;
      });
  }
}

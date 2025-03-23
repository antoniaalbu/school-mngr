import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserRole: string | undefined;
  private auth: Auth = inject(Auth);  // Inject Firebase Auth
  private firestore: Firestore = inject(Firestore);  // Inject Firestore
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // If a user is already logged in, populate the currentUserSubject
    const user = this.auth.currentUser;
    if (user) {
      this.setCurrentUser(user);
    }
  }

  // Get the current logged-in user
getCurrentUser(): User | null {
  console.log(this.currentUserSubject.value ?? null);
  return this.currentUserSubject.value ?? null;  // Return the current user or null if not available
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
          uid: user.uid,
          name: name,
          email: email,
          role: role, // Use the passed role here
          createdAt: new Date(),
        });
      })
      .catch((error) => {
        console.error('Error during registration:', error);
        throw error;  // Throw the error to be caught by the calling component/service
      });
  }

  // Update the BehaviorSubject with the current user and role
  private setCurrentUser(user: User) {
    this.currentUserSubject.next(user);  // Set the current user in BehaviorSubject
    
    // Fetch user profile to get the role
    this.getUserProfile(user.uid).then((userProfile) => {
      this.currentUserRole = userProfile.role;
      console.log('User role set:', this.currentUserRole);
    }).catch((error) => {
      console.error('Error fetching user profile:', error);
    });
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      this.setCurrentUser(user);  // Set the logged-in user in BehaviorSubject
      return user;  // Return the user object
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  getRole(): string | undefined {
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

import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  User,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserRole: string | undefined;
  private currentUserNameSubject: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined); // Use BehaviorSubject for name
  private auth: Auth = inject(Auth);  
  private firestore: Firestore = inject(Firestore); 
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  public currentUserName$: Observable<string | undefined> = this.currentUserNameSubject.asObservable();

  constructor() {

    setPersistence(this.auth, browserLocalPersistence)
      .then(() => console.log('Auth persistence set to local storage.'))
      .catch(error => console.error('Error setting auth persistence:', error));

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        console.log('User found on refresh:', user);
        this.setCurrentUser(user);
      } else {
        console.log('No user found on refresh.');
        this.currentUserSubject.next(null);
      }
    });
  }


  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  async register(email: string, password: string, name: string, role: string): Promise<void> {
    try {
      console.log('Attempting to register user with email:', email);

      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      console.log('User registered successfully:', user);
      console.log('Storing user details in Firestore with role:', role);

      await setDoc(doc(this.firestore, 'users', user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        createdAt: new Date(),
      });

      this.setCurrentUser(user);
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      await setPersistence(this.auth, browserLocalPersistence);
      const userCredential: UserCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      this.setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  getRole(): string | undefined {
    return this.currentUserRole;
  }


  getName(): Observable<string | undefined> {
    return this.currentUserName$;
  }

  private setCurrentUser(user: User) {
    this.currentUserSubject.next(user);


    this.getUserProfile(user.uid)
      .then(userProfile => {
        this.currentUserRole = userProfile.role;
        this.currentUserNameSubject.next(userProfile.name); 
        console.log('User profile set:', { name: userProfile.name, role: this.currentUserRole });
      })
      .catch(error => console.error('Error fetching user profile:', error));
  }

  private getUserProfile(uid: string): Promise<any> {
    const userRef = doc(this.firestore, 'users', uid);
    return getDoc(userRef)
      .then(docSnap => {
        if (docSnap.exists()) {
          return docSnap.data();
        } else {
          throw new Error('User profile not found');
        }
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
        throw error;
      });
  }
}

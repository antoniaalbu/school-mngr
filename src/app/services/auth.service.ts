import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential, User, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { signOut } from '@angular/fire/auth';
import { Store } from '@ngrx/store';  // Import Store
import { setTeacher } from '../teacher/store/teacher.actions';  // Import action to update teacher state
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserRole: string | undefined;
  private currentUserNameSubject: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);
  private auth: Auth = inject(Auth);  
  private firestore: Firestore = inject(Firestore); 
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  public currentUserName$: Observable<string | undefined> = this.currentUserNameSubject.asObservable();

  constructor(private store: Store) {  // Inject Store here
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

      // Register user
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      console.log('User registered successfully:', user);
      console.log('Storing user details in Firestore with role:', role);

      // Store user in Firestore's 'users' collection
      await setDoc(doc(this.firestore, 'users', user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        createdAt: new Date(),
      });

      // If the role is 'teacher', also add to 'teachers' collection
      if (role === 'teacher') {
        await setDoc(doc(this.firestore, 'teachers', user.uid), {
          uid: user.uid,
          name: name,
          email: email,
          role: role,
          createdAt: new Date(),
        });

        console.log('Teacher added to teachers collection:', user.uid);

        // Dispatch an action to update the TeacherState in the store
        this.store.dispatch(setTeacher({
          teacher: { id: user.uid, name: name },
        }));
      }

      // Set the current user
      this.setCurrentUser(user);
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      this.setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth); 
      this.currentUserSubject.next(null); 
      this.currentUserNameSubject.next(undefined); 
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  getRole(): string | undefined {
    return this.currentUserRole;
  }

  getName(): Observable<string | undefined> {
    return this.currentUserName$;
  }

  // Expose a getter for current user's UID
  get currentUserUid$(): Observable<string | null> {
    return this.currentUser$.pipe(
      map(user => user ? user.uid : null)
    );
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

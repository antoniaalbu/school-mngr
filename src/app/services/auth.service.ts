import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential, User, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { signOut } from '@angular/fire/auth';
import { Store } from '@ngrx/store';  
import { setTeacher } from '../teacher/store/teacher.actions';  
import { map } from 'rxjs';
import { Router } from '@angular/router';

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

  constructor(private store: Store, private router: Router) {  
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
  
    
      if (role === 'teacher') {
        await setDoc(doc(this.firestore, 'teachers', user.uid), {
          uid: user.uid,
          name: name,
          email: email,
          role: role,
          createdAt: new Date(),
        });
  
        console.log('Teacher added to teachers collection:', user.uid);
  
        
        this.store.dispatch(setTeacher({
          teacher: { id: user.uid, name: name },
        }));
      }
  
      
      if (role === 'student') {
        await setDoc(doc(this.firestore, 'students', user.uid), {
          uid: user.uid,
          name: name,
          email: email,
          teacherId: 'NJjJ9qZyZKeiP3a4IuI9kdlkUr12', 
          grades: {
           
            'course1': 85, 
            'course2': 90, 
            'course3': 78, 
          },
          createdAt: new Date(),
        });
  
        console.log('Student added to students collection:', user.uid);
      }
  
     
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

  async getUserProfile(uid: string): Promise<any> {
    const userRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(userRef);
  
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.error('User profile not found in Firestore');
      throw new Error('User profile not found');
    }
  }
  

  async logout(): Promise<void> {
    try {
      await signOut(this.auth); 
      this.currentUserSubject.next(null); 
      this.currentUserNameSubject.next(undefined); 
      
      console.log('User logged out successfully');
      this.router.navigate(['']);
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

  
}

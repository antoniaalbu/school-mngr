import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, Routes } from '@angular/router';
import { HomeComponent } from './app/pages/home/home.component';
import { LoginComponent } from './app/components/auth/auth.component';
import { environment } from './app/enviroment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth'; 
import { provideFirestore, getFirestore } from '@angular/fire/firestore'; 
import { StudentComponent } from './app/student/student.component';
import { TeacherComponent } from './app/teacher/teacher.component';
import { PrincipalComponent } from './app/principal/principal.component';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { studentReducer } from './app/student/reducer/student.reducer';
import { teacherReducer } from './app/teacher/store/teacher.reducer';
import { FirestoreSeeder } from './app/utils/firestore-seeder';
import { provideEffects } from '@ngrx/effects';
import { TeacherEffects } from './app/teacher/store/teacher.effects';
import { CourseEffects } from './app/principal/store/course.effects';
import { courseReducer } from './app/principal/reducer/course.reducer';
import { teacherPrinicipalReducer } from './app/principal/reducer/teacher.reducer';
import { TeacherPrincipalEffects } from './app/principal/store/teacher.effects';
import { StudentEffects } from './app/student/store/student.effects';

const routes: Routes = [
  { path: 'student', component: StudentComponent },
  { path: 'teacher', component: TeacherComponent},
  { path: 'principal', component: PrincipalComponent },
  { path: 'auth', component: LoginComponent},
  { path: '', component: HomeComponent },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => {
      const firestore = getFirestore();
      
      
      if (!environment.production) {
        FirestoreSeeder.seedData(firestore)
          .catch(error => console.error('Seeding failed', error));
      }
      
      return firestore;
    }),
    provideStore({ student: studentReducer , teacher: teacherReducer, courses: courseReducer, teachers: teacherPrinicipalReducer}),
    provideEffects(TeacherEffects),
    provideEffects(CourseEffects),
    provideEffects(StudentEffects),
    provideEffects(TeacherPrincipalEffects)
    
  ]
}).catch(err => console.error(err));

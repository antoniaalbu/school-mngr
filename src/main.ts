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

import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';


const routes: Routes = [
  { path: 'student', component: StudentComponent },
  { path: 'teacher', component: TeacherComponent},
  { path: 'principal', component: PrincipalComponent },
  { path: 'auth', component: LoginComponent},
  { path: '', component: HomeComponent },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStore(),
    provideEffects()
],
});

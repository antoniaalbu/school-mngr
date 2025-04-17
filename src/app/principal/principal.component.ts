import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { loadCourses, addCourse, deleteCourse, updateCourse, assignTeacher, unassignTeacher } from './store/course.actions';
import { selectAllCourses, selectLoading, selectError } from './store/course.selector';
import { loadTeachers } from './store/teacher.actions';
import { selectAllTeachers } from './store/teacher.selector';  
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { LogService } from '../logs/log.service';
import { LogActionType } from '../logs/log-action-type.enum';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';


@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PrincipalComponent implements OnInit {
  courses$: Observable<any[]> = of([]);  
  teachers$: Observable<any[]> = of([]);  
  loading$: Observable<boolean> = of(false);
  error$: Observable<string | null> = of(null);
  selectedCourseId: string | null = null;
  newCourseName: string = '';  
  selectedTeacherId: string | null = null;  
  editingCourseId: string | null = null;
  activeSection: string = '';
  isEditing: boolean = false;
  editingCourse: any = null;
  username: string | undefined;
  successMessage: string =  '';
  logs: any[] = [];
  

  constructor(
    private store: Store,
    private authService: AuthService,
    private router: Router,
    private logService: LogService,
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    this.authService.currentUserName$.subscribe(name => {
      this.username = name;
      console.log('Username:', this.username); 
    });
   
    console.log('ngOnInit: Initializing component...');
    
    this.courses$ = this.store.select(selectAllCourses);
    this.teachers$ = this.store.select(selectAllTeachers);  
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
  
    console.log('Dispatching loadCourses and loadTeachers...');
    this.store.dispatch(loadCourses());
    
    console.log('Dispatching loadTeachers...');
    this.store.dispatch(loadTeachers());  
  }

  clearManageView(): void {
    this.activeSection = 'courses'; 
  }

  onAddCourse() {
    console.log('onAddCourse: New course name:', this.newCourseName);
  
    if (!this.newCourseName.trim()) {
      alert('Please enter a valid course name.');
      return;
    }
  
    const newCourse = { id: Math.random().toString(36).substr(2, 9), name: this.newCourseName, teacherId: null };
    console.log('onAddCourse: Dispatching addCourse with:', newCourse);
    
    this.store.dispatch(addCourse({ course: newCourse }));
    
    this.logService.logAction(
      'unknown',  
      'unknown',  
      LogActionType.COURSE_ADDED, 
      { courseName: newCourse.name }  
    );

    this.successMessage = 'Course added successfully!';
  
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
    
    this.newCourseName = ''; 
  }

  onAssignTeacher() {
    if (!this.selectedCourseId || !this.selectedTeacherId) {
      alert('Please select both a course and a teacher!');
      return;
    }
  
    this.store.dispatch(
      assignTeacher({
        courseId: this.selectedCourseId,
        teacherId: this.selectedTeacherId
      })
    );

    this.logService.logAction(
      'unknown',  
      'unknown', 
      LogActionType.TEACHER_ASSIGNED,  
      { courseId: this.selectedCourseId, teacherId: this.selectedTeacherId }  
    );

    this.successMessage = 'Teacher assigned successfully!';
  
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  openEditPopup(course: any) {
    this.editingCourse = { ...course };
    this.isEditing = true;
  }

  closeEditPopup() {
    this.isEditing = false;
    this.editingCourse = null;
  }

  onUpdateCourse(): void {
    if (!this.editingCourse || !this.editingCourse.id || !this.editingCourse.name.trim()) {
      console.log('onUpdateCourse: No course is selected or name is empty.');
      alert('Please select a course and enter a valid name.');
      return;
    }
  
    console.log(`onUpdateCourse: Updating course ID ${this.editingCourse.courseId} with new name: ${this.editingCourse.name}`);
  
    this.store.dispatch(updateCourse({ 
      courseId: this.editingCourse.courseId, 
      name: this.editingCourse.name 
    }));
  

    this.logService.logAction(
      'unknown',  
      'unknown', 
      LogActionType.COURSE_UPDATED,  
      { courseId: this.editingCourse.courseId, newName: this.editingCourse.name }  
    );

    this.closeEditPopup();

    this.store.dispatch(loadCourses());
  
    console.log('onUpdateCourse: Course updated successfully');
  }

  onDeleteCourse(courseId: string) {
    console.log(`onDeleteCourse: Attempting to delete course with ID: ${courseId}`);
    
    if (confirm('Are you sure you want to delete this course?')) {
      console.log(`onDeleteCourse: Dispatching deleteCourse for courseId: ${courseId}`);
      this.store.dispatch(deleteCourse({ courseId }));
      
      this.logService.logAction(
        'unknown',  
        'unknown', 
        LogActionType.COURSE_DELETED,  
        { courseId } 
      );
    } else {
      console.log('onDeleteCourse: Deletion canceled');
    }
  }

  onUnassignTeacher(courseId: string) {
    console.log('onUnassignTeacher: Dispatching unassignTeacher for courseId:', courseId);
    this.store.dispatch(unassignTeacher({ courseId }));
    
    this.logService.logAction(
      'unknown',  
      'unknown', 
      LogActionType.TEACHER_UNASSIGNED,  
      { courseId } 
    );
  }

  fetchLogs() {
    console.log('[fetchLogs] Fetching logs from Firestore...');
    const logsRef = collection(this.firestore, 'logs');
  
    getDocs(logsRef).then((querySnapshot) => {
      this.logs = [];
      console.log(`[fetchLogs] Total documents fetched: ${querySnapshot.size}`);
  
      if (querySnapshot.empty) {
        console.warn('[fetchLogs] No logs found in the collection.');
      }
  
      querySnapshot.forEach((doc) => {
        const logData = doc.data();
        console.log('[fetchLogs] Log entry:', logData);
        this.logs.push(logData);
      });
  
      console.log('[fetchLogs] Finished loading logs. Logs array:', this.logs);
    }).catch((error) => {
      console.error('[fetchLogs] Error fetching logs:', error);
    });
  }
  

  toggleSection(section: string) {
    this.activeSection = section;
    if (section === 'logs') {
      this.fetchLogs(); 
    }
  }

  onLogout() {
    this.authService.logout().then(() => {
      this.router.navigate(['']); 
    });
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
  
}

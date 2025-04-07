import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { loadCourses, addCourse, deleteCourse, updateCourse, assignTeacher, unassignTeacher } from './store/course.actions';
import { selectAllCourses, selectLoading, selectError } from './store/course.selector';
import { loadTeachers } from './store/teacher.actions';
import { selectAllTeachers } from './store/teacher.selector';  // ✅ Selector for teachers
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PrincipalComponent implements OnInit {
  courses$: Observable<any[]> = of([]);  
  teachers$: Observable<any[]> = of([]);  // ✅ Observable for teachers
  loading$: Observable<boolean> = of(false);
  error$: Observable<string | null> = of(null);
  selectedCourseId: string | null = null;
  newCourseName: string = '';  // ✅ Stores new course name
  selectedTeacherId: string | null = null;  // ✅ Stores selected teacher
  editingCourseId: string | null = null;
  activeSection: string = '';
  isEditing: boolean = false;
  editingCourse: any = null;
  username: string | undefined;
  successMessage: string =  '';
  

  constructor(private store: Store, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {

    this.authService.currentUserName$.subscribe(name => {
      this.username = name;
      console.log('Username:', this.username); 
    });
    // Log initial state of observables
    console.log('ngOnInit: Initializing component...');
    
    // Selecting courses and teachers from the store
    this.courses$ = this.store.select(selectAllCourses);
    this.teachers$ = this.store.select(selectAllTeachers);  // ✅ Fetch teachers
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
  
    // Dispatching actions to load data
    console.log('Dispatching loadCourses and loadTeachers...');
    this.store.dispatch(loadCourses());
    
    // Log to check if loadTeachers is being dispatched
    console.log('Dispatching loadTeachers...');
    this.store.dispatch(loadTeachers());  // ✅ Load teachers on init
  }
  clearManageView(): void {
    this.activeSection = 'courses'; // Or any default section you want to navigate to
  }
  onAddCourse() {
    console.log('onAddCourse: New course name:', this.newCourseName);
  
    if (!this.newCourseName.trim()) {
      alert('Please enter a valid course name.');
      return;
    }
  
    const newCourse = { id: Math.random().toString(36).substr(2, 9), name: this.newCourseName, teacherId: null };
    console.log('onAddCourse: Dispatching addCourse with:', newCourse);
    
    // Dispatch addCourse action
    this.store.dispatch(addCourse({ course: newCourse }));
    
    // Set the success message
    this.successMessage = 'Course added successfully!';
    
    // Clear the success message after 3 seconds
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
    
    this.newCourseName = '';  // Reset input field
  }
  
  onAssignTeacher() {
    // Ensure that a course and teacher are selected
    if (!this.selectedCourseId || !this.selectedTeacherId) {
      alert('Please select both a course and a teacher!');
      return;
    }
  
    // Dispatch the action to assign the teacher to the course
    this.store.dispatch(
      assignTeacher({
        courseId: this.selectedCourseId,
        teacherId: this.selectedTeacherId
      })
    );
  
    // Set the success message
    this.successMessage = 'Teacher assigned successfully!';
  
    // Clear the success message after 3 seconds
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  
    // Optionally, you could reset the selection after assignment
    // this.selectedCourseId = null;
    // this.selectedTeacherId = null;
  }
  
  openEditPopup(course: any) {
    this.editingCourse = { ...course }; // Store full course object
    this.isEditing = true;
  }
  
  closeEditPopup() {
    this.isEditing = false;
    this.editingCourse = null;
  }

  // Update the course name based on selected course ID and the new course name
  onUpdateCourse(): void {
    if (!this.editingCourse || !this.editingCourse.id || !this.editingCourse.name.trim()) {
      console.log('onUpdateCourse: No course is selected or name is empty.');
      alert('Please select a course and enter a valid name.');
      return;
    }
  
    console.log(`onUpdateCourse: Updating course ID ${this.editingCourse.courseId} with new name: ${this.editingCourse.name}`);
  
    // Dispatch update action with the correct course ID and name
    this.store.dispatch(updateCourse({ 
      courseId: this.editingCourse.courseId, 
      name: this.editingCourse.name 
    }));
  
    // Close the edit popup and reset state
    this.closeEditPopup();
  
    // Refresh the course list
    this.store.dispatch(loadCourses());
  
    console.log('onUpdateCourse: Course updated successfully');
  }
  
  

  onDeleteCourse(courseId: string) {
    console.log(`onDeleteCourse: Attempting to delete course with ID: ${courseId}`);
    
    if (confirm('Are you sure you want to delete this course?')) {
      console.log(`onDeleteCourse: Dispatching deleteCourse for courseId: ${courseId}`);
      this.store.dispatch(deleteCourse({ courseId }));
    } else {
      console.log('onDeleteCourse: Deletion canceled');
    }
  }

  onUnassignTeacher(courseId: string) {
    console.log('onUnassignTeacher: Dispatching unassignTeacher for courseId:', courseId);
    this.store.dispatch(unassignTeacher({ courseId }));
  }

  onLogout() {
    this.authService.logout().then(() => {
      this.router.navigate(['']); 
    });
  }

}

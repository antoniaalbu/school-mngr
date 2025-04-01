import { Component, OnInit } from '@angular/core';
import { TeacherService } from './services/teacher.service';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { Student, Course } from './models/teacher.state';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TeacherComponent implements OnInit {
  students$: Observable<Student[]> = new Observable();
  teacherCourses$: Observable<Course[]> = new Observable();
  selectedStudent: Student | null = null;
  selectedCourse: string = '';
  newGrade: number | null = null;
  teacherId: string = '';

  constructor(
    private teacherService: TeacherService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: (currentUser) => {
        if (currentUser) {
          this.teacherId = currentUser.uid;
          console.log('Logged-in Teacher ID:', this.teacherId);
  
          this.students$ = this.teacherService.getStudents(this.teacherId);
          this.teacherCourses$ = this.teacherService.getCourses(this.teacherId);
        } else {
          console.log('No teacher is logged in');
        }
      },
      error: (err) => {
        console.error('Error fetching teacher data:', err);
      }
    });
  }
  
  submitGrade(): void {
    if (this.selectedStudent && this.selectedCourse && this.newGrade !== null) {
      console.log(`Submitting grade for student: ${this.selectedStudent.id}, course: ${this.selectedCourse}, grade: ${this.newGrade}`);
  
      this.teacherService.updateGrade(this.selectedStudent.id, this.selectedCourse, this.newGrade)
        .subscribe({
          next: () => {
            console.log('Grade updated successfully');
            alert('Grade saved successfully');
          },
          error: (err) => {
            console.error('Error updating grade:', err);
          }
        });
    } else {
      alert('Please select a course and enter a grade.');
    }
  }
  

  selectStudent(student: Student): void {
    this.selectedStudent = student;
    this.selectedCourse = ''; // Reset course selection
    this.newGrade = null; // Reset grade input
  }

}
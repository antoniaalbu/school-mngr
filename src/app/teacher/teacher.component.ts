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
  studentGrades: { courseId: string; courseName: string; grade: number }[] = [];
  showAssignGradeForm: boolean = false;
  teacherId: string = '';
  teacherName: string = ''; // To hold the teacher's name
  showAssignedStudents: boolean = false; // Controls visibility of assigned students
  username: string | undefined;

  constructor(
    private teacherService: TeacherService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: (currentUser) => {
        if (currentUser) {
          this.teacherId = currentUser.uid;
          this.students$ = this.teacherService.getStudents(this.teacherId);
          this.fetchTeacherCourses();
        }
      },
      error: (err) => console.error('Error fetching teacher data:', err),
    });

    this.authService.currentUserName$.subscribe(name => {
      this.username = name;
      console.log('Username:', this.username); 
    });
  }

  

  fetchTeacherCourses(): void {
    this.teacherCourses$ = this.teacherService.getCourses(this.teacherId);
  }

  toggleAssignedStudents(): void {
    this.showAssignedStudents = !this.showAssignedStudents;
  }

  selectStudent(student: Student): void {
    this.selectedStudent = student;
    this.selectedCourse = '';
    this.newGrade = null;
    this.showAssignGradeForm = false;
    this.fetchGrades(student.id);
  }

  fetchGrades(studentId: string): void {
    this.teacherService.getStudentGrades(studentId).subscribe({
      next: (grades) => {
        this.studentGrades = grades;
      },
      error: (err) => console.error('Error fetching grades:', err),
    });
  }

  submitGrade(): void {
    if (this.selectedStudent && this.selectedCourse && this.newGrade !== null) {
      const newGradeEntry = {
        courseId: this.selectedCourse,
        grade: this.newGrade,
        courseName: this.getCourseName(this.selectedCourse),
      };

      this.teacherService.addGrade(this.selectedStudent.id, newGradeEntry)
        .subscribe({
          next: () => {
            this.fetchGrades(this.selectedStudent!.id);
            this.showAssignGradeForm = false;
          },
          error: (err) => console.error('Error adding grade:', err),
        });
    } else {
      alert('Please select a course and enter a grade.');
    }
  }

  getCourseName(courseId: string): string {
    let courseName = '';
    this.teacherCourses$.subscribe(courses => {
      const selectedCourse = courses.find(course => course.id === courseId);
      courseName = selectedCourse ? selectedCourse.name : '';
    });
    return courseName;
  }
}

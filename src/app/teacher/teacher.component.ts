import { Component, OnInit } from '@angular/core';
import { TeacherService } from './services/teacher.service';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { Student, Course } from './models/teacher.state';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { updateGrade, deleteGrade } from './store/teacher.actions';
import { Store } from '@ngrx/store';

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
  teacherName: string = '';
  showAssignedStudents: boolean = false;
  username: string | undefined;
  filteredCourses: Course[] = [];
  editingGrade: boolean = false;
  editingGradeId: string | null = null;
  editableGrade: number | null = null;



  constructor(
    private teacherService: TeacherService,
    private authService: AuthService,
    private router: Router,
    private store: Store
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
    this.filteredCourses = [];
  
    this.fetchGrades(student.id);
  
    this.teacherCourses$.subscribe((courses) => {
      const enrolledCourseIds = Object.keys(student.grades || {});
  
      this.filteredCourses = courses.filter(course =>
        enrolledCourseIds.includes(course.id)
      );
    });
  }
  

  fetchGrades(studentId: string): void {
    this.teacherService.getStudentGrades(studentId, this.teacherId).subscribe({
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
      if (selectedCourse) {
        courseName = selectedCourse.name;
      }
    });
    return courseName;
  }

  updateGrade(courseId: string, newGrade: number | null): void {
    // Make sure newGrade is a valid number
    if (newGrade !== null && newGrade !== undefined) {
      this.teacherService.updateGrade(this.selectedStudent!.id, courseId, newGrade)
        .subscribe({
          next: () => {
            console.log('Grade updated successfully');
            this.fetchGrades(this.selectedStudent!.id);
          },
          error: (err) => console.error('Error updating grade:', err)
        });
    } else {
      alert('Please enter a valid grade.');
    }
  }
  

  deleteGrade(courseId: string): void {
    if (this.selectedStudent) {
      this.store.dispatch(deleteGrade({
        studentId: this.selectedStudent.id,
        courseId
      }));
  
      this.teacherService.deleteGradeFromServer(this.selectedStudent.id, courseId).subscribe({
        next: () => {
          console.log('Grade deleted successfully');
          // ✅ Re-fetch grades here to refresh the list
          this.fetchGrades(this.selectedStudent!.id);
        },
        error: (err) => console.error('Error deleting grade:', err),
      });
    }
  }
  
  startEditing(grade: { courseId: string; grade: number }): void {
    this.editingGradeId = grade.courseId;
    this.editableGrade = grade.grade;
  }
  
  // Cancel editing
  cancelEdit(): void {
    this.editingGradeId = null;
    this.editableGrade = null;
  }
  
  // Save the updated grade
  saveUpdatedGrade(courseId: string): void {
    if (this.editableGrade === null || this.editableGrade < 0 || this.editableGrade > 100) {
      alert('Please enter a valid grade between 0 and 100.');
      return;
    }
  
    if (this.selectedStudent) {
      this.teacherService.updateGrade(this.selectedStudent.id, courseId, this.editableGrade)
        .subscribe({
          next: () => {
            console.log('Grade updated successfully');
            this.fetchGrades(this.selectedStudent!.id);
            this.cancelEdit();
          },
          error: (err) => console.error('Error updating grade:', err)
        });
    }
  }
  

  
  onLogout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/']); 
    });
  }

}

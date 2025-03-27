import { Component, OnInit } from '@angular/core';
import { TeacherService } from './services/teacher.service';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { Student, Course } from './models/teacher.state';
import { CommonModule } from '@angular/common';
import { StudentService } from '../services/student.service';  // Import StudentService to fetch courses

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class TeacherComponent implements OnInit {
  students$: Observable<Student[]> = new Observable(); // Observable to hold students list
  selectedStudent: Student | null = null; // Selected student to view/edit grades
  username: string | undefined;

  constructor(
    private teacherService: TeacherService,
    private authService: AuthService,
    private studentService: StudentService  // Inject StudentService
  ) {}

  ngOnInit(): void {
    // Subscribe to the current user to get the logged-in teacher's ID
    this.authService.currentUser$.subscribe({
      next: (currentUser) => {
        if (currentUser) {
          const teacherId = currentUser.uid;
          // Fetch students assigned to this teacher
          this.students$ = this.teacherService.getStudents(teacherId); // Assign observable directly
        } else {
          console.log('No teacher is logged in');
        }
      },
      error: (err) => {
        console.error('Error fetching teacher data:', err);
      },
    });
  }

  
  

  
}

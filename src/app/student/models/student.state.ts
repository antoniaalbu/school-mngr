export interface Student {
  id: string;
  name: string;
  email: string;
  grades: Record<string, number>;  // This stores course-specific grades for the student
  teacherId: string;  // References the teacher this student is associated with
}

export interface Course {
  id: string;
  name: string;
  grade: number;  // Student's grade in this course
  studentId: string;  // The student this course belongs to
}

export interface StudentState {
  courses: Course[];  // All courses for a specific student
  loading: boolean;
  error: string | null;
}

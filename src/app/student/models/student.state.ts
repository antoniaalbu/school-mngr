export interface Teacher {
    id: string;
    name: string;
    email: string;
  }
  
  export interface Course {
    id: string;
    name: string;
    grade: number;
    studentId: string;  
  }
  
  export interface StudentState {
    courses: Course[];  // List of courses the student is enrolled in
    loading: boolean;    // Indicates if courses are loading
    error: string | null; // Error message if any
  }
  
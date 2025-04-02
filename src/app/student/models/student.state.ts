export interface Student {
  id: string;
  name: string;
  email: string;
  grades: Record<string, number>;  
  teacherId: string;  
  teachers: Record<string, string>;  
}

export interface Course {
  id: string;
  name: string;
  grade: number; 
  studentId: string; }

export interface StudentState {
  courses: Course[];  
  loading: boolean;
  error: string | null;
}

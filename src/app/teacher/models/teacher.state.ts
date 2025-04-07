
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
    teacherId: string;
  }
  
  export interface Teacher {
    teacher: { id: string, name: string } | null; 
    students: Student[];  
    courses: Course[];    
    loading: boolean;     
    error: string | null; 
  }
  
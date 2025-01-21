export interface ChildFormData {
  name: string;
  age: number;
  birth_date: string;
  location: string;
  story: string;
  school_id: string;
  image_url: string | null;
  status: 'assigned' | 'assignable' | 'inactive' | 'pending' | 'baja';
  grade: string;
}
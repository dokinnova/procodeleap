
export interface Child {
  id: string;
  name: string;
  birth_date: string;
  age: number;
  location: string;
  story: string;
  school_id: string;
  grade: string;
  image_url: string | null;
  status: 'assigned' | 'assignable' | 'inactive' | 'pending' | 'baja';
  priority: 'high' | 'medium' | 'low' | null;
  created_at?: string;
  schools?: School; // Reference to related school
}

export interface Sponsor {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  image_url: string | null;
  first_name: string;
  last_name: string;
  mobile_phone?: string;
  contribution?: number;
  status?: 'active' | 'inactive' | 'pending';
  created_at?: string;
}

export interface School {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  address?: string; // Adding the address field which exists in the database
}

export interface Task {
  id?: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string | null;
  completed_at?: string | null;
  related_to?: string | null;
  child_id?: string | null;
  sponsor_id?: string | null;
  assigned_user_id?: string | null;
  child?: Child;
  sponsor?: Sponsor;
  assigned_user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Add the missing ChildDocument interface
export interface ChildDocument {
  id: string;
  child_id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  description?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

// Let's also add a formatDate utility function since it's missing
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Sin fecha';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

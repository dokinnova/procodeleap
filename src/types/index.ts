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
}

export interface School {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
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

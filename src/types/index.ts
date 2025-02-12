
export interface Child {
  id: string;
  name: string;
  age: number;
  birth_date: string;
  location: string;
  story: string | null;
  image_url: string | null;
  school_id: string | null;
  status: 'assigned' | 'assignable' | 'inactive' | 'pending' | 'baja';
  created_at: string;
  grade: string | null;
  schools?: {
    name: string;
  } | null;
}

export interface School {
  id: string;
  name: string;
  address: string | null;
}

export interface Sponsor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  mobile_phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  contribution: number;
  status: 'active' | 'inactive' | 'pending' | 'baja';
  created_at: string;
}

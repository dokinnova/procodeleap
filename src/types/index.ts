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
}

export interface School {
  id: string;
  name: string;
  address: string | null;
}

export interface Sponsor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  contribution: number;
  status: 'active' | 'inactive' | 'pending' | 'baja';
}
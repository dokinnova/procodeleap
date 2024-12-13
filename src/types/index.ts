export interface Child {
  id: string;
  name: string;
  age: number;
  birth_date: string;
  location: string;
  story: string | null;
  image_url: string | null;
  school_id: string | null;
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
}
export interface Child {
  id: string;
  name: string;
  age: number;
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
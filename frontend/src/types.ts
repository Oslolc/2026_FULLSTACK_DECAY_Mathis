export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'expert' | 'admin';
  created_at: string;
}

export interface Site {
  id: number;
  name: string;
  type: 'Falaise' | 'Bloc' | 'Salle';
  location: string;
  description: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_by: number | null;
  created_by_username: string | null;
  created_at: string;
  route_count?: number;
  climbing_routes?: ClimbingRoute[];
}

export interface ClimbingRoute {
  id: number;
  site_id: number;
  name: string;
  grade: string;
  style: 'Voie' | 'Boulder' | 'Trad' | null;
  description: string | null;
  video_url: string | null;
  created_at: string;
}

export interface LogbookEntry {
  id: number;
  date: string;
  feeling: number | null;
  comment: string | null;
  created_at: string;
  route_id: number;
  route_name: string;
  grade: string;
  style: string | null;
  site_id: number;
  site_name: string;
  site_type: string;
}

export interface MonthlyStats {
  month: string;
  count: string;
}

export interface GradeStats {
  grade: string;
  count: string;
}

export interface Stats {
  monthly: MonthlyStats[];
  grades: GradeStats[];
  total: number;
  hardest_grade: string | null;
  favorite_site: string | null;
}

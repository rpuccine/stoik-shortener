export interface ShortenResponse {
  original_url: string;
  short_url: string;
  short_link: string;
  expires_at?: string | null;
}

export interface StatsResponse {
  original_url: string;
  created_at: string;
  hits: number;
  expires_at?: string | null;
}

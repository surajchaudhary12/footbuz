// types/index.ts

export interface Player {
  player_id: string;
  name: string;
  position: string;
  nationality: string;
  team: string;
  league: string;
  photo_url?: string;
  description?: string;
  birthday?: string;
  height?: string;
  weight?: string;
  jerseyNumber?: string;
  social?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface Match {
  event_id: string;
  league: string;
  season: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  player_id: string;
  fetchedAt: Date;
}
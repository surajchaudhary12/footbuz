/**
 * API Configuration
 * Uses environment variables for different deployment environments
 */

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const API_CONFIG = {
  BASE_URL: API_URL,
  // Common endpoints
  ARTICLES: `${API_URL}/api/articles`,
  NEWS: `${API_URL}/api/news`,
  SCORES: `${API_URL}/api/scores`,
  LEAGUES: `${API_URL}/api/leagues`,
  LEAGUE: (leagueId: string) => `${API_URL}/api/league/${leagueId}`,
  PLAYERS: `${API_URL}/api/players`,
};

export default API_CONFIG;

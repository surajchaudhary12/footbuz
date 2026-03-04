/** API configuration for Next.js frontend */

const normalizeBaseUrl = (url: string) =>
  url
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api$/i, '');

const BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
);

export const API_CONFIG = {
  BASE_URL,
  ARTICLES: `${BASE_URL}/api/articles`,
  NEWS: `${BASE_URL}/api/news`,
  SCORES: `${BASE_URL}/api/scores`,
  FANTASY: `${BASE_URL}/api/fantasy`,
  LEAGUES: `${BASE_URL}/api/leagues`,
  LEAGUE: (leagueId: string) => `${BASE_URL}/api/league/${leagueId}`,
  PLAYERS: `${BASE_URL}/api/players`,
};

export default API_CONFIG;

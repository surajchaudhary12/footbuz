// utils/api.ts

import axios from 'axios';
import { Player, Match } from '../types';
import { API_CONFIG } from './constants';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Search players by name.
 * @param query - Player name query.
 * @returns Promise resolving to an array of Player objects.
 */
export const searchPlayers = async (query: string): Promise<Player[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/players/searchPlayers`, {
      params: { q: query },
    });
    return response.data.players;
  } catch (error: any) {
    console.error('Search Players Error:', error);
    throw error.response?.data?.error || 'Error searching players';
  }
};

/**
 * Get detailed information about a specific player by ID.
 * @param playerId - Unique identifier of the player.
 * @returns Promise resolving to a Player object.
 */
export const getPlayerDetails = async (playerId: string): Promise<Player> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/players/playerDetails/${playerId}`);
    return response.data.response;
  } catch (error: any) {
    console.error('Get Player Details Error:', error);
    throw error.response?.data?.error || 'Error fetching player details';
  }
};

/**
 * Get recent matches for a specific player.
 * @param playerId - Unique identifier of the player.
 * @param limit - Number of recent matches to retrieve.
 * @returns Promise resolving to an array of Match objects.
 */
export const getPlayerMatches = async (playerId: string, limit: number = 5): Promise<Match[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/players/playerMatches/${playerId}`, {
      params: { limit },
    });
    return response.data.matches;
  } catch (error: any) {
    console.error('Get Player Matches Error:', error);
    throw error.response?.data?.error || 'Error fetching player matches';
  }
};

'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

import { API_CONFIG } from '@/utils/constants';

const API_BASE_URL = API_CONFIG.BASE_URL;
const SCORE_REFRESH_DELAY = 60000; // 1 minute for scores
const TEAM_REFRESH_DELAY = 300000; // 5 minutes for team names
const LEAGUE_REFRESH_DELAY = 3600000; // 1 hour for league names

interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

interface Score {
  winner: string | null;
  duration: string;
  fullTime: {
    home: number | null;
    away: number | null;
  };
  halfTime: {
    home: number | null;
    away: number | null;
  };
}

interface Match {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
}

interface LiveScores {
  [key: string]: Match[];
}

const leagueColors: { [key: string]: string } = {
  'UEFA Champions League': 'bg-gradient-to-r from-blue-600 to-blue-400',
  'UEFA Europa League': 'bg-gradient-to-r from-orange-600 to-black',
  'Premier League': 'bg-gradient-to-r from-purple-600 to-blue-600',
  'La Liga': 'bg-gradient-to-r from-red-600 to-yellow-600',
  'Serie A': 'bg-gradient-to-r from-blue-600 to-green-600',
  'Bundesliga': 'bg-gradient-to-r from-red-600 to-gray-600',
  'Ligue 1': 'bg-gradient-to-r from-blue-600 to-red-600',
  'Other': 'bg-gradient-to-r from-gray-600 to-gray-400'
};

const leagueOrder = [
  'UEFA Champions League',
  'UEFA Europa League',
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Ligue 1',
  'Other'
];

export default function LiveScore() {
  const [liveScores, setLiveScores] = useState<LiveScores>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastTeamFetch, setLastTeamFetch] = useState(0);
  const [lastLeagueFetch, setLastLeagueFetch] = useState(0);
  const [expandedLeagues, setExpandedLeagues] = useState<{ [key: string]: boolean }>({});

  const fetchLiveScores = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/scores`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: LiveScores = await response.json();
      setLiveScores(data);
      setError(null);
    } catch (error) {
      console.error("Fetching error:", error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamNames = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/team-names`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: { [key: number]: Team } = await response.json();
      setLiveScores(prevScores => {
        const updatedScores = { ...prevScores };
        Object.keys(updatedScores).forEach(league => {
          updatedScores[league] = updatedScores[league].map(match => ({
            ...match,
            homeTeam: data[match.homeTeam.id] || match.homeTeam,
            awayTeam: data[match.awayTeam.id] || match.awayTeam,
          }));
        });
        return updatedScores;
      });
    } catch (error) {
      console.error("Team fetching error:", error);
    }
  };

  const fetchLeagueNames = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/league-names`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: { [key: string]: string } = await response.json();
      setLiveScores(prevScores => {
        const updatedScores: LiveScores = {};
        Object.keys(prevScores).forEach(oldLeague => {
          const newLeague = data[oldLeague] || oldLeague;
          updatedScores[newLeague] = prevScores[oldLeague];
        });
        return updatedScores;
      });
    } catch (error) {
      console.error("League fetching error:", error);
    }
  };

  useEffect(() => {
    fetchLiveScores();
    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now - lastTeamFetch > TEAM_REFRESH_DELAY) {
        fetchTeamNames();
        setLastTeamFetch(now);
      }
      if (now - lastLeagueFetch > LEAGUE_REFRESH_DELAY) {
        fetchLeagueNames();
        setLastLeagueFetch(now);
      }
      fetchLiveScores();
    }, SCORE_REFRESH_DELAY);

    return () => clearInterval(intervalId);
  }, [lastTeamFetch, lastLeagueFetch]);

  const toggleLeagueExpansion = (league: string) => {
    setExpandedLeagues(prev => ({
      ...prev,
      [league]: !prev[league]
    }));
  };

  const MatchRow = ({ match }: { match: Match }) => (
    <div className="flex justify-between items-center py-2 border-b last:border-b-0">
      <div className="flex items-center space-x-2 w-5/12">
        <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="w-4 h-4" />
        <span className="font-semibold text-sm">{match.homeTeam.name}</span>
      </div>
      <div className="flex flex-col items-center w-2/12">
        <div className="text-sm font-bold items-center">
          {match.score.fullTime.home ?? '-'} - {match.score.fullTime.away ?? '-'}
        </div>
        <div className="text-xs text-gray-500">
          {match.status === 'FINISHED' 
            ? 'FT' 
            : `${new Date(match.utcDate).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })} ${new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 w-5/12">
        <span className="font-semibold text-sm">{match.awayTeam.name}</span>
        <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="w-4 h-4" />
      </div>
    </div>
  );

  const LeagueCard = ({ league, matches }: { league: string, matches: Match[] }) => {
    const isExpanded = expandedLeagues[league];
    const visibleMatches = isExpanded ? matches : matches.slice(0, 3);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader 
            className={`${leagueColors[league] || 'bg-gradient-to-r from-gray-600 to-gray-400'} text-white cursor-pointer hover:bg-opacity-80 transition duration-200`}
            onClick={() => toggleLeagueExpansion(league)}
            style={{ cursor: 'pointer' }}
          >
            <CardTitle className="text-xl flex items-center justify-between">
              <span>{league}</span>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {visibleMatches.map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
            {!isExpanded && matches.length > 3 && (
              <div className="text-center mt-2 text-sm text-gray-500">
                {matches.length - 3} more matches
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Live Scores</h2>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.location.reload()}
          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
        >
          <RefreshCw size={20} />
        </motion.button>
      </div>
      {isLoading ? (
        Array(3).fill(0).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full mb-4" />
        ))
      ) : error ? (
        <Card className="bg-red-100 text-red-700 p-4">
          <CardContent>Error: {error}</CardContent>
        </Card>
      ) : (
        <AnimatePresence>
          {leagueOrder.map(league => 
            liveScores[league] && (
              <LeagueCard key={league} league={league} matches={liveScores[league]} />
            )
          )}
          {Object.keys(liveScores).length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-4 text-gray-600"
            >
              No live matches at the moment.
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
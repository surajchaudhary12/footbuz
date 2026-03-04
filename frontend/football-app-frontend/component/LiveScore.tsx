'use client'

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ChevronDown, ChevronUp, Radio } from 'lucide-react';
import { API_CONFIG } from '@/utils/constants';

const SCORE_REFRESH_DELAY = 60000;

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
  minute?: number | null;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
}

interface LiveScores {
  [key: string]: Match[];
}

const leagueColors: { [key: string]: string } = {
  'UEFA Champions League': 'bg-gradient-to-r from-sky-700 to-indigo-700',
  'UEFA Europa League': 'bg-gradient-to-r from-orange-600 to-zinc-800',
  'Premier League': 'bg-gradient-to-r from-fuchsia-700 to-violet-700',
  'La Liga': 'bg-gradient-to-r from-red-600 to-amber-500',
  'Serie A': 'bg-gradient-to-r from-blue-700 to-emerald-600',
  'Bundesliga': 'bg-gradient-to-r from-rose-700 to-zinc-700',
  'Ligue 1': 'bg-gradient-to-r from-indigo-700 to-rose-600',
  'Other': 'bg-gradient-to-r from-slate-600 to-slate-500'
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

const isLiveStatus = (status: string) =>
  ['IN_PLAY', 'PAUSED', 'LIVE'].includes(status);

const getCenterText = (match: Match) => {
  if (isLiveStatus(match.status)) {
    return match.minute ? `${match.minute}'` : 'LIVE';
  }
  if (match.status === 'FINISHED') return 'FT';
  if (match.status === 'TIMED') {
    return new Date(match.utcDate).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return match.status;
};

const TeamPill = ({ team, align = 'left' }: { team: Team; align?: 'left' | 'right' }) => (
  <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
    {align === 'right' ? (
      <>
        <span className="font-semibold text-sm sm:text-base text-right line-clamp-1">{team.name}</span>
        <Image
          src={team.crest || '/placeholder.svg'}
          alt={team.name}
          width={24}
          height={24}
          className="rounded-full object-contain"
        />
      </>
    ) : (
      <>
        <Image
          src={team.crest || '/placeholder.svg'}
          alt={team.name}
          width={24}
          height={24}
          className="rounded-full object-contain"
        />
        <span className="font-semibold text-sm sm:text-base line-clamp-1">{team.name}</span>
      </>
    )}
  </div>
);

export default function LiveScore() {
  const [liveScores, setLiveScores] = useState<LiveScores>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLeagues, setExpandedLeagues] = useState<{ [key: string]: boolean }>({});

  const fetchLiveScores = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_CONFIG.SCORES);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const source = response.headers.get('x-score-source');
      if (source) {
        console.log(`[LiveScore] data source: ${source}`);
      }
      const data: LiveScores = await response.json();
      setLiveScores(data);
      setError(null);
    } catch (err) {
      console.error("Fetching error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveScores();
    const intervalId = setInterval(fetchLiveScores, SCORE_REFRESH_DELAY);
    return () => clearInterval(intervalId);
  }, []);

  const orderedLeagues = useMemo(() => {
    const keys = Object.keys(liveScores);
    const known = leagueOrder.filter((league) => keys.includes(league));
    const unknown = keys
      .filter((league) => !known.includes(league))
      .sort((a, b) => a.localeCompare(b));
    return [...known, ...unknown];
  }, [liveScores]);

  const toggleLeagueExpansion = (league: string) => {
    setExpandedLeagues((prev) => ({ ...prev, [league]: !prev[league] }));
  };

  const MatchRow = ({ match }: { match: Match }) => (
    <Link href={`/matches/${match.id}`} className="block">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-3 border-b last:border-b-0 hover:bg-slate-50 rounded-md px-2 transition-colors">
        <TeamPill team={match.homeTeam} />
        <div className="text-center min-w-[96px]">
          <div className="font-extrabold text-lg leading-none">
            {(match.score?.fullTime?.home ?? '-')}&nbsp;:&nbsp;{(match.score?.fullTime?.away ?? '-')}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
            {isLiveStatus(match.status) && <Radio className="h-3 w-3 text-red-500" />}
            <span>{getCenterText(match)}</span>
          </div>
        </div>
        <TeamPill team={match.awayTeam} align="right" />
      </div>
    </Link>
  );

  const LeagueCard = ({ league, matches }: { league: string; matches: Match[] }) => {
    const isExpanded = expandedLeagues[league];
    const visibleMatches = isExpanded ? matches : matches.slice(0, 3);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.25 }}
        className="mb-4"
      >
        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-slate-200">
          <CardHeader
            className={`${leagueColors[league] || leagueColors.Other} text-white cursor-pointer`}
            onClick={() => toggleLeagueExpansion(league)}
          >
            <CardTitle className="text-lg sm:text-xl flex items-center justify-between">
              <span>{league}</span>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            {visibleMatches.map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
            {!isExpanded && matches.length > 3 && (
              <div className="text-center mt-2 text-sm text-slate-500">
                {matches.length - 3} more matches
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-slate-900">Live Scores</h2>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchLiveScores}
          className="p-2 rounded-full bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200"
          aria-label="Refresh live scores"
        >
          <RefreshCw size={18} />
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
          {orderedLeagues.map((league) =>
            liveScores[league] ? (
              <LeagueCard key={league} league={league} matches={liveScores[league]} />
            ) : null
          )}
          {Object.keys(liveScores).length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-4 text-slate-600"
            >
              No live matches at the moment.
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

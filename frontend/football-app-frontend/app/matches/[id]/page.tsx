'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { API_CONFIG } from '@/utils/constants';

interface Team {
  id: number;
  name: string;
  shortName?: string;
  crest?: string;
}

interface MatchDetail {
  id: number;
  utcDate: string;
  status: string;
  minute?: number | null;
  competition?: { name?: string; emblem?: string };
  stage?: string | null;
  matchday?: number | null;
  venue?: string | null;
  homeTeam: Team;
  awayTeam: Team;
  score: {
    fullTime?: { home: number | null; away: number | null };
    halfTime?: { home: number | null; away: number | null };
  };
  lineups?: {
    home?: Array<{ id?: number; name?: string; position?: string }>;
    away?: Array<{ id?: number; name?: string; position?: string }>;
  };
  events?: Array<{ minute?: number; scorer?: { name?: string }; team?: { name?: string } }>;
}

interface NewsItem {
  id?: string;
  title?: string;
  headLine?: string;
  url?: string;
  desc?: string;
  player?: string;
}

const isLiveStatus = (status: string) => ['IN_PLAY', 'PAUSED', 'LIVE'].includes(status);

export default function MatchDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchRes, newsRes] = await Promise.all([
          fetch(`${API_CONFIG.SCORES}/${id}`),
          fetch(`${API_CONFIG.NEWS}/players/news`)
        ]);

        if (!matchRes.ok) throw new Error('Failed to fetch match details');
        const matchData: MatchDetail = await matchRes.json();
        setMatch(matchData);

        if (newsRes.ok) {
          const newsData: NewsItem[] = await newsRes.json();
          const home = matchData.homeTeam?.name?.toLowerCase() || '';
          const away = matchData.awayTeam?.name?.toLowerCase() || '';
          const related = newsData.filter((item) => {
            const text = `${item.title || ''} ${item.headLine || ''} ${item.desc || ''}`.toLowerCase();
            return home && away && (text.includes(home) || text.includes(away));
          });
          setNews(related.slice(0, 10));
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unexpected error');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Match not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{match.competition?.name || 'Match Details'}</span>
            <span className="text-sm text-slate-500">
              {isLiveStatus(match.status)
                ? (match.minute ? `${match.minute}'` : 'LIVE')
                : match.status}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex items-center gap-2">
              <Image src={match.homeTeam.crest || '/placeholder.svg'} alt={match.homeTeam.name} width={30} height={30} />
              <span className="font-semibold">{match.homeTeam.name}</span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold">
                {(match.score?.fullTime?.home ?? '-')} : {(match.score?.fullTime?.away ?? '-')}
              </div>
              <div className="text-xs text-slate-500">
                {new Date(match.utcDate).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="font-semibold">{match.awayTeam.name}</span>
              <Image src={match.awayTeam.crest || '/placeholder.svg'} alt={match.awayTeam.name} width={30} height={30} />
            </div>
          </div>
          <div className="text-sm text-slate-500 mt-4">
            {match.venue ? `Venue: ${match.venue}` : 'Venue unavailable'} {match.matchday ? `| Matchday ${match.matchday}` : ''}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lineups</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">{match.homeTeam.name}</h3>
            {match.lineups?.home?.length ? (
              <ul className="space-y-1 text-sm">
                {match.lineups.home.map((p, idx) => (
                  <li key={`${p.id || idx}`}>{p.name || 'Unknown player'} {p.position ? `(${p.position})` : ''}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Lineup not available from free data source.</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-2">{match.awayTeam.name}</h3>
            {match.lineups?.away?.length ? (
              <ul className="space-y-1 text-sm">
                {match.lineups.away.map((p, idx) => (
                  <li key={`${p.id || idx}`}>{p.name || 'Unknown player'} {p.position ? `(${p.position})` : ''}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Lineup not available from free data source.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Match Events / Goals</CardTitle>
        </CardHeader>
        <CardContent>
          {match.events?.length ? (
            <ul className="space-y-2 text-sm">
              {match.events.map((event, idx) => (
                <li key={idx}>
                  <span className="font-semibold">{event.minute ? `${event.minute}' ` : ''}</span>
                  <span>{event.scorer?.name || 'Event'} {event.team?.name ? `(${event.team.name})` : ''}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">
              Detailed minute-by-minute events are limited on this free provider.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related News</CardTitle>
        </CardHeader>
        <CardContent>
          {news.length ? (
            <ul className="space-y-2">
              {news.map((item, idx) => (
                <li key={item.id || idx}>
                  <a
                    className="text-blue-600 hover:underline text-sm"
                    href={item.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.title || item.headLine || 'News'}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">
              No direct match-specific news found yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

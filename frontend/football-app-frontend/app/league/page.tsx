// app/league/page.tsx
'use client';

import { Suspense } from 'react';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { API_CONFIG } from '@/utils/constants';

// Interfaces

interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  venue: string;
  website: string;
  founded: number;
  clubColors: string;
}

interface League {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
  area: {
    id: number;
    name: string;
    code: string;
    flag: string;
  };
  currentSeason: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
    winner: null | string;
  };
}

interface Standing {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface TopScorer {
  player: {
    id: number;
    name: string;
    firstName: string;
    lastName: string | null;
    dateOfBirth: string;
    nationality: string;
    position: string;
    shirtNumber: number | null;
    lastUpdated: string;
  };
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
    address: string;
    website: string;
    founded: number;
    clubColors: string;
    venue: string;
    lastUpdated: string;
  };
  goals: number;
  assists: number;
  penalties: number;
}

export interface LeagueData {
  league: League;
  teams: Team[];
  standings: Standing[];
  topScorers: TopScorer[];
}

function LeaguePageContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code')?.toUpperCase(); // Get 'code' from query parameters and ensure it's uppercase
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Teams' | 'Standings' | 'Top Scorers'>('Teams');

  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        if (!code) {
          throw new Error('No league code provided');
        }
        const response = await fetch(API_CONFIG.LEAGUE(code));
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('League not found');
          }
          throw new Error('Failed to fetch league data');
        }
        const data: LeagueData = await response.json();
        setLeagueData(data);
      } catch (error) {
        console.error('Error fetching league data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (code) {
      fetchLeagueData();
    } else {
      setIsLoading(false);
      setError('No league code provided');
    }
  }, [code]);

  if (isLoading) {
    return <LeagueSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!leagueData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>League not found</AlertDescription>
      </Alert>
    );
  }

  const { league, teams, standings, topScorers } = leagueData;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* League Information Card */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center space-x-4">
          <div className="relative w-16 h-16">
            <Image
              src={league.emblem}
              alt={`${league.name} emblem`}
              width={64}
              height={64}
              className="rounded-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
          </div>
          <div>
            <CardTitle>{league.name}</CardTitle>
            <p className="text-sm text-gray-500">{league.area.name}</p>
          </div>
        </CardHeader>
        <CardContent>
          <p><strong>Current Season:</strong> {league.currentSeason.startDate} to {league.currentSeason.endDate}</p>
          <p><strong>Current Matchday:</strong> {league.currentSeason.currentMatchday}</p>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <div className="mb-6 flex space-x-4" role="tablist" aria-label="League Data Tabs">
        <Button
          variant={activeTab === 'Teams' ? 'default' : 'outline'}
          onClick={() => setActiveTab('Teams')}
          aria-selected={activeTab === 'Teams'}
          role="tab"
        >
          Teams
        </Button>
        <Button
          variant={activeTab === 'Standings' ? 'default' : 'outline'}
          onClick={() => setActiveTab('Standings')}
          aria-selected={activeTab === 'Standings'}
          role="tab"
        >
          Standings
        </Button>
        <Button
          variant={activeTab === 'Top Scorers' ? 'default' : 'outline'}
          onClick={() => setActiveTab('Top Scorers')}
          aria-selected={activeTab === 'Top Scorers'}
          role="tab"
        >
          Top Scorers
        </Button>
      </div>

      {/* Conditional Rendering Based on Active Tab */}
      {activeTab === 'Teams' && (
        <>
          <h2 className="text-2xl font-bold mb-4">Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <Card key={team.id} className="shadow-md">
                <CardHeader className="flex flex-row items-center space-x-4">
                  <div className="relative w-12 h-12">
                    <Image
                      src={team.crest}
                      alt={`${team.name} crest`}
                      width={48}
                      height={48}
                      className="rounded-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Venue:</strong> {team.venue}</p>
                  <p><strong>Founded:</strong> {team.founded}</p>
                  <p><strong>Club Colors:</strong> {team.clubColors}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === 'Standings' && (
        <>
          <h2 className="text-2xl font-bold mb-4">Standings</h2>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-3">Pos</TableHead>
                  <TableHead className="px-6 py-3">Team</TableHead>
                  <TableHead className="px-6 py-3">P</TableHead>
                  <TableHead className="px-6 py-3">W</TableHead>
                  <TableHead className="px-6 py-3">D</TableHead>
                  <TableHead className="px-6 py-3">L</TableHead>
                  <TableHead className="px-6 py-3">GF</TableHead>
                  <TableHead className="px-6 py-3">GA</TableHead>
                  <TableHead className="px-6 py-3">GD</TableHead>
                  <TableHead className="px-6 py-3">Pts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.map((standing) => (
                  <TableRow key={standing.position}>
                    <TableCell className="px-6 py-4">{standing.position}</TableCell>
                    <TableCell className="px-6 py-4 flex items-center space-x-2">
                      <Image
                        src={standing.team.crest}
                        alt={`${standing.team.name} crest`}
                        width={24}
                        height={24}
                        className="rounded-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      <span>{standing.team.name}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4">{standing.playedGames}</TableCell>
                    <TableCell className="px-6 py-4">{standing.won}</TableCell>
                    <TableCell className="px-6 py-4">{standing.draw}</TableCell>
                    <TableCell className="px-6 py-4">{standing.lost}</TableCell>
                    <TableCell className="px-6 py-4">{standing.goalsFor}</TableCell>
                    <TableCell className="px-6 py-4">{standing.goalsAgainst}</TableCell>
                    <TableCell className="px-6 py-4">{standing.goalDifference}</TableCell>
                    <TableCell className="px-6 py-4">{standing.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {activeTab === 'Top Scorers' && (
        <>
          <h2 className="text-2xl font-bold mb-4">Top Scorers</h2>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-3">#</TableHead>
                  <TableHead className="px-6 py-3">Player</TableHead>
                  <TableHead className="px-6 py-3">Team</TableHead>
                  <TableHead className="px-6 py-3">Goals</TableHead>
                  <TableHead className="px-6 py-3">Assists</TableHead>
                  <TableHead className="px-6 py-3">Penalties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topScorers.map((scorer, index) => (
                  <TableRow key={scorer.player.id}>
                    <TableCell className="px-6 py-4">{index + 1}</TableCell>
                    <TableCell className="px-6 py-4 flex items-center space-x-2">
                      <Image
                        src={scorer.team.crest}
                        alt={`${scorer.team.name} crest`}
                        width={24}
                        height={24}
                        className="rounded-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      <Link
                        href={`/players/${scorer.player.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {scorer.player.name}
                      </Link>
                    </TableCell>
                    <TableCell className="px-6 py-4">{scorer.team.name}</TableCell>
                    <TableCell className="px-6 py-4">{scorer.goals}</TableCell>
                    <TableCell className="px-6 py-4">{scorer.assists}</TableCell>
                    <TableCell className="px-6 py-4">{scorer.penalties}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

function LeagueSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* League Information Skeleton */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center space-x-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>

      {/* Tabs Skeleton */}
      <div className="mb-6 flex space-x-4">
        <Skeleton className="h-10 w-24 rounded" />
        <Skeleton className="h-10 w-24 rounded" />
        <Skeleton className="h-10 w-24 rounded" />
      </div>

      {/* Content Skeleton */}
      <Skeleton className="h-8 w-40 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center space-x-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function LeaguePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LeaguePageContent />
    </Suspense>
  )
}

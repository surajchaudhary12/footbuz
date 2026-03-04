'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_CONFIG } from '@/utils/constants';

interface SummaryResponse {
  currentGameweek: { id: number; name: string; deadline: string } | null;
  totalPlayers: number;
  generatedAt: string;
}

interface Fixture {
  id: number;
  kickoff_time: string | null;
  team_h: number;
  team_a: number;
  finished: boolean;
}

interface Team {
  id: number;
  name: string;
  short_name: string;
}

interface BootstrapPlayer {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number;
  now_cost: number;
  form: string;
  points_per_game: string;
  element_type: number;
  total_points: number;
  imageUrl: string;
}

interface ElementType {
  id: number;
  singular_name_short: string;
}

interface BootstrapResponse {
  teams: Team[];
  elements: BootstrapPlayer[];
  element_types: ElementType[];
}

interface MySquadResponse {
  playerIds: number[];
  captainId: number | null;
}

interface GwLiveElement {
  id: number;
  stats: {
    total_points: number;
  };
}

interface GwLiveResponse {
  elements: GwLiveElement[];
}

type FantasyTab = 'pool' | 'squad' | 'performance';

const formatKickoff = (kickoff: string | null) =>
  kickoff
    ? new Date(kickoff).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'TBD';

const ShimmerBlock = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-md bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 ${className}`} />
);

export default function FantasySports() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<BootstrapPlayer[]>([]);
  const [elementTypes, setElementTypes] = useState<ElementType[]>([]);
  const [gwLiveElements, setGwLiveElements] = useState<GwLiveElement[]>([]);
  const [activeTab, setActiveTab] = useState<FantasyTab>('pool');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    const fetchFantasy = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [summaryRes, fixturesRes, bootstrapRes] = await Promise.all([
          fetch(`${API_CONFIG.FANTASY}/summary`),
          fetch(`${API_CONFIG.FANTASY}/fixtures`),
          fetch(`${API_CONFIG.FANTASY}/bootstrap`),
        ]);

        if (!summaryRes.ok || !fixturesRes.ok || !bootstrapRes.ok) {
          throw new Error('Failed to load fantasy data');
        }

        const [summaryData, fixturesData, bootstrapData] = await Promise.all([
          summaryRes.json() as Promise<SummaryResponse>,
          fixturesRes.json() as Promise<Fixture[]>,
          bootstrapRes.json() as Promise<BootstrapResponse>,
        ]);

        setSummary(summaryData);
        setFixtures(Array.isArray(fixturesData) ? fixturesData : []);
        setTeams(Array.isArray(bootstrapData.teams) ? bootstrapData.teams : []);
        setPlayers(Array.isArray(bootstrapData.elements) ? bootstrapData.elements : []);
        setElementTypes(Array.isArray(bootstrapData.element_types) ? bootstrapData.element_types : []);

        if (summaryData.currentGameweek?.id) {
          const gwLiveRes = await fetch(`${API_CONFIG.FANTASY}/gw/${summaryData.currentGameweek.id}/live`);
          if (gwLiveRes.ok) {
            const gwData = (await gwLiveRes.json()) as GwLiveResponse;
            setGwLiveElements(Array.isArray(gwData.elements) ? gwData.elements : []);
          }
        }

        if (authToken) {
          const squadRes = await fetch(`${API_CONFIG.FANTASY}/my-squad`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });

          if (squadRes.ok) {
            const squadData = (await squadRes.json()) as MySquadResponse;
            setSelectedPlayerIds(Array.isArray(squadData.playerIds) ? squadData.playerIds : []);
            setCaptainId(squadData.captainId || null);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unexpected error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFantasy();
  }, [authToken]);

  const teamMap = useMemo(() => {
    const map = new Map<number, string>();
    teams.forEach((t) => map.set(t.id, t.name));
    return map;
  }, [teams]);

  const positionMap = useMemo(() => {
    const map = new Map<number, string>();
    elementTypes.forEach((t) => map.set(t.id, t.singular_name_short));
    return map;
  }, [elementTypes]);

  const playerMap = useMemo(() => {
    const map = new Map<number, BootstrapPlayer>();
    players.forEach((p) => map.set(p.id, p));
    return map;
  }, [players]);

  const pointsMap = useMemo(() => {
    const map = new Map<number, number>();
    gwLiveElements.forEach((e) => map.set(e.id, e.stats?.total_points || 0));
    return map;
  }, [gwLiveElements]);

  const upcomingFixtures = useMemo(() => {
    return fixtures
      .filter((f) => !f.finished)
      .sort((a, b) => new Date(a.kickoff_time || 0).getTime() - new Date(b.kickoff_time || 0).getTime())
      .slice(0, 8);
  }, [fixtures]);

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();
    const sorted = [...players].sort((a, b) => Number(b.form || 0) - Number(a.form || 0));
    const matched = query
      ? sorted.filter((p) => {
          const team = teamMap.get(p.team)?.toLowerCase() || '';
          return (
            p.web_name.toLowerCase().includes(query) ||
            `${p.first_name} ${p.second_name}`.toLowerCase().includes(query) ||
            team.includes(query)
          );
        })
      : sorted;
    return matched.slice(0, 120);
  }, [players, search, teamMap]);

  const mySquadPlayers = useMemo(
    () =>
      selectedPlayerIds
        .map((id) => playerMap.get(id))
        .filter((p): p is BootstrapPlayer => Boolean(p)),
    [selectedPlayerIds, playerMap]
  );

  const weeklyPoints = useMemo(() => {
    return mySquadPlayers.reduce((sum, p) => {
      const base = pointsMap.get(p.id) || 0;
      return sum + (captainId === p.id ? base * 2 : base);
    }, 0);
  }, [mySquadPlayers, pointsMap, captainId]);

  const togglePlayerSelection = (playerId: number) => {
    setSaveMessage(null);
    setSelectedPlayerIds((prev) => {
      if (prev.includes(playerId)) {
        const next = prev.filter((id) => id !== playerId);
        if (captainId === playerId) setCaptainId(null);
        return next;
      }
      if (prev.length >= 15) return prev;
      return [...prev, playerId];
    });
  };

  const saveSquad = async () => {
    if (!authToken) {
      setSaveMessage('Sign in first to save your fantasy squad.');
      return;
    }
    if (selectedPlayerIds.length !== 15) {
      setSaveMessage('Please select exactly 15 players.');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    try {
      const response = await fetch(`${API_CONFIG.FANTASY}/my-squad`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          playerIds: selectedPlayerIds,
          captainId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save squad');
      setSaveMessage('Squad saved successfully.');
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : 'Failed to save squad');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <ShimmerBlock className="h-24 w-full" />
        <div className="grid md:grid-cols-3 gap-3">
          <ShimmerBlock className="h-20 w-full" />
          <ShimmerBlock className="h-20 w-full" />
          <ShimmerBlock className="h-20 w-full" />
        </div>
        <ShimmerBlock className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Fantasy Premier League</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-100 p-3">
            <p className="text-xs text-slate-500">Current Gameweek</p>
            <p className="text-lg font-semibold">{summary?.currentGameweek?.name || 'N/A'}</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-3">
            <p className="text-xs text-slate-500">Selected Players</p>
            <p className="text-lg font-semibold">{selectedPlayerIds.length} / 15</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-3">
            <p className="text-xs text-slate-500">Current GW Points</p>
            <p className="text-lg font-semibold">{weeklyPoints}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant={activeTab === 'pool' ? 'default' : 'outline'} onClick={() => setActiveTab('pool')}>
          Player Pool
        </Button>
        <Button variant={activeTab === 'squad' ? 'default' : 'outline'} onClick={() => setActiveTab('squad')}>
          My Squad
        </Button>
        <Button
          variant={activeTab === 'performance' ? 'default' : 'outline'}
          onClick={() => setActiveTab('performance')}
        >
          Weekly Performance
        </Button>
      </div>

      {activeTab === 'pool' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex flex-wrap gap-2 items-center justify-between">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search player or club..."
                className="max-w-md"
              />
              <Button onClick={saveSquad} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Squad'}
              </Button>
            </div>
            {saveMessage && (
              <p className="text-sm mb-3 text-slate-700 bg-slate-100 rounded px-3 py-2">{saveMessage}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredPlayers.map((player) => {
                const isSelected = selectedPlayerIds.includes(player.id);
                const isCaptain = captainId === player.id;
                return (
                  <div
                    key={player.id}
                    className={`border rounded-lg p-3 flex items-center gap-3 ${
                      isSelected ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <Image
                      src={player.imageUrl || '/placeholder.svg'}
                      alt={player.web_name}
                      width={52}
                      height={64}
                      className="rounded-md object-cover bg-slate-100"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{player.web_name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {teamMap.get(player.team) || 'Unknown'} | {positionMap.get(player.element_type) || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Form: {player.form} | PPG: {player.points_per_game} | Cost: £{(player.now_cost / 10).toFixed(1)}m
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant={isSelected ? 'default' : 'outline'} onClick={() => togglePlayerSelection(player.id)}>
                          {isSelected ? 'Selected' : 'Select'}
                        </Button>
                        <Button
                          size="sm"
                          variant={isCaptain ? 'default' : 'secondary'}
                          disabled={!isSelected}
                          onClick={() => setCaptainId(player.id)}
                        >
                          Captain
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'squad' && (
        <Card>
          <CardHeader>
            <CardTitle>My Saved Squad</CardTitle>
          </CardHeader>
          <CardContent>
            {mySquadPlayers.length === 0 ? (
              <p className="text-sm text-slate-500">No players selected yet. Add players from Player Pool tab.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {mySquadPlayers.map((player) => (
                  <div key={player.id} className="border rounded-lg p-3 flex items-center gap-3">
                    <Image
                      src={player.imageUrl || '/placeholder.svg'}
                      alt={player.web_name}
                      width={52}
                      height={64}
                      className="rounded-md object-cover bg-slate-100"
                    />
                    <div>
                      <p className="font-semibold">
                        {player.web_name} {captainId === player.id ? '(C)' : ''}
                      </p>
                      <p className="text-xs text-slate-500">
                        {teamMap.get(player.team) || 'Unknown'} | {positionMap.get(player.element_type) || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'performance' && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">
              {summary?.currentGameweek?.name || 'Current GW'} points (captain double applied):{' '}
              <span className="font-semibold">{weeklyPoints}</span>
            </p>
            {mySquadPlayers.length === 0 ? (
              <p className="text-sm text-slate-500">Select players to see weekly performance.</p>
            ) : (
              mySquadPlayers.map((player) => {
                const points = pointsMap.get(player.id) || 0;
                const effective = captainId === player.id ? points * 2 : points;
                return (
                  <div key={player.id} className="rounded-md border p-3 flex items-center justify-between">
                    <p className="font-medium">
                      {player.web_name} {captainId === player.id ? '(C)' : ''}
                    </p>
                    <p className="text-sm text-slate-600">
                      Base: {points} | Effective: <span className="font-semibold">{effective}</span>
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upcoming EPL Fixtures</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingFixtures.map((fixture) => (
            <div key={fixture.id} className="rounded-md border p-3 flex items-center justify-between">
              <p className="font-medium">
                {teamMap.get(fixture.team_h) || `Team ${fixture.team_h}`} vs {teamMap.get(fixture.team_a) || `Team ${fixture.team_a}`}
              </p>
              <p className="text-sm text-slate-500">{formatKickoff(fixture.kickoff_time)}</p>
            </div>
          ))}
          {upcomingFixtures.length === 0 && (
            <p className="text-sm text-slate-500">No upcoming fixtures found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

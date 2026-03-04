'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import LiveScore from './LiveScore'
import LeagueSelector from './LeagueSelector'
import NewsArticles from './NewsArticles'
import PlayerSearch from './PlayerSearch'
import TeamHistory from './TeamHistory'
import FantasySports from './FantasySports'
import VideoContent from './VideoContent'

// Mock API function
const fetchData = async (endpoint: string) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  // Return mock data based on endpoint
  switch (endpoint) {
    case 'liveScore':
      return { homeTeam: "Team A", awayTeam: "Team B", homeScore: 2, awayScore: 1 };
    case 'leagues':
      return ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'Champions League', 'Europa League'];
    case 'news':
      return [
        { id: 1, title: "Breaking: Star Player Injured", content: "Team A's star player out for 3 weeks..." },
        { id: 2, title: "Transfer Rumors: Who's Moving Where?", content: "Latest transfer gossip from around the league..." },
      ];
    case 'players':
      return [
        { id: 1, name: "Lionel Messi", team: "Inter Miami", position: "Forward" },
        { id: 2, name: "Cristiano Ronaldo", team: "Al Nassr", position: "Forward" },
      ];
    case 'teams':
      return [
        { id: 1, name: "Manchester United", league: "Premier League", history: "Founded in 1878, 20 league titles..." },
        { id: 2, name: "Real Madrid", league: "La Liga", history: "Founded in 1902, 34 La Liga titles..." },
      ];
    default:
      return [];
  }
};
export default function FootballDashboard() {
  const [activeTab, setActiveTab] = useState('liveScore')

  return (
    <div className="container mx-auto p-4 rounded-3xl border border-slate-200 bg-white/90 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Matchday Hub</p>
          <h1 className="text-4xl sm:text-5xl font-bold">FootballBuzz</h1>
        </div>
        <Link href="/auth">
          <Button className="rounded-full px-6">Sign In</Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="liveScore">Live Score</TabsTrigger>
          <TabsTrigger value="leagues">Leagues</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="fantasy">Fantasy</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="liveScore">
          <LiveScore  />
        </TabsContent>
        <TabsContent value="leagues">
          <LeagueSelector /> {/* Removed fetchData prop */}
        </TabsContent>
        <TabsContent value="news">
          <NewsArticles  />
        </TabsContent>
        <TabsContent value="players">
          <PlayerSearch />
        </TabsContent>
        <TabsContent value="teams">
          <TeamHistory fetchData={fetchData} />
        </TabsContent>
        <TabsContent value="fantasy">
          <FantasySports />
        </TabsContent>
        <TabsContent value="videos">
          <VideoContent />
        </TabsContent>
      </Tabs>
    </div>
  )
}

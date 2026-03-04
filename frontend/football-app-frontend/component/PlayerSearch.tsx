// component/PlayerSearch.tsx
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Player } from '../types';
import { searchPlayers } from '../utils/api';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Image from 'next/image';

const PlayerSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term.");
      setPlayers([]);
      return;
    }

    setLoading(true);
    setPlayers([]);
    setFailedImageIds(new Set());

    try {
      const data = await searchPlayers(searchTerm);
      setPlayers(data);
      if (data.length === 0) {
        toast.info("No players found. Try a different search.");
      }
    } catch (error: any) {
      toast.error(error.message || 'Error searching players.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Player Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {players.map(player => (
              <Link href={`/players/${player.player_id}`} key={player.player_id} passHref>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-2 relative">
                      {player.photo_url && !failedImageIds.has(player.player_id) ? (
                        <Image 
                          src={player.photo_url} 
                          alt={player.name} 
                          fill
                          className="rounded-full object-cover" 
                          onError={() => {
                            setFailedImageIds((prev) => {
                              const next = new Set(prev);
                              next.add(player.player_id);
                              return next;
                            });
                          }}
                        />
                      ) : (
                        <Image
                          src="/placeholder.svg"
                          alt={`${player.name} placeholder`}
                          fill
                          className="rounded-full object-cover"
                        />
                      )}
                    </Avatar>
                    <h3 className="text-lg font-semibold">{player.name}</h3>
                    <p className="text-sm text-gray-500">{player.position} - {player.team}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerSearch;

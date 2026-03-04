'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getPlayerMatches, getPlayerDetails } from '../../../../utils/api';
import { Player, Match } from '../../../../types';
import Navbar from '../../../../component/Navbar';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Avatar, AvatarFallback } from '../../../../components/ui/avatar';
import { Button } from '../../../../components/ui/button';

const PlayerMatchesPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const idParam = Array.isArray(id) ? id[0] : id;  // Ensure id is a string
  const [player, setPlayer] = useState<Player | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!idParam) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const fetchedPlayer = await getPlayerDetails(idParam);
        setPlayer(fetchedPlayer);
        const fetchedMatches = await getPlayerMatches(idParam, 10);
        setMatches(fetchedMatches);
      } catch (error: any) {
        setError(error.message || 'An error occurred while fetching matches.');
        toast.error(error.message || 'Error fetching matches.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idParam, router]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p className="text-xl">Loading matches...</p>
        </div>
      </>
    );
  }

  if (error || !player) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col justify-center items-center h-screen">
          <p className="text-xl text-red-500">{error || 'Player not found.'}</p>
          <Link href="/">
            <a className="mt-4 text-blue-500 underline">Go Back Home</a>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-24 w-24">
            {player.photo_url ? (
              <img src={player.photo_url} alt={player.name} className="rounded-full object-cover h-full w-full" />
            ) : (
              <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{player.name}</h1>
            <p className="text-lg text-gray-600">{player.position} - {player.team}</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Recent Matches</h2>
          {matches.length === 0 ? (
            <p className="mt-2 text-gray-600">No recent matches found.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {matches.map(match => (
                <div key={match.event_id} className="p-4 border rounded-md shadow-sm">
                  <p className="text-lg"><strong>{match.homeTeam}</strong> vs <strong>{match.awayTeam}</strong></p>
                  <p className="text-sm text-gray-600">{match.date} at {match.time}</p>
                  <p className="mt-1">Score: {match.homeScore !== null && match.awayScore !== null ? `${match.homeScore} - ${match.awayScore}` : 'N/A'}</p>
                  <p>Status: {match.status}</p>
                  <p>League: {match.league}</p>
                  <p>Season: {match.season}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <Button onClick={() => router.push(`/players/${idParam}`)} className="bg-blue-500 hover:bg-blue-600">
            Back to Player Details
          </Button>
        </div>
      </div>
    </>
  );
};

export default PlayerMatchesPage;
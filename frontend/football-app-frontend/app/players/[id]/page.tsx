'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPlayerDetails, getPlayerMatches } from '../../../utils/api';
import { Player, Match } from '../../../types';
import Navbar from '../../../component/Navbar';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';
import { toast } from 'react-toastify';

const PlayerPage: React.FC = () => {
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
        const fetchedMatches = await getPlayerMatches(idParam, 5);
        setMatches(fetchedMatches);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching player data.');
        toast.error(err.message || 'Error fetching player data.');
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
          <p className="text-xl">Loading player details...</p>
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
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <Avatar className="h-40 w-40">
            {player.photo_url ? (
              <img src={player.photo_url} alt={player.name} className="rounded-full object-cover h-full w-full" />
            ) : (
              <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{player.name}</h1>
            <p className="text-lg text-gray-600">{player.position}</p>
            <div className="flex space-x-3 mt-2">
              {player.social?.twitter && (
                <a href={`https://twitter.com/${player.social.twitter}`} target="_blank" rel="noopener noreferrer">
                  <FaTwitter className="h-6 w-6 text-blue-400 hover:text-blue-600" />
                </a>
              )}
              {player.social?.facebook && (
                <a href={`https://facebook.com/${player.social.facebook}`} target="_blank" rel="noopener noreferrer">
                  <FaFacebook className="h-6 w-6 text-blue-600 hover:text-blue-800" />
                </a>
              )}
              {player.social?.instagram && (
                <a href={`https://instagram.com/${player.social.instagram}`} target="_blank" rel="noopener noreferrer">
                  <FaInstagram className="h-6 w-6 text-pink-500 hover:text-pink-700" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Player Information</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Nationality:</strong> {player.nationality || 'N/A'}</p>
              <p><strong>Team:</strong> {player.team || 'N/A'}</p>
              <p><strong>League:</strong> {player.league || 'N/A'}</p>
              <p><strong>Birthday:</strong> {player.birthday || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Height:</strong> {player.height || 'N/A'}</p>
              <p><strong>Weight:</strong> {player.weight || 'N/A'}</p>
              <p><strong>Jersey Number:</strong> {player.jerseyNumber || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Description</h2>
          <p className="mt-2 text-gray-700">{player.description || 'No description available.'}</p>
        </div>

        <div className="mt-8">
          <Button onClick={() => router.push(`/players/${idParam}/matches`)} className="bg-blue-500 hover:bg-blue-600">
            View Recent Matches
          </Button>
        </div>

        <div className="mt-16">
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
      </div>
    </>
  );
};

export default PlayerPage;
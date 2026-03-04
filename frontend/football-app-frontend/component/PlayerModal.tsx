// components/PlayerModal.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getPlayerDetails, getPlayerMatches } from '../utils/api';
import { Player, Match } from '../types';
import { useRouter } from 'next/navigation';
import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';

interface PlayerModalProps {
  playerId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PlayerModal: React.FC<PlayerModalProps> = ({ playerId, isOpen, onClose }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError('');
      const fetchPlayerData = async () => {
        try {
          const fetchedPlayer = await getPlayerDetails(playerId);
          setPlayer(fetchedPlayer);
          const fetchedMatches = await getPlayerMatches(playerId, 5);
          setMatches(fetchedMatches);
        } catch (err: any) {
          setError(err);
        } finally {
          setLoading(false);
        }
      };
      fetchPlayerData();
    }
  }, [isOpen, playerId]);

  const handleViewMatches = () => {
    onClose(); // Close the modal
    router.push(`/players/${playerId}/matches`);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>{player?.name || 'Player Details'}</DialogTitle>
          <DialogClose />
        </DialogHeader>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : player ? (
          <div className="p-4 space-y-4">
            {/* Player Avatar */}
            <div className="flex items-center space-x-4">
              <Avatar className="w-24 h-24">
                {player.photo_url ? (
                  <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold">{player.name}</h2>
                <p className="text-gray-600">{player.position}</p>
              </div>
            </div>

            {/* Player Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <strong>Nationality:</strong> {player.nationality || 'N/A'}
              </div>
              <div>
                <strong>Team:</strong> {player.team || 'N/A'}
              </div>
              <div>
                <strong>League:</strong> {player.league || 'N/A'}
              </div>
              <div>
                <strong>Birthday:</strong> {player.birthday || 'N/A'}
              </div>
              <div>
                <strong>Height:</strong> {player.height || 'N/A'}
              </div>
              <div>
                <strong>Weight:</strong> {player.weight || 'N/A'}
              </div>
              <div>
                <strong>Jersey Number:</strong> {player.jerseyNumber || 'N/A'}
              </div>
            </div>

            {/* Description */}
            <div>
              <strong>Description:</strong>
              <p className="mt-2 text-gray-700">
                {player.description || 'No description available.'}
              </p>
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-4 mt-4">
              {player.social?.twitter && (
                <a
                  href={`https://twitter.com/${player.social.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 flex items-center space-x-1"
                >
                  <FaTwitter />
                  <span>Twitter</span>
                </a>
              )}
              {player.social?.facebook && (
                <a
                  href={`https://facebook.com/${player.social.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-900 flex items-center space-x-1"
                >
                  <FaFacebook />
                  <span>Facebook</span>
                </a>
              )}
              {player.social?.instagram && (
                <a
                  href={`https://instagram.com/${player.social.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:text-pink-700 flex items-center space-x-1"
                >
                  <FaInstagram />
                  <span>Instagram</span>
                </a>
              )}
            </div>

            {/* View Recent Matches Button */}
            <div className="mt-6">
              <Button onClick={handleViewMatches} className="w-full">
                View Recent Matches
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">Player not found.</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlayerModal;
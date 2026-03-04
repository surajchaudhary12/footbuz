'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

// Define the LeagueData interface
interface LeagueData {
  id: string;
  name: string;
  country: string;
  logoUrl: string;
  // Add other fields you get from the API response
}

export default function LeaguePage() {
  const { leagueId } = useParams();
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        const { API_CONFIG } = await import('@/utils/constants')
        const response = await fetch(API_CONFIG.LEAGUE(leagueId as string));
        if (!response.ok) {
          throw new Error('Failed to fetch league data');
        }
        
        const data: LeagueData = await response.json(); // Ensure 'data' matches LeagueData
        setLeagueData(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (leagueId) {
      fetchLeagueData();
    }
  }, [leagueId]);

  return (
    <div>
      {isLoading && (
        <Skeleton className="h-10 w-full" />
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {leagueData && (
        <Card>
          <CardHeader>
            <CardTitle>{leagueData.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Image src={leagueData.logoUrl} alt={`${leagueData.name} Logo`} width={100} height={100} />
            <p>Country: {leagueData.country}</p>
            {/* Render other league details */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
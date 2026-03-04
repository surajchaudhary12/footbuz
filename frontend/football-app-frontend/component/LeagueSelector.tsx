// /app/components/LeagueSelector.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface League {
  id: number
  name: string
  code: string
  type: string
  emblem: string
  area: {
    id: number
    name: string
    code: string
    flag: string | null
  }
}

interface LeaguesResponse {
  count: number
  leagues: League[]
}

export default function LeagueSelector() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/leagues') // Use absolute URL
        if (!response.ok) {
          throw new Error('Failed to fetch leagues')
        }
        const data: LeaguesResponse = await response.json()
        setLeagues(data.leagues)
      } catch (error) {
        console.error('Error fetching leagues:', error)
        setError('Failed to load leagues. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeagues()
  }, [])

  if (isLoading) {
    return <LeagueSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {leagues.map((league) => (
        <Link
          href={`/league?code=${encodeURIComponent(league.code)}`} // Pass code as query parameter
          key={league.code}
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center space-x-4">
              <div className="relative w-12 h-12">
                <Image
                  src={league.emblem}
                  alt={`${league.name} emblem`}
                  width={48}
                  height={48}
                  className="rounded-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder.svg'
                  }}
                />
              </div>
              <CardTitle className="text-lg">{league.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{league.area.name}</p>
              <p className="text-sm text-gray-500">{league.type}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

function LeagueSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center space-x-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
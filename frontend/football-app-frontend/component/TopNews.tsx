// /app/components/TopNews.tsx

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import NewsModal from './NewsModal'
import { ModalArticle } from '../types/types'

interface Article {
  headLine: string
  url: string
  source: string
}

interface TopNewsResponse {
  club: string
  topPlayers: Article[]
}

export default function TopNews() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<ModalArticle | null>(null)

  useEffect(() => {
    const fetchTopNews = async () => {
      try {
        const { API_CONFIG } = await import('@/utils/constants')
        const response = await fetch(API_CONFIG.ARTICLES)
        if (!response.ok) {
          throw new Error('Failed to fetch top news')
        }
        const data: TopNewsResponse = await response.json()
        setArticles(data.topPlayers)
      } catch (error) {
        console.error('Error fetching top news:', error)
        setError('Failed to load top news. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopNews()
  }, [])

  if (isLoading) {
    return <TopNewsSkeleton />
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
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            {['RealMadrid', 'Barcelona'].map((club) => (
              <motion.div
                key={club}
                className="relative cursor-pointer rounded-lg overflow-hidden shadow-lg"
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  const clubArticle = articles.find(a => a.headLine.toLowerCase().includes(club.toLowerCase()))
                  if (clubArticle) {
                    setSelectedArticle({
                      player: club,
                      desc: clubArticle.headLine,
                      content: clubArticle.source,
                      website: clubArticle.url
                    })
                  }
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={club === 'RealMadrid' ? '/RealMadrid.png' : '/Barcelona.png'} // Ensure these images exist in /public
                  alt={`${club} Logo`}
                  width={200}
                  height={200}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement
                    target.src = '/placeholder.svg'
                  }}
                />
                <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black via-transparent">
                  <h3 className="text-lg font-semibold text-white">{club}</h3>
                </div>
              </motion.div>
            ))}

            {/* Other Clubs Placeholder */}
            <motion.div
              className="relative cursor-pointer rounded-lg overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-center text-gray-500">Other Clubs Coming Soon</p>
              {/* Add a loading spinner or placeholder if desired */}
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Detailed View */}
      {selectedArticle && (
        <NewsModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </>
  )
}

function TopNewsSkeleton() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Top News</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          {[...Array(2)].map((_, index) => (
            <Skeleton key={index} className="w-full md:w-1/2 h-40 rounded-lg" />
          ))}

          {/* Placeholder for Other Clubs */}
          <Skeleton className="w-full md:w-1/2 h-40 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

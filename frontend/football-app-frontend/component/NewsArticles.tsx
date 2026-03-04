'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, User, Repeat, Users, Newspaper } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import NewsModal from './NewsModal';
import { NewsArticle, ModalArticle } from '@/types/types'; // Import centralized types
import { API_CONFIG } from '@/utils/constants';

export default function NewsArticles() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ModalArticle | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const results = await Promise.allSettled([
          fetch(`${API_CONFIG.ARTICLES}`),
          fetch(`${API_CONFIG.NEWS}/players/news`),
          fetch(`${API_CONFIG.NEWS}/players/transfers`),
          fetch(`${API_CONFIG.NEWS}/players`)
        ]);

        const extractJson = async (result: PromiseSettledResult<Response>) => {
          if (result.status !== 'fulfilled' || !result.value.ok) {
            return [];
          }
          const json = await result.value.json();
          return Array.isArray(json) ? json : [];
        };

        const [userArticlesData, newsData, transfersData, playerNewsData] =
          await Promise.all(results.map(extractJson));

        if (
          userArticlesData.length === 0 &&
          newsData.length === 0 &&
          transfersData.length === 0 &&
          playerNewsData.length === 0
        ) {
          throw new Error('Failed to fetch news');
        }

        const combinedArticles: NewsArticle[] = [
          ...userArticlesData.map((article) => ({
            ...article,
            type: 'userArticle' as const,
            player: article.player, // Ensure 'player' exists
            desc: article.desc      // Ensure 'desc' exists
          })),
          ...transfersData.map((article) => ({
            id: article.id || crypto.randomUUID(),
            title: article.title || article.headLine || 'Transfer Update',
            headingImage: article.headingImage || '',
            content: article.content || article.source || '',
            author: article.author || article.source || '',
            type: 'transfer' as const,
            player: article.player,
            desc: article.desc || article.headLine,
            website: article.website || article.url
          })),
          ...newsData.map((article) => ({
            id: article.id || crypto.randomUUID(),
            title: article.title || article.headLine || 'Football News',
            headingImage: article.headingImage || '',
            content: article.content || article.source || '',
            author: article.author || article.source || '',
            type: 'general' as const,
            player: article.player,
            desc: article.desc || article.headLine,
            website: article.website || article.url
          })),
          ...playerNewsData.map((article) => ({
            id: article.id || crypto.randomUUID(),
            title: article.title || article.player || 'Player Update',
            headingImage: article.headingImage || '',
            content: article.content || '',
            author: article.author || '',
            type: 'player' as const,
            player: article.player,
            desc: article.desc || article.title,
            website: article.website
          }))
        ];

        setArticles(combinedArticles);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleArticleClick = (article: NewsArticle) => {
    const modalArticle: ModalArticle = {
      title: article.title,
      source: article.author || article.content,
      player: article.player,
      desc: article.desc || article.content || article.title,
      content: article.content,
      website: article.website
    };
    setSelectedArticle(modalArticle);
  };

  if (isLoading) return <NewsSkeleton />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onClick={() => handleArticleClick(article)}
          />
        ))}
      </div>
      <NewsModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </>
  );
}

const ArticleCard = ({
  article,
  onClick
}: {
  article: NewsArticle;
  onClick: () => void;
}) => (
  <motion.div
    className="cursor-pointer"
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center space-x-2">
          {article.type === 'userArticle' && <User className="h-5 w-5 text-purple-500" />}
          {article.type === 'transfer' && <Repeat className="h-5 w-5 text-blue-500" />}
          {article.type === 'player' && <Users className="h-5 w-5 text-green-500" />}
          {article.type === 'general' && <Newspaper className="h-5 w-5 text-orange-500" />}
          <CardTitle className="text-lg">
            {getArticleTypeTitle(article.type)}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <h3 className="text-md font-semibold mb-2">{article.title}</h3>
        <div className="relative h-40 mb-2">
          <Image
            src={article.headingImage || '/placeholder.svg'}
            alt={article.title}
            fill
            className="rounded-md object-cover"
          />
        </div>
        <p className="text-sm text-gray-600">
          {article.type === 'userArticle' ? `By ${article.author}` : 'Read more...'}
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

const getArticleTypeTitle = (type: NewsArticle['type']) => {
  switch (type) {
    case 'userArticle':
      return 'User Article';
    case 'transfer':
      return 'Transfer News';
    case 'player':
      return 'Player News';
    case 'general':
      return 'General News';
    default:
      return 'News';
  }
};

const NewsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {[...Array(8)].map((_, index) => (
      <Card key={index}>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-40 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

'use client'

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from 'lucide-react';
import { ModalArticle } from '../types/types'; // Adjust the import path as necessary

interface NewsModalProps {
  article: ModalArticle | null;
  onClose: () => void;
}

export default function NewsModal({ article, onClose }: NewsModalProps) {
  if (!article) return null;

  const title = article.title || article.player || 'Article';
  const source = article.source || article.content || 'Unknown';
  const description = article.desc || article.content || 'No description available';

  return (
    <Dialog open={!!article} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription>
            Source: {source}
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-gray-700 whitespace-pre-wrap mt-4">
          {description}
        </div>
        {article.website && (
          <div className="mt-4">
            <Button variant="outline" onClick={() => window.open(article.website, '_blank')}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open full article
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// types/types.ts

export interface BaseArticle {
  id: string;
  title: string;
  headingImage: string;
  content: string;
  author: string;
  // Optional fields present on some article variants
  player?: string;
  desc?: string;
  website?: string;
}

export interface UserArticle extends BaseArticle {
  type: 'userArticle';
  player?: string;
  desc?: string;
}

export interface TransferArticle extends BaseArticle {
  type: 'transfer';
  player?: string;
  desc?: string;
}

export interface PlayerArticle extends BaseArticle {
  type: 'player';
  player?: string;
  desc?: string;
}

export interface GeneralArticle extends BaseArticle {
  type: 'general';
  player?: string; // Add this line! The '?' means it's optional.
  desc?: string;
}

export type NewsArticle = UserArticle | TransferArticle | PlayerArticle | GeneralArticle;

export interface ModalArticle {
  title?: string;
  source?: string;
  player?: string;
  desc?: string;
  content?: string;
  website?: string;
}

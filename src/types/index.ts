// Photo type
export interface Photo {
  objectId?: string;
  url: string;
  author: 'A' | 'B';
  originalId: string;
  title?: string;
  createdAt?: string;
}

// Vote type for A/B comparison
export interface Vote {
  objectId?: string;
  originalId: string;
  winner: 'A' | 'B';
  voter: string;
  createdAt?: string;
}

// Rating type for single photo rating
export interface Rating {
  objectId?: string;
  photoId: string;
  score: number;
  voter: string;
  createdAt?: string;
}

// Statistics types
export interface PhotoStats {
  photo: Photo;
  voteCount: number;
  winCount: number;
  winRate: number;
  avgRating: number;
  ratingCount: number;
}

export interface AuthorStats {
  author: 'A' | 'B';
  totalVotes: number;
  totalWins: number;
  winRate: number;
  avgRating: number;
  totalRatings: number;
}

// Comparison pair for A/B voting
export interface ComparisonPair {
  originalId: string;
  photoA: Photo;
  photoB: Photo;
}

// Bmob REST API Service
const APP_ID = import.meta.env.VITE_BMOB_APP_ID || 'f037b713f60fe4935fb4d6b4b67b7bf6';
const REST_API_KEY = import.meta.env.VITE_BMOB_REST_API_KEY || '11fab69bf7240057ce041acf272a60d3';
const API_BASE = 'https://api.bmobcloud.com/1';
const FILE_API_BASE = 'https://api.bmobcloud.com/2/files';

// Admin password hash (SHA-256)
// To generate: echo -n "your_password" | sha256sum
const ADMIN_PASSWORD_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH || '5e5eb431754e0e542971f4488b1d8d82e993381de5a34920c5d6f08c1e52393d';

// Check if Bmob credentials are configured
if (!APP_ID || !REST_API_KEY) {
  console.error('Bmob credentials not configured');
}

// Simple SHA-256 hash function
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify admin password
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = await sha256(password);
  return hash === ADMIN_PASSWORD_HASH;
}

interface BmobObject {
  objectId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BmobQueryResult<T> {
  results: T[];
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'X-Bmob-Application-Id': APP_ID,
      'X-Bmob-REST-API-Key': REST_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

// File upload to Bmob
interface BmobFileResponse {
  filename: string;
  url: string;
  cdn: string;
}

export async function uploadFile(file: File): Promise<string> {
  const filename = `${Date.now()}_${file.name}`;

  const response = await fetch(`${FILE_API_BASE}/${encodeURIComponent(filename)}`, {
    method: 'POST',
    headers: {
      'X-Bmob-Application-Id': APP_ID,
      'X-Bmob-REST-API-Key': REST_API_KEY,
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Upload failed: ${response.status}`);
  }

  const result: BmobFileResponse = await response.json();
  return result.url || result.cdn;
}

// Photo types and operations
interface PhotoData extends BmobObject {
  url: string;
  author: 'A' | 'B';
  originalId: string;
  title?: string;
}

export async function createPhoto(data: {
  url: string;
  author: 'A' | 'B';
  originalId: string;
  title?: string;
}) {
  return request<PhotoData>('/classes/Photo', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPhotos() {
  const result = await request<BmobQueryResult<PhotoData>>(
    '/classes/Photo?order=-createdAt&limit=1000'
  );
  return result.results.map((item) => ({
    objectId: item.objectId,
    url: item.url,
    author: item.author,
    originalId: item.originalId,
    title: item.title,
    createdAt: item.createdAt,
  }));
}

export async function getPhotosByOriginalId(originalId: string) {
  const where = encodeURIComponent(JSON.stringify({ originalId }));
  const result = await request<BmobQueryResult<PhotoData>>(
    `/classes/Photo?where=${where}`
  );
  return result.results.map((item) => ({
    objectId: item.objectId,
    url: item.url,
    author: item.author,
    originalId: item.originalId,
    title: item.title,
    createdAt: item.createdAt,
  }));
}

export async function getComparisonPairs() {
  const photos = await getPhotos();
  const grouped: Record<string, typeof photos> = {};

  photos.forEach((photo) => {
    if (!grouped[photo.originalId]) {
      grouped[photo.originalId] = [];
    }
    grouped[photo.originalId].push(photo);
  });

  const pairs: Array<{
    originalId: string;
    photoA: (typeof photos)[0];
    photoB: (typeof photos)[0];
  }> = [];

  Object.entries(grouped).forEach(([originalId, group]) => {
    const photoA = group.find((p) => p.author === 'A');
    const photoB = group.find((p) => p.author === 'B');
    if (photoA && photoB) {
      pairs.push({ originalId, photoA, photoB });
    }
  });

  return pairs;
}

export async function deletePhoto(objectId: string) {
  return request(`/classes/Photo/${objectId}`, {
    method: 'DELETE',
  });
}

// Vote types and operations
interface VoteData extends BmobObject {
  originalId: string;
  winner: 'A' | 'B';
  voter: string;
}

export async function createVote(data: {
  originalId: string;
  winner: 'A' | 'B';
  voter: string;
}) {
  return request<VoteData>('/classes/Vote', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      voter: data.voter || '匿名',
    }),
  });
}

export async function getVotes() {
  const result = await request<BmobQueryResult<VoteData>>(
    '/classes/Vote?order=-createdAt&limit=1000'
  );
  return result.results.map((item) => ({
    objectId: item.objectId,
    originalId: item.originalId,
    winner: item.winner,
    voter: item.voter,
    createdAt: item.createdAt,
  }));
}

export async function getVotesByOriginalId(originalId: string) {
  const where = encodeURIComponent(JSON.stringify({ originalId }));
  const result = await request<BmobQueryResult<VoteData>>(
    `/classes/Vote?where=${where}`
  );
  return result.results.map((item) => ({
    objectId: item.objectId,
    originalId: item.originalId,
    winner: item.winner,
    voter: item.voter,
    createdAt: item.createdAt,
  }));
}

// Rating types and operations
interface RatingData extends BmobObject {
  photoId: string;
  score: number;
  voter: string;
}

export async function createRating(data: {
  photoId: string;
  score: number;
  voter: string;
}) {
  return request<RatingData>('/classes/Rating', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      voter: data.voter || '匿名',
    }),
  });
}

export async function getRatings() {
  const result = await request<BmobQueryResult<RatingData>>(
    '/classes/Rating?order=-createdAt&limit=1000'
  );
  return result.results.map((item) => ({
    objectId: item.objectId,
    photoId: item.photoId,
    score: item.score,
    voter: item.voter,
    createdAt: item.createdAt,
  }));
}

export async function getRatingsByPhotoId(photoId: string) {
  const where = encodeURIComponent(JSON.stringify({ photoId }));
  const result = await request<BmobQueryResult<RatingData>>(
    `/classes/Rating?where=${where}`
  );
  return result.results.map((item) => ({
    objectId: item.objectId,
    photoId: item.photoId,
    score: item.score,
    voter: item.voter,
    createdAt: item.createdAt,
  }));
}

// Statistics
export async function getAuthorStats() {
  const [photos, votes, ratings] = await Promise.all([
    getPhotos(),
    getVotes(),
    getRatings(),
  ]);

  const stats: Record<'A' | 'B', {
    totalVotes: number;
    totalWins: number;
    totalRatings: number;
    totalScore: number;
  }> = {
    A: { totalVotes: 0, totalWins: 0, totalRatings: 0, totalScore: 0 },
    B: { totalVotes: 0, totalWins: 0, totalRatings: 0, totalScore: 0 },
  };

  // Count votes
  votes.forEach((vote) => {
    stats.A.totalVotes++;
    stats.B.totalVotes++;
    const winner = vote.winner as 'A' | 'B';
    stats[winner].totalWins++;
  });

  // Count ratings
  const photoMap = new Map(photos.map((p) => [p.objectId, p]));
  ratings.forEach((rating) => {
    const photo = photoMap.get(rating.photoId);
    if (photo) {
      const author = photo.author as 'A' | 'B';
      stats[author].totalRatings++;
      stats[author].totalScore += rating.score;
    }
  });

  return {
    A: {
      author: 'A' as const,
      totalVotes: stats.A.totalVotes,
      totalWins: stats.A.totalWins,
      winRate: stats.A.totalVotes > 0 ? stats.A.totalWins / stats.A.totalVotes : 0,
      avgRating: stats.A.totalRatings > 0 ? stats.A.totalScore / stats.A.totalRatings : 0,
      totalRatings: stats.A.totalRatings,
    },
    B: {
      author: 'B' as const,
      totalVotes: stats.B.totalVotes,
      totalWins: stats.B.totalWins,
      winRate: stats.B.totalVotes > 0 ? stats.B.totalWins / stats.B.totalVotes : 0,
      avgRating: stats.B.totalRatings > 0 ? stats.B.totalScore / stats.B.totalRatings : 0,
      totalRatings: stats.B.totalRatings,
    },
  };
}

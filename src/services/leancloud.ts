import AV from 'leancloud-storage';

// Initialize LeanCloud
const appId = import.meta.env.VITE_LEANCLOUD_APP_ID;
const appKey = import.meta.env.VITE_LEANCLOUD_APP_KEY;
const serverURL = import.meta.env.VITE_LEANCLOUD_SERVER_URL;

if (appId && appKey) {
  AV.init({
    appId,
    appKey,
    serverURL,
  });
}

// Photo class
const Photo = AV.Object.extend('Photo');
// Vote class
const Vote = AV.Object.extend('Vote');
// Rating class
const Rating = AV.Object.extend('Rating');

// Photo operations
export async function createPhoto(data: {
  url: string;
  author: 'A' | 'B';
  originalId: string;
  title?: string;
}) {
  const photo = new Photo();
  photo.set('url', data.url);
  photo.set('author', data.author);
  photo.set('originalId', data.originalId);
  if (data.title) {
    photo.set('title', data.title);
  }
  return await photo.save();
}

export async function getPhotos() {
  const query = new AV.Query('Photo');
  query.descending('createdAt');
  const results = await query.find();
  return results.map((item) => ({
    objectId: item.id,
    url: item.get('url'),
    author: item.get('author'),
    originalId: item.get('originalId'),
    title: item.get('title'),
    createdAt: item.createdAt?.toISOString(),
  }));
}

export async function getPhotosByOriginalId(originalId: string) {
  const query = new AV.Query('Photo');
  query.equalTo('originalId', originalId);
  const results = await query.find();
  return results.map((item) => ({
    objectId: item.id,
    url: item.get('url'),
    author: item.get('author'),
    originalId: item.get('originalId'),
    title: item.get('title'),
    createdAt: item.createdAt?.toISOString(),
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

// Vote operations
export async function createVote(data: {
  originalId: string;
  winner: 'A' | 'B';
  voter: string;
}) {
  const vote = new Vote();
  vote.set('originalId', data.originalId);
  vote.set('winner', data.winner);
  vote.set('voter', data.voter || '匿名');
  return await vote.save();
}

export async function getVotes() {
  const query = new AV.Query('Vote');
  query.descending('createdAt');
  const results = await query.find();
  return results.map((item) => ({
    objectId: item.id,
    originalId: item.get('originalId'),
    winner: item.get('winner'),
    voter: item.get('voter'),
    createdAt: item.createdAt?.toISOString(),
  }));
}

export async function getVotesByOriginalId(originalId: string) {
  const query = new AV.Query('Vote');
  query.equalTo('originalId', originalId);
  const results = await query.find();
  return results.map((item) => ({
    objectId: item.id,
    originalId: item.get('originalId'),
    winner: item.get('winner'),
    voter: item.get('voter'),
    createdAt: item.createdAt?.toISOString(),
  }));
}

// Rating operations
export async function createRating(data: {
  photoId: string;
  score: number;
  voter: string;
}) {
  const rating = new Rating();
  rating.set('photoId', data.photoId);
  rating.set('score', data.score);
  rating.set('voter', data.voter || '匿名');
  return await rating.save();
}

export async function getRatings() {
  const query = new AV.Query('Rating');
  query.descending('createdAt');
  const results = await query.find();
  return results.map((item) => ({
    objectId: item.id,
    photoId: item.get('photoId'),
    score: item.get('score'),
    voter: item.get('voter'),
    createdAt: item.createdAt?.toISOString(),
  }));
}

export async function getRatingsByPhotoId(photoId: string) {
  const query = new AV.Query('Rating');
  query.equalTo('photoId', photoId);
  const results = await query.find();
  return results.map((item) => ({
    objectId: item.id,
    photoId: item.get('photoId'),
    score: item.get('score'),
    voter: item.get('voter'),
    createdAt: item.createdAt?.toISOString(),
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
    stats[vote.winner].totalWins++;
  });

  // Count ratings
  const photoMap = new Map(photos.map((p) => [p.objectId, p]));
  ratings.forEach((rating) => {
    const photo = photoMap.get(rating.photoId);
    if (photo) {
      stats[photo.author].totalRatings++;
      stats[photo.author].totalScore += rating.score;
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

export async function deletePhoto(objectId: string) {
  const photo = AV.Object.createWithoutData('Photo', objectId);
  return await photo.destroy();
}

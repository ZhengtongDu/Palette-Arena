import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ImageCard } from '../components/ImageCard';
import { StarRating } from '../components/StarRating';
import { VoteButton } from '../components/VoteButton';
import { getPhotos, createRating, getRatingsByPhotoId } from '../services/bmob';
import type { Photo, Rating } from '../types';

export function Rate() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voterName, setVoterName] = useState('');

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const data = await getPhotos();
      // Shuffle photos for random order
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setPhotos(shuffled);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentPhoto = photos[currentIndex];

  const handleRate = async () => {
    if (!rating || !currentPhoto?.objectId) return;

    setSubmitting(true);
    try {
      await createRating({
        photoId: currentPhoto.objectId,
        score: rating,
        voter: voterName || '匿名',
      });
      const ratingData = await getRatingsByPhotoId(currentPhoto.objectId);
      setRatings(ratingData);
      setRated(true);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('评分失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setRating(0);
    setRated(false);
    setRatings([]);
  };

  const getAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.score, 0);
    return (sum / ratings.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">暂无照片</p>
          <Link to="/" className="text-blue-600 hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (currentIndex >= photos.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">感谢参与!</h2>
          <p className="text-gray-600 mb-6">你已完成所有照片评分</p>
          <Link
            to="/"
            className="inline-block bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-gray-600 hover:text-gray-800 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">单张评分</h1>
            <p className="text-gray-500 text-sm">
              {currentIndex + 1} / {photos.length}
            </p>
          </div>
          <div className="w-6"></div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <ImageCard url={currentPhoto.url} title={currentPhoto.title} />
          </div>

          {!rated ? (
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">你觉得这张调色怎么样？</p>
                <div className="flex justify-center">
                  <StarRating value={rating} onChange={setRating} size="lg" />
                </div>
                {rating > 0 && (
                  <p className="mt-2 text-gray-500">
                    {rating === 1 && '不太行'}
                    {rating === 2 && '一般般'}
                    {rating === 3 && '还可以'}
                    {rating === 4 && '很不错'}
                    {rating === 5 && '太棒了!'}
                  </p>
                )}
              </div>

              <input
                type="text"
                placeholder="你的昵称（可选）"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />

              <div className="text-center">
                <VoteButton
                  label={submitting ? '提交中...' : '确认评分'}
                  onClick={handleRate}
                  disabled={!rating || submitting}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">当前平均评分</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-yellow-500">{getAverageRating()}</span>
                  <StarRating value={Math.round(Number(getAverageRating()))} readonly size="md" />
                </div>
                <p className="text-gray-500 mt-2">共 {ratings.length} 人评分</p>
              </div>

              <div className="text-center">
                <VoteButton label="下一张" onClick={handleNext} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPhotos, createRating } from '../services/bmob';
import type { Photo } from '../types';

export function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

  const toggleSelect = (photoId: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedPhotos.size === 0) {
      alert('请至少选择一张喜欢的照片');
      return;
    }

    setSubmitting(true);
    try {
      // For each selected photo, create a rating with score 5
      // For non-selected photos, we don't create ratings (implicit lower preference)
      const promises = Array.from(selectedPhotos).map((photoId) =>
        createRating({
          photoId,
          score: 5,
          voter: voterName || '匿名',
        })
      );
      await Promise.all(promises);
      setSubmitted(true);
    } catch (error) {
      console.error('Submit failed:', error);
      alert('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
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
          <Link to="/" className="text-purple-600 hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">感谢参与!</h2>
          <p className="text-gray-600 mb-2">你选择了 {selectedPhotos.size} 张喜欢的照片</p>
          <p className="text-gray-500 mb-6">你的选择已记录</p>
          <Link
            to="/"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-gray-600 hover:text-gray-800 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">照片墙</h1>
              <p className="text-sm text-gray-500">
                已选 <span className="text-purple-600 font-medium">{selectedPhotos.size}</span> 张
              </p>
            </div>
            <div className="w-6"></div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="container mx-auto px-4 py-4">
        <div className="bg-purple-50 rounded-lg p-4 mb-4">
          <p className="text-purple-800 text-center">
            点击选择你觉得好看的照片，可以选择多张，选完后点击底部提交按钮
          </p>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="container mx-auto px-4 pb-32">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => {
            const isSelected = selectedPhotos.has(photo.objectId || '');
            return (
              <div
                key={photo.objectId}
                onClick={() => photo.objectId && toggleSelect(photo.objectId)}
                className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                  isSelected
                    ? 'ring-4 ring-purple-500 scale-[0.97]'
                    : 'hover:scale-[0.98] hover:shadow-lg'
                }`}
              >
                <img
                  src={photo.url}
                  alt={photo.title || '调色照片'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Selection overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                    <div className="bg-purple-500 text-white rounded-full p-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
                {/* Hover hint for unselected */}
                {!isSelected && (
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="你的昵称（可选）"
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedPhotos.size === 0}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {submitting ? '提交中...' : `提交 (${selectedPhotos.size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

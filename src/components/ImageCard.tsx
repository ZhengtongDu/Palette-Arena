import { useState } from 'react';

interface ImageCardProps {
  url: string;
  title?: string;
  onClick?: () => void;
  selected?: boolean;
  showAuthor?: boolean;
  author?: 'A' | 'B';
}

export function ImageCard({
  url,
  title,
  onClick,
  selected,
  showAuthor,
  author,
}: ImageCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={`relative rounded-lg overflow-hidden shadow-lg transition-all duration-300 cursor-pointer
        ${selected ? 'ring-4 ring-blue-500 scale-[1.02]' : 'hover:shadow-xl hover:scale-[1.01]'}
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
      onClick={onClick}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-400">加载中...</span>
        </div>
      )}
      {error ? (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">图片加载失败</span>
        </div>
      ) : (
        <img
          src={url}
          alt={title || '调色照片'}
          className={`w-full h-auto object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
      {(title || (showAuthor && author)) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          {title && <p className="text-white font-medium">{title}</p>}
          {showAuthor && author && (
            <span className="inline-block mt-1 px-2 py-1 bg-white/20 rounded text-white text-sm">
              作者 {author}
            </span>
          )}
        </div>
      )}
      {selected && (
        <div className="absolute top-4 right-4 bg-blue-500 text-white rounded-full p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

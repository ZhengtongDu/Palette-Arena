import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPhoto, getPhotos, deletePhoto, uploadFile } from '../services/bmob';
import type { Photo } from '../types';

const ADMIN_PASSWORD = 'palette1337';

export function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload mode: 'file' or 'url'
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('url');

  // Upload form state
  const [originalId, setOriginalId] = useState('');
  const [title, setTitle] = useState('');
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [previewA, setPreviewA] = useState<string>('');
  const [previewB, setPreviewB] = useState<string>('');

  // URL mode state
  const [urlA, setUrlA] = useState('');
  const [urlB, setUrlB] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      loadPhotos();
    } else {
      alert('密码错误');
    }
  };

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const data = await getPhotos();
      setPhotos(data);
    } catch (error) {
      console.error('Failed to load photos:', error);
      alert('加载照片失败，请检查 LeanCloud 配置');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (file: File | null, author: 'A' | 'B') => {
    if (!file) return;

    if (author === 'A') {
      setFileA(file);
      setPreviewA(URL.createObjectURL(file));
    } else {
      setFileB(file);
      setPreviewB(URL.createObjectURL(file));
    }
  };

  const handleUploadByFile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!originalId.trim()) {
      alert('请输入原图标识');
      return;
    }

    if (!fileA && !fileB) {
      alert('请至少选择一张图片');
      return;
    }

    setUploading(true);
    try {
      // Upload file A if selected
      if (fileA) {
        const uploadedUrlA = await uploadFile(fileA);
        await createPhoto({
          url: uploadedUrlA,
          author: 'A',
          originalId: originalId.trim(),
          title: title.trim() || undefined,
        });
      }

      // Upload file B if selected
      if (fileB) {
        const uploadedUrlB = await uploadFile(fileB);
        await createPhoto({
          url: uploadedUrlB,
          author: 'B',
          originalId: originalId.trim(),
          title: title.trim() || undefined,
        });
      }

      alert('上传成功！');
      resetForm();
      loadPhotos();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上传失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setUploading(false);
    }
  };

  const handleUploadByUrl = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!originalId.trim()) {
      alert('请输入原图标识');
      return;
    }

    if (!urlA.trim() && !urlB.trim()) {
      alert('请至少输入一个图片URL');
      return;
    }

    setUploading(true);
    try {
      // Add photo A if URL provided
      if (urlA.trim()) {
        await createPhoto({
          url: urlA.trim(),
          author: 'A',
          originalId: originalId.trim(),
          title: title.trim() || undefined,
        });
      }

      // Add photo B if URL provided
      if (urlB.trim()) {
        await createPhoto({
          url: urlB.trim(),
          author: 'B',
          originalId: originalId.trim(),
          title: title.trim() || undefined,
        });
      }

      alert('添加成功！');
      resetForm();
      loadPhotos();
    } catch (error) {
      console.error('Add failed:', error);
      alert('添加失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setOriginalId('');
    setTitle('');
    setFileA(null);
    setFileB(null);
    setPreviewA('');
    setPreviewB('');
    setUrlA('');
    setUrlB('');
  };

  const handleDelete = async (photo: Photo) => {
    if (!photo.objectId) return;
    if (!confirm(`确定要删除这张照片吗？\n原图标识: ${photo.originalId}\n作者: ${photo.author}`)) {
      return;
    }

    try {
      await deletePhoto(photo.objectId);
      alert('删除成功');
      loadPhotos();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('删除失败');
    }
  };

  // Group photos by originalId
  const groupedPhotos = photos.reduce((acc, photo) => {
    if (!acc[photo.originalId]) {
      acc[photo.originalId] = { A: null, B: null };
    }
    acc[photo.originalId][photo.author] = photo;
    return acc;
  }, {} as Record<string, { A: Photo | null; B: Photo | null }>);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">照片管理</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="请输入管理密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              进入
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-gray-600 hover:text-gray-800 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">照片管理</h1>
          <button
            onClick={loadPhotos}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            title="刷新"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">添加新照片</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setUploadMode('url')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  uploadMode === 'url'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                URL模式
              </button>
              <button
                onClick={() => setUploadMode('file')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  uploadMode === 'file'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                文件上传
              </button>
            </div>
          </div>

          <form onSubmit={uploadMode === 'url' ? handleUploadByUrl : handleUploadByFile} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  原图标识 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={originalId}
                  onChange={(e) => setOriginalId(e.target.value)}
                  placeholder="例如: photo001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">用于关联同一原图的A/B两个版本</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标题（可选）
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如: 夕阳海滩"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {uploadMode === 'url' ? (
              /* URL Mode */
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-3">作者 A 的调色</h3>
                  <input
                    type="url"
                    value={urlA}
                    onChange={(e) => setUrlA(e.target.value)}
                    placeholder="输入图片URL"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {urlA && (
                    <div className="mt-3">
                      <img
                        src={urlA}
                        alt="Preview A"
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-3">作者 B 的调色</h3>
                  <input
                    type="url"
                    value={urlB}
                    onChange={(e) => setUrlB(e.target.value)}
                    placeholder="输入图片URL"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  {urlB && (
                    <div className="mt-3">
                      <img
                        src={urlB}
                        alt="Preview B"
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* File Upload Mode */
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-3">作者 A 的调色</h3>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'A')}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {previewA && (
                    <div className="mt-3">
                      <img src={previewA} alt="Preview A" className="w-full h-48 object-cover rounded-lg" />
                    </div>
                  )}
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-3">作者 B 的调色</h3>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'B')}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                  />
                  {previewB && (
                    <div className="mt-3">
                      <img src={previewB} alt="Preview B" className="w-full h-48 object-cover rounded-lg" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                type="submit"
                disabled={uploading || (uploadMode === 'url' ? (!urlA && !urlB) : (!fileA && !fileB))}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? '处理中...' : uploadMode === 'url' ? '添加照片' : '上传照片'}
              </button>
            </div>
          </form>
        </div>

        {/* Photo List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            已上传照片 ({Object.keys(groupedPhotos).length} 组)
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : Object.keys(groupedPhotos).length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无照片</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPhotos).map(([origId, pair]) => (
                <div key={origId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800">
                      原图标识: <span className="text-green-600">{origId}</span>
                      {pair.A?.title && <span className="text-gray-500 ml-2">({pair.A.title})</span>}
                    </h3>
                    <span className={`px-2 py-1 rounded text-sm ${
                      pair.A && pair.B
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {pair.A && pair.B ? '配对完整' : '配对不完整'}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Photo A */}
                    <div className="relative">
                      {pair.A ? (
                        <>
                          <img
                            src={pair.A.url}
                            alt="Author A"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
                            作者 A
                          </div>
                          <button
                            onClick={() => handleDelete(pair.A!)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                            title="删除"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">作者 A 未上传</span>
                        </div>
                      )}
                    </div>
                    {/* Photo B */}
                    <div className="relative">
                      {pair.B ? (
                        <>
                          <img
                            src={pair.B.url}
                            alt="Author B"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute top-2 left-2 bg-pink-500 text-white px-2 py-1 rounded text-sm">
                            作者 B
                          </div>
                          <button
                            onClick={() => handleDelete(pair.B!)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                            title="删除"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">作者 B 未上传</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

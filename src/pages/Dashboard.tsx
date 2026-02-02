import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getAuthorStats, getPhotos, getVotes, getRatings } from '../services/bmob';
import type { Photo, Vote, Rating } from '../types';

const COLORS = ['#3B82F6', '#EC4899'];
const DASHBOARD_PASSWORD = 'palette1337';

export function Dashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    A: { totalVotes: number; totalWins: number; winRate: number; avgRating: number; totalRatings: number };
    B: { totalVotes: number; totalWins: number; winRate: number; avgRating: number; totalRatings: number };
  } | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DASHBOARD_PASSWORD) {
      setAuthenticated(true);
      loadData();
    } else {
      alert('密码错误');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, photosData, votesData, ratingsData] = await Promise.all([
        getAuthorStats(),
        getPhotos(),
        getVotes(),
        getRatings(),
      ]);
      setStats(statsData);
      setPhotos(photosData);
      setVotes(votesData);
      setRatings(ratingsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">后台看板</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载数据中...</p>
        </div>
      </div>
    );
  }

  const winRateData = stats
    ? [
        { name: '作者 A', value: stats.A.totalWins },
        { name: '作者 B', value: stats.B.totalWins },
      ]
    : [];

  const ratingData = stats
    ? [
        { name: '作者 A', avgRating: Number(stats.A.avgRating.toFixed(2)), count: stats.A.totalRatings },
        { name: '作者 B', avgRating: Number(stats.B.avgRating.toFixed(2)), count: stats.B.totalRatings },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-gray-600 hover:text-gray-800 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">统计看板</h1>
          <button
            onClick={loadData}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            title="刷新数据"
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

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500 text-sm">总照片数</p>
            <p className="text-3xl font-bold text-gray-800">{photos.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500 text-sm">总投票数</p>
            <p className="text-3xl font-bold text-gray-800">{votes.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500 text-sm">总评分数</p>
            <p className="text-3xl font-bold text-gray-800">{ratings.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500 text-sm">对比组数</p>
            <p className="text-3xl font-bold text-gray-800">
              {new Set(photos.map((p) => p.originalId)).size}
            </p>
          </div>
        </div>

        {/* Author Stats */}
        {stats && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">作者 A 统计</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">胜场数</span>
                  <span className="font-medium">{stats.A.totalWins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">胜率</span>
                  <span className="font-medium">{(stats.A.winRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平均评分</span>
                  <span className="font-medium">{stats.A.avgRating.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">评分次数</span>
                  <span className="font-medium">{stats.A.totalRatings}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">作者 B 统计</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">胜场数</span>
                  <span className="font-medium">{stats.B.totalWins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">胜率</span>
                  <span className="font-medium">{(stats.B.winRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平均评分</span>
                  <span className="font-medium">{stats.B.avgRating.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">评分次数</span>
                  <span className="font-medium">{stats.B.totalRatings}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">投票胜负分布</h3>
            {winRateData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={winRateData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {winRateData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                暂无投票数据
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">平均评分对比</h3>
            {ratingData.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgRating" name="平均评分" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                暂无评分数据
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">最近活动</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[...votes, ...ratings]
              .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
              .slice(0, 20)
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {'winner' in item ? (
                      <>
                        <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">
                          投
                        </span>
                        <span className="text-gray-700">
                          {item.voter} 投票给了 作者 {item.winner}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-sm">
                          评
                        </span>
                        <span className="text-gray-700">
                          {item.voter} 评了 {item.score} 星
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString('zh-CN') : ''}
                  </span>
                </div>
              ))}
            {votes.length === 0 && ratings.length === 0 && (
              <p className="text-gray-500 text-center py-4">暂无活动记录</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

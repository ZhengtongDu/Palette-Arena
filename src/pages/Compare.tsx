import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ImageCard } from '../components/ImageCard';
import { VoteButton } from '../components/VoteButton';
import { getComparisonPairs, createVote, getVotesByOriginalId } from '../services/leancloud';
import type { ComparisonPair, Vote } from '../types';

export function Compare() {
  const [pairs, setPairs] = useState<ComparisonPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<'A' | 'B' | null>(null);
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voterName, setVoterName] = useState('');
  const [randomOrder, setRandomOrder] = useState<boolean>(Math.random() > 0.5);

  useEffect(() => {
    loadPairs();
  }, []);

  const loadPairs = async () => {
    try {
      const data = await getComparisonPairs();
      // Shuffle pairs for random order
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setPairs(shuffled);
    } catch (error) {
      console.error('Failed to load pairs:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentPair = pairs[currentIndex];

  const handleSelect = (choice: 'A' | 'B') => {
    if (!voted) {
      setSelected(choice);
    }
  };

  const handleVote = async () => {
    if (!selected || !currentPair) return;

    setSubmitting(true);
    try {
      await createVote({
        originalId: currentPair.originalId,
        winner: selected,
        voter: voterName || '匿名',
      });
      const voteData = await getVotesByOriginalId(currentPair.originalId);
      setVotes(voteData);
      setVoted(true);
    } catch (error) {
      console.error('Failed to submit vote:', error);
      alert('投票失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setSelected(null);
    setVoted(false);
    setVotes([]);
    setRandomOrder(Math.random() > 0.5);
  };

  const getVoteStats = () => {
    const total = votes.length;
    const aWins = votes.filter((v) => v.winner === 'A').length;
    const bWins = total - aWins;
    return {
      total,
      aWins,
      bWins,
      aPercent: total > 0 ? Math.round((aWins / total) * 100) : 0,
      bPercent: total > 0 ? Math.round((bWins / total) * 100) : 0,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (pairs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">暂无对比照片</p>
          <Link to="/" className="text-blue-600 hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (currentIndex >= pairs.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">感谢参与!</h2>
          <p className="text-gray-600 mb-6">你已完成所有对比投票</p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const stats = getVoteStats();
  const leftPhoto = randomOrder ? currentPair.photoA : currentPair.photoB;
  const rightPhoto = randomOrder ? currentPair.photoB : currentPair.photoA;
  const leftChoice = randomOrder ? 'A' : 'B';
  const rightChoice = randomOrder ? 'B' : 'A';

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
            <h1 className="text-2xl font-bold text-gray-800">A/B 对比投票</h1>
            <p className="text-gray-500 text-sm">
              {currentIndex + 1} / {pairs.length}
            </p>
          </div>
          <div className="w-6"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-600 mb-6">选择你更喜欢的调色版本</p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <ImageCard
                url={leftPhoto.url}
                title={leftPhoto.title}
                onClick={() => handleSelect(leftChoice as 'A' | 'B')}
                selected={selected === leftChoice}
              />
              {voted && (
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">作者 {leftChoice}</span>
                    <span className="text-gray-600">
                      {leftChoice === 'A' ? stats.aWins : stats.bWins} 票 (
                      {leftChoice === 'A' ? stats.aPercent : stats.bPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${leftChoice === 'A' ? stats.aPercent : stats.bPercent}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <ImageCard
                url={rightPhoto.url}
                title={rightPhoto.title}
                onClick={() => handleSelect(rightChoice as 'A' | 'B')}
                selected={selected === rightChoice}
              />
              {voted && (
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">作者 {rightChoice}</span>
                    <span className="text-gray-600">
                      {rightChoice === 'A' ? stats.aWins : stats.bWins} 票 (
                      {rightChoice === 'A' ? stats.aPercent : stats.bPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${rightChoice === 'A' ? stats.aPercent : stats.bPercent}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!voted && (
            <div className="max-w-md mx-auto space-y-4">
              <input
                type="text"
                placeholder="你的昵称（可选）"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <VoteButton
                label={submitting ? '提交中...' : '确认投票'}
                onClick={handleVote}
                disabled={!selected || submitting}
              />
            </div>
          )}

          {voted && (
            <div className="text-center">
              <VoteButton label="下一组" onClick={handleNext} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

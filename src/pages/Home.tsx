import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            调色竞技场
          </h1>
          <p className="text-xl text-gray-600">
            Palette Arena - 照片调色评测平台
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link
            to="/compare"
            className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">A/B 对比投票</h2>
              <p className="text-gray-600">
                同一张原图的两种调色，选出你更喜欢的那个
              </p>
            </div>
          </Link>

          <Link
            to="/rate"
            className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                <svg
                  className="w-10 h-10 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">单张评分</h2>
              <p className="text-gray-600">
                逐张浏览调色作品，给出1-5星评分
              </p>
            </div>
          </Link>
        </div>

        <div className="text-center mt-12 space-x-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            查看统计数据
          </Link>
          <Link
            to="/admin"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            照片管理
          </Link>
        </div>
      </div>
    </div>
  );
}

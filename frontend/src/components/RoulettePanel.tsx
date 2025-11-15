import { Dices, Sparkles, TrendingUp } from 'lucide-react';

const ROULETTE_REWARDS = [5, 10, 15, 20, 25, 30, 35, 40];

export function RoulettePanel() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Dices className="text-purple-400" size={32} />
          행운의 룰렛
        </h2>
        <p className="text-white/60">
          하루 1회 무료로 룰렛을 돌려 Power를 획득하세요!
        </p>
      </div>

      {/* Main Roulette Area */}
      <div className="glass p-8">
        <div className="flex flex-col items-center gap-6">
          {/* Coming Soon Badge */}
          <div className="glass px-6 py-3 border-2 border-yellow-400/30">
            <span className="text-yellow-400 font-bold text-lg">
              🚧 Coming Soon
            </span>
          </div>

          {/* Roulette Wheel Placeholder */}
          <div className="relative w-80 h-80 rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 border-4 border-white/10 flex items-center justify-center">
            {/* Center Circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full border-4 border-white/20 flex items-center justify-center backdrop-blur-sm">
                <div className="w-48 h-48 rounded-full border-4 border-white/30 flex items-center justify-center glass">
                  <div className="text-center">
                    <Sparkles className="mx-auto mb-2 text-yellow-400" size={48} />
                    <div className="text-6xl mb-2">🎰</div>
                    <div className="text-sm text-white/60">준비 중...</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reward Segments (visual only) */}
            {ROULETTE_REWARDS.map((reward, index) => {
              const angle = (360 / ROULETTE_REWARDS.length) * index;
              return (
                <div
                  key={index}
                  className="absolute text-xs font-bold opacity-30"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-140px)`,
                  }}
                >
                  <div
                    style={{
                      transform: `rotate(-${angle}deg)`,
                    }}
                  >
                    +{reward}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Spin Button */}
          <button
            disabled
            className="px-12 py-4 rounded-xl bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white font-bold text-lg flex items-center gap-3 cursor-not-allowed opacity-50"
          >
            <Dices size={24} />
            <span>룰렛 돌리기</span>
          </button>

          {/* Info */}
          <div className="text-center text-sm text-white/60">
            <p>🎁 보상: +5 ~ +40 Power (랜덤)</p>
            <p>⏰ 쿨다운: 24시간</p>
          </div>
        </div>
      </div>

      {/* Rewards Table */}
      <div className="glass p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          가능한 보상
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {ROULETTE_REWARDS.map(reward => (
            <div
              key={reward}
              className="glass-hover p-3 text-center rounded-lg"
            >
              <div className="text-2xl mb-1">✨</div>
              <div className="text-sm font-bold text-primary">
                +{reward} Power
              </div>
              <div className="text-xs text-white/60 mt-1">
                {reward <= 15 ? '높음' : reward <= 30 ? '중간' : '낮음'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History (Coming Soon) */}
      <div className="glass p-6">
        <h3 className="font-bold mb-4">최근 룰렛 기록</h3>
        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-white/60">아직 기록이 없습니다</p>
          <p className="text-sm text-white/40 mt-2">
            첫 룰렛을 돌려보세요!
          </p>
        </div>
      </div>
    </div>
  );
}


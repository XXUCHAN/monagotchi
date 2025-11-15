import { Trophy, TrendingUp, Award, Crown } from 'lucide-react';
import { CLAN_NAMES, CLAN_COLORS, CLAN_ICONS } from '../constants';

// Mock data for Coming Soon
const MOCK_LEADERBOARD = [
  {
    rank: 1,
    catId: '001',
    owner: '0x1234...5678',
    clan: 0,
    power: 2450,
    missions: 127,
  },
  {
    rank: 2,
    catId: '042',
    owner: '0xabcd...ef01',
    clan: 1,
    power: 2280,
    missions: 115,
  },
  {
    rank: 3,
    catId: '089',
    owner: '0x9876...4321',
    clan: 0,
    power: 2150,
    missions: 102,
  },
  {
    rank: 4,
    catId: '156',
    owner: '0x5555...9999',
    clan: 2,
    power: 1980,
    missions: 98,
  },
  {
    rank: 5,
    catId: '203',
    owner: '0xfeed...beef',
    clan: 1,
    power: 1875,
    missions: 89,
  },
];

export function Leaderboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="text-yellow-400" size={32} />
            전체 리더보드
          </h2>
          <p className="text-white/60">
            Power 순위 Top 100 (실시간 업데이트)
          </p>
        </div>

        {/* Coming Soon Badge */}
        <div className="glass px-4 py-2 border-2 border-yellow-400/30">
          <span className="text-yellow-400 font-bold">🚧 Coming Soon</span>
        </div>
      </div>

      {/* Filter Tabs (Coming Soon) */}
      <div className="flex gap-2 flex-wrap">
        <button className="glass-hover px-4 py-2 text-sm font-semibold">
          전체
        </button>
        <button className="glass px-4 py-2 text-sm text-white/60">
          BTC 진영
        </button>
        <button className="glass px-4 py-2 text-sm text-white/60">
          ETH 진영
        </button>
        <button className="glass px-4 py-2 text-sm text-white/60">
          SOL 진영
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="glass p-6">
        <div className="space-y-3">
          {MOCK_LEADERBOARD.map(entry => (
            <div
              key={entry.rank}
              className="glass-hover p-4 flex items-center gap-4 opacity-50"
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5">
                {entry.rank === 1 && (
                  <Crown className="text-yellow-400" size={24} />
                )}
                {entry.rank === 2 && (
                  <Award className="text-gray-300" size={24} />
                )}
                {entry.rank === 3 && (
                  <Award className="text-orange-400" size={24} />
                )}
                {entry.rank > 3 && (
                  <span className="text-xl font-bold text-white/60">
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* Cat ID + Owner */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-white/80">
                    Cat #{entry.catId}
                  </span>
                  <div
                    className="px-2 py-0.5 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: `${CLAN_COLORS[entry.clan as keyof typeof CLAN_COLORS]}20`,
                      color: CLAN_COLORS[entry.clan as keyof typeof CLAN_COLORS],
                    }}
                  >
                    {CLAN_ICONS[entry.clan as keyof typeof CLAN_ICONS]} {CLAN_NAMES[entry.clan as keyof typeof CLAN_NAMES]}
                  </div>
                </div>
                <span className="text-sm text-white/60">{entry.owner}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-right">
                <div>
                  <div className="text-sm text-white/60 mb-1">Power</div>
                  <div className="flex items-center gap-1 text-primary font-bold">
                    <TrendingUp size={16} />
                    {entry.power}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/60 mb-1">Missions</div>
                  <div className="font-bold">{entry.missions}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Overlay */}
        <div className="mt-6 p-8 border-2 border-dashed border-yellow-400/30 rounded-xl text-center">
          <div className="text-6xl mb-4">🔨</div>
          <h3 className="text-xl font-bold mb-2">실시간 리더보드 구현 중</h3>
          <p className="text-white/60 mb-4">
            곧 실제 데이터로 업데이트됩니다!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-white/40">
            <span>예상 완료:</span>
            <span className="text-yellow-400 font-semibold">Phase 3</span>
          </div>
        </div>
      </div>
    </div>
  );
}


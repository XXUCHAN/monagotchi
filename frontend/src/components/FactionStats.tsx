import { TrendingUp, Users, Target, Trophy } from 'lucide-react';
import { CLAN, CLAN_NAMES, CLAN_COLORS, CLAN_ICONS } from '../constants';

// Mock data
const MOCK_FACTION_STATS = [
  {
    clan: CLAN.BTC,
    totalCats: 1247,
    avgPower: 156,
    totalMissions: 8934,
    topPower: 2450,
  },
  {
    clan: CLAN.ETH,
    totalCats: 1089,
    avgPower: 148,
    totalMissions: 7821,
    topPower: 2280,
  },
  {
    clan: CLAN.SOL,
    totalCats: 892,
    avgPower: 142,
    totalMissions: 6543,
    topPower: 1980,
  },
];

export function FactionStats() {
  return (
    <div className="glass p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">진영별 통계</h3>
        <div className="glass px-3 py-1 border border-yellow-400/30">
          <span className="text-yellow-400 text-xs font-bold">Coming Soon</span>
        </div>
      </div>

      {/* Faction Cards */}
      <div className="space-y-3">
        {MOCK_FACTION_STATS.map((faction, index) => (
          <div
            key={faction.clan}
            className="glass-hover p-4 space-y-3 opacity-60"
            style={{
              borderLeft: `4px solid ${CLAN_COLORS[faction.clan]}`,
            }}
          >
            {/* Faction Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{
                    backgroundColor: `${CLAN_COLORS[faction.clan]}20`,
                    color: CLAN_COLORS[faction.clan],
                  }}
                >
                  {CLAN_ICONS[faction.clan]}
                </div>
                <div>
                  <h4 className="font-bold">{CLAN_NAMES[faction.clan]}</h4>
                  <div className="text-xs text-white/60">
                    {index === 0 && '🥇 1위'}
                    {index === 1 && '🥈 2위'}
                    {index === 2 && '🥉 3위'}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-white/60" />
                <span className="text-white/60">총 고양이:</span>
                <span className="font-bold ml-auto">{faction.totalCats}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-white/60" />
                <span className="text-white/60">평균 Power:</span>
                <span className="font-bold ml-auto">{faction.avgPower}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={14} className="text-white/60" />
                <span className="text-white/60">완료 미션:</span>
                <span className="font-bold ml-auto">
                  {faction.totalMissions}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-white/60" />
                <span className="text-white/60">최고 Power:</span>
                <span
                  className="font-bold ml-auto"
                  style={{ color: CLAN_COLORS[faction.clan] }}
                >
                  {faction.topPower}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="pt-2">
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(faction.totalCats / MOCK_FACTION_STATS[0].totalCats) * 100}%`,
                    backgroundColor: CLAN_COLORS[faction.clan],
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon Notice */}
      <div className="pt-4 border-t border-white/10 text-center">
        <p className="text-sm text-white/40">
          🔨 실시간 진영 대전 데이터 구현 중...
        </p>
      </div>
    </div>
  );
}


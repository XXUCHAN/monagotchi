import {
  TrendingUp,
  Activity,
  Dices,
  Swords,
  Clock,
  Award,
  Lock,
} from 'lucide-react';

// 발표 자료의 4가지 미션 타입
const MISSION_TYPES = [
  {
    id: 'price',
    title: '가격 변동 미션',
    subtitle: 'ETH/BTC 상승/하락 맞추기',
    icon: TrendingUp,
    reward: '+50 Power',
    difficulty: 'Hard',
    cooldown: '12시간',
    description:
      '다음 12시간 동안 당신의 진영 코인이 상승할지 하락할지 예측하세요.',
    comingSoon: true,
  },
  {
    id: 'onchain',
    title: '온체인 활동',
    subtitle: '트랜잭션 1회 이상 수행',
    icon: Activity,
    reward: '+30 Power',
    difficulty: 'Medium',
    cooldown: '24시간',
    description: 'NFT 전송, 토큰 스왑 등 온체인 트랜잭션을 수행하세요.',
    comingSoon: true,
  },
  {
    id: 'random',
    title: '랜덤 룰렛',
    subtitle: '하루 1회 행운의 룰렛',
    icon: Dices,
    reward: '+5~20 Power',
    difficulty: 'Easy',
    cooldown: '24시간',
    description: '행운을 시험해보세요! 랜덤으로 Power를 획득합니다.',
    comingSoon: true,
  },
  {
    id: 'faction',
    title: '진영 대전',
    subtitle: 'BTC vs ETH 경쟁',
    icon: Swords,
    reward: '+40 Power',
    difficulty: 'Hard',
    cooldown: '일주일',
    description:
      '상대 진영보다 많은 미션을 완료하거나 시장 보너스로 추가 Power를 획득하세요.',
    comingSoon: true,
  },
];

const DIFFICULTY_COLORS = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

export function MissionsPanel() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">미션 센터</h2>
        <p className="text-white/60">
          다양한 미션을 완료하고 Power를 획득하세요
        </p>
      </div>

      {/* Mission Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {MISSION_TYPES.map(mission => {
          const Icon = mission.icon;
          return (
            <div
              key={mission.id}
              className="glass p-6 space-y-4 relative overflow-hidden"
            >
              {/* Coming Soon Badge */}
              {mission.comingSoon && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                  Coming Soon
                </div>
              )}

              {/* Icon + Title */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="text-primary" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">{mission.title}</h3>
                  <p className="text-sm text-white/60">{mission.subtitle}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-white/70">{mission.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Award size={14} className="text-secondary" />
                  </div>
                  <div className="text-xs text-white/60 mb-1">보상</div>
                  <div className="text-sm font-bold text-secondary">
                    {mission.reward}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock size={14} className="text-blue-400" />
                  </div>
                  <div className="text-xs text-white/60 mb-1">쿨다운</div>
                  <div className="text-sm font-bold">{mission.cooldown}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Lock size={14} className="text-white/60" />
                  </div>
                  <div className="text-xs text-white/60 mb-1">난이도</div>
                  <div
                    className="text-sm font-bold"
                    style={{
                      color:
                        DIFFICULTY_COLORS[
                          mission.difficulty as keyof typeof DIFFICULTY_COLORS
                        ],
                    }}
                  >
                    {mission.difficulty}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                disabled
                className="w-full py-3 rounded-xl bg-white/5 text-white/40 font-semibold cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                <span>준비 중...</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="glass p-6 border-2 border-yellow-400/30">
        <div className="flex items-start gap-4">
          <div className="text-4xl">💡</div>
          <div>
            <h4 className="font-bold mb-2">미션 시스템 안내</h4>
            <ul className="text-sm text-white/70 space-y-1">
              <li>
                • <strong>가격 변동</strong>: 가장 높은 보상, 시장 예측 능력
                테스트
              </li>
              <li>
                • <strong>온체인 활동</strong>: 웹3 참여 유도, 실제 트랜잭션
                필요
              </li>
              <li>
                • <strong>랜덤 룰렛</strong>: 매일 가볍게 참여 가능
              </li>
              <li>
                • <strong>진영 대전</strong>: 커뮤니티 협력, 가장 큰 보상
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


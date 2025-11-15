import { Cat, TrendingUp, Clock } from 'lucide-react';
import {
  CLAN_NAMES,
  CLAN_COLORS,
  CLAN_ICONS,
} from '../constants';
import { formatTimeRemaining } from '../lib';
import type { CatDisplay } from '../types';

// 고양이 이미지 import
import cat1 from '../assets/cats/1.png';
import cat2 from '../assets/cats/2.png';
import cat3 from '../assets/cats/3.png';
import cat4 from '../assets/cats/4.png';
import cat5 from '../assets/cats/5.png';
import cat6 from '../assets/cats/6.png';

const CAT_IMAGES = [cat1, cat2, cat3, cat4, cat5, cat6];

interface CatCardProps {
  cat: CatDisplay;
  onSelect?: () => void;
}

export function CatCard({ cat, onSelect }: CatCardProps) {
  const clanColor = CLAN_COLORS[cat.clan as keyof typeof CLAN_COLORS];
  const clanName = CLAN_NAMES[cat.clan as keyof typeof CLAN_NAMES];
  const clanIcon = CLAN_ICONS[cat.clan as keyof typeof CLAN_ICONS];

  // tokenId 기반으로 deterministic하게 이미지 선택
  const catImageIndex = Number(cat.tokenId) % CAT_IMAGES.length;
  const catImage = CAT_IMAGES[catImageIndex];

  // 가장 최근 미션 시간 계산
  const lastMission = Math.max(
    cat.lastMissionDaily,
    cat.lastMissionWeekly,
    cat.lastMissionMonthly
  );
  const timeSinceLastMission = lastMission
    ? Date.now() / 1000 - lastMission
    : 0;

  return (
    <button
      onClick={onSelect}
      className="glass-hover p-5 w-full text-left space-y-4 group"
    >
      {/* Header: Token ID + Clan */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cat className="text-white/60" size={20} />
          <span className="font-mono text-sm text-white/60">
            #{cat.tokenId}
          </span>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full"
          style={{
            backgroundColor: `${clanColor}20`,
            color: clanColor,
          }}
        >
          <span className="text-lg">{clanIcon}</span>
          <span className="text-sm font-semibold">{clanName}</span>
        </div>
      </div>

      {/* Cat Avatar (실제 이미지) */}
      <div className="relative flex justify-center py-4">
        <div
          className="w-40 h-40 rounded-2xl overflow-hidden backdrop-blur-md border-4 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl relative"
          style={{
            borderColor: `${clanColor}60`,
          }}
        >
          {/* 고양이 이미지 */}
          <img
            src={catImage}
            alt={`Cat #${cat.tokenId}`}
            className="w-full h-full object-cover"
          />
          
          {/* 글라스모피즘 오버레이 */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"
          />
          
          {/* 클랜 아이콘 배지 */}
          <div
            className="absolute top-2 left-2 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border-2 shadow-lg"
            style={{
              backgroundColor: `${clanColor}40`,
              borderColor: `${clanColor}80`,
            }}
          >
            <span className="text-2xl">{clanIcon}</span>
          </div>
        </div>

        {/* Rarity Badge */}
        {cat.rarity >= 2 && (
          <div className="absolute top-2 right-1/4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            {cat.rarity === 2 ? '⭐ Legendary' : 'Rare'}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-3">
        {/* Power */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-white/60">Power</span>
            <div className="flex items-center gap-1 text-primary">
              <TrendingUp size={14} />
              <span className="font-bold">{cat.power}</span>
            </div>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${Math.min((cat.power / 100) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Last Mission */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-white/60">
            <Clock size={14} />
            <span>마지막 활동</span>
          </div>
          <span className="text-white/80">
            {lastMission
              ? formatTimeRemaining(Math.floor(timeSinceLastMission)) + ' 전'
              : '—'}
          </span>
        </div>

        {/* Reward Status */}
        {cat.canClaimReward && (
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-center gap-2 text-secondary font-semibold text-sm animate-pulse">
              <span>🎁</span>
              <span>보상 수령 가능!</span>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}


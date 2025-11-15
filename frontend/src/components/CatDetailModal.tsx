import { X, TrendingUp, Clock, Trophy, Zap, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useContract } from '../hooks';
import {
  CLAN_NAMES,
  CLAN_COLORS,
  CLAN_ICONS,
  MISSION_TYPE,
  MISSION_NAMES,
  POWER_THRESHOLD,
} from '../constants';
import { formatTimeRemaining, formatTokenAmount } from '../lib';
import type { CatDisplay } from '../types';

// 고양이 이미지 import
import cat1 from '../assets/cats/1.png';
import cat2 from '../assets/cats/2.png';
import cat3 from '../assets/cats/3.png';
import cat4 from '../assets/cats/4.png';
import cat5 from '../assets/cats/5.png';
import cat6 from '../assets/cats/6.png';

const CAT_IMAGES = [cat1, cat2, cat3, cat4, cat5, cat6];

interface CatDetailModalProps {
  cat: CatDisplay;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

interface OracleData {
  clan: number;
  temperament: number;
  fortuneTier: number;
  rarityTier: number;
  birthTrendBps: number;
  birthVolBucket: number;
  epochId: bigint;
  entropy: bigint;
}

interface MissionCooldown {
  type: number;
  name: string;
  remaining: number;
  isReady: boolean;
}

export function CatDetailModal({
  cat,
  isOpen,
  onClose,
  onRefresh,
}: CatDetailModalProps) {
  const { getOracleImprint, getRemainingCooldown, completeMission, claimReward } =
    useContract();
  const [oracleData, setOracleData] = useState<OracleData | null>(null);
  const [cooldowns, setCooldowns] = useState<MissionCooldown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const clanColor = CLAN_COLORS[cat.clan as keyof typeof CLAN_COLORS];
  const clanName = CLAN_NAMES[cat.clan as keyof typeof CLAN_NAMES];
  const clanIcon = CLAN_ICONS[cat.clan as keyof typeof CLAN_ICONS];
  const catImageIndex = Number(cat.tokenId) % CAT_IMAGES.length;
  const catImage = CAT_IMAGES[catImageIndex];

  // Oracle Imprint & Cooldown 데이터 로딩
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Oracle Imprint 가져오기
        const [
          clan,
          temperament,
          fortuneTier,
          rarityTier,
          birthTrendBps,
          birthVolBucket,
          epochId,
          entropy,
        ] = await getOracleImprint(BigInt(cat.tokenId));

        setOracleData({
          clan: Number(clan),
          temperament: Number(temperament),
          fortuneTier: Number(fortuneTier),
          rarityTier: Number(rarityTier),
          birthTrendBps: Number(birthTrendBps),
          birthVolBucket: Number(birthVolBucket),
          epochId,
          entropy,
        });

        // 각 미션 타입의 쿨다운 가져오기
        const cooldownData: MissionCooldown[] = await Promise.all(
          [MISSION_TYPE.DAILY, MISSION_TYPE.WEEKLY, MISSION_TYPE.MONTHLY].map(
            async (type) => {
              const remaining = await getRemainingCooldown(
                BigInt(cat.tokenId),
                type
              );
              return {
                type,
                name: MISSION_NAMES[type as keyof typeof MISSION_NAMES],
                remaining: Number(remaining),
                isReady: Number(remaining) === 0,
              };
            }
          )
        );

        setCooldowns(cooldownData);
      } catch (error) {
        console.error('Failed to load cat details:', error);
        toast.error('고양이 상세 정보를 불러올 수 없습니다');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 10000); // 10초마다 업데이트

    return () => clearInterval(interval);
  }, [isOpen, cat.tokenId, refreshTrigger]); // 함수 제거, refreshTrigger 추가

  const handleRunMission = async (missionType: number) => {
    try {
      setIsProcessing(true);
      await completeMission(BigInt(cat.tokenId), missionType);
      // Toast는 useCatsContract에서 이미 표시되므로 제거
      // 모달 내부 데이터 즉시 업데이트
      setRefreshTrigger(prev => prev + 1);
      // Dashboard 새로고침
      onRefresh?.();
    } catch (error) {
      console.error('Mission failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaimReward = async () => {
    try {
      setIsProcessing(true);
      await claimReward(BigInt(cat.tokenId));
      // Toast는 useCatsContract에서 이미 표시되므로 제거
      // 모달 내부 데이터 즉시 업데이트
      setRefreshTrigger(prev => prev + 1);
      // Dashboard 새로고침
      onRefresh?.();
    } catch (error) {
      console.error('Claim failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const temperamentEmoji = ['😟', '😐', '😊'][oracleData?.temperament || 0];
  const temperamentName = ['Pessimistic', 'Neutral', 'Optimistic'][
    oracleData?.temperament || 0
  ];
  const fortuneEmoji = ['💸', '💰', '💎'][oracleData?.fortuneTier || 0];
  const fortuneName = ['Poor', 'Normal', 'Rich'][oracleData?.fortuneTier || 0];
  const rarityName = ['Common', 'Rare', 'Legendary'][
    oracleData?.rarityTier || 0
  ];
  const rarityColor = ['#9CA3AF', '#3B82F6', '#F59E0B'][
    oracleData?.rarityTier || 0
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="glass max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed with high z-index */}
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-black/60 border-b border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{clanIcon}</span>
            <div>
              <h2 className="text-2xl font-bold">Cat #{cat.tokenId}</h2>
              <p className="text-sm text-white/60">{clanName} Clan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <p className="text-white/60 mt-3">Loading details...</p>
            </div>
          ) : (
            <>
              {/* Cat Image & Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                <div className="relative z-0">
                  <div
                    className="rounded-2xl overflow-hidden border-4"
                    style={{ borderColor: clanColor }}
                  >
                    <img
                      src={catImage}
                      alt={`Cat #${cat.tokenId}`}
                      className="w-full aspect-square object-cover"
                    />
                  </div>
                  {/* Rarity Badge */}
                  <div
                    className="absolute top-3 right-3 px-3 py-1 rounded-full font-bold text-sm z-10"
                    style={{ backgroundColor: rarityColor }}
                  >
                    {rarityName}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4 relative z-0">
                  {/* Power */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap size={18} className="text-primary" />
                        <span className="font-semibold">Power</span>
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        {cat.power}
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{
                          width: `${Math.min((cat.power / 100) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-white/60 mt-1">
                      {cat.power >= POWER_THRESHOLD
                        ? '✅ Reward Available'
                        : `${POWER_THRESHOLD - cat.power} more to unlock reward`}
                    </p>
                  </div>

                  {/* Oracle Imprint */}
                  <div className="glass p-4 space-y-3">
                    <h3 className="font-bold flex items-center gap-2">
                      <Trophy size={16} />
                      Oracle Imprint
                    </h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Temperament</span>
                        <span>
                          {temperamentEmoji} {temperamentName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Fortune</span>
                        <span>
                          {fortuneEmoji} {fortuneName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Birth Trend</span>
                        <span
                          className={
                            (oracleData?.birthTrendBps || 0) > 0
                              ? 'text-green-400'
                              : 'text-red-400'
                          }
                        >
                          {((oracleData?.birthTrendBps || 0) / 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Volatility</span>
                        <span>
                          {oracleData?.birthVolBucket === 0
                            ? '📉 Low'
                            : oracleData?.birthVolBucket === 1
                              ? '📊 Mid'
                              : '📈 High'}{' '}
                          (Bucket {oracleData?.birthVolBucket})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reward Status */}
                  {cat.canClaimReward && (
                    <div className="glass-hover p-4 border-2 border-secondary">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-secondary">
                            🎁 Reward Ready!
                          </p>
                          <p className="text-xs text-white/60">
                            Claim your 10 CHURR tokens
                          </p>
                        </div>
                        <button
                          onClick={handleClaimReward}
                          disabled={isProcessing}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-secondary to-accent font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          Claim
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mission Cooldowns */}
              <div className="glass p-4">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Clock size={18} />
                  Mission Cooldowns
                </h3>
                <div className="space-y-3">
                  {cooldowns.map((cooldown) => (
                    <div
                      key={cooldown.type}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{cooldown.name}</p>
                        <p className="text-xs text-white/60">
                          {cooldown.isReady ? (
                            <span className="text-green-400">✅ Ready!</span>
                          ) : (
                            `⏳ ${formatTimeRemaining(cooldown.remaining)} remaining`
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRunMission(cooldown.type)}
                        disabled={!cooldown.isReady || isProcessing}
                        className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Run Mission
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="glass p-4 text-xs text-white/40 space-y-1">
                <p>Epoch ID: {oracleData?.epochId.toString()}</p>
                <p>Entropy: {oracleData?.entropy.toString().slice(0, 20)}...</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


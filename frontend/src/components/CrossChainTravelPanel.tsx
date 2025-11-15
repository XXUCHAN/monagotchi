import { Plane, Trophy, Zap, ArrowRight, Check, Cat, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useContract, useWallet } from '../hooks';
import { CLAN_NAMES, CLAN_COLORS, CLAN_ICONS } from '../constants';
import type { CatDisplay } from '../types';

import cat1 from '../assets/cats/1.png';
import cat2 from '../assets/cats/2.png';
import cat3 from '../assets/cats/3.png';
import cat4 from '../assets/cats/4.png';
import cat5 from '../assets/cats/5.png';
import cat6 from '../assets/cats/6.png';

const CAT_IMAGES = [cat1, cat2, cat3, cat4, cat5, cat6];

// 지원되는 네트워크 목록
const NETWORKS = [
  { id: 'monad', name: 'Monad', icon: '🌟', color: '#fb5a49' },
  { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: '#627EEA' },
  { id: 'polygon', name: 'Polygon', icon: '⬟', color: '#8247E5' },
  { id: 'arbitrum', name: 'Arbitrum', icon: '◆', color: '#28A0F0' },
  { id: 'optimism', name: 'Optimism', icon: '○', color: '#FF0420' },
  { id: 'avalanche', name: 'Avalanche', icon: '▲', color: '#E84142' },
  { id: 'base', name: 'Base', icon: '●', color: '#0052FF' },
];

interface TravelingCat extends CatDisplay {
  currentNetwork: string;
  visitedNetworks: string[];
  totalNetworks: number;
  churrContributed: number; // 이 고양이가 기여한 CHURR
  isTraveling: boolean;
}

interface GlobalJackpot {
  totalChurr: number;
  lastWinner: string | null;
  lastWinAmount: number;
  participants: number;
}

export function CrossChainTravelPanel() {
  const { getUserCatTokenIds, getCat } = useContract();
  const { walletAddress } = useWallet();
  const [cats, setCats] = useState<CatDisplay[]>([]);
  const [travelingCats, setTravelingCats] = useState<TravelingCat[]>([]);
  const [globalJackpot, setGlobalJackpot] = useState<GlobalJackpot>({
    totalChurr: 0,
    lastWinner: null,
    lastWinAmount: 0,
    participants: 0,
  });
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // 초기 랜덤 잭팟 생성
  const initializeJackpot = useCallback(() => {
    const savedJackpot = localStorage.getItem('globalJackpot');
    if (!savedJackpot) {
      // 초기 잭팟: 500 ~ 5000 CHURR 사이의 랜덤 값
      const randomChurr = Math.floor(Math.random() * 4500) + 500;
      const initialJackpot: GlobalJackpot = {
        totalChurr: randomChurr,
        lastWinner: null,
        lastWinAmount: 0,
        participants: 0,
      };
      localStorage.setItem('globalJackpot', JSON.stringify(initialJackpot));
      return initialJackpot;
    }
    return JSON.parse(savedJackpot);
  }, []);

  // 로컬 스토리지에서 여행 데이터 불러오기
  const loadTravelData = useCallback(() => {
    const savedData = localStorage.getItem('travelingCats');
    if (savedData) {
      setTravelingCats(JSON.parse(savedData));
    }
    // 잭팟 초기화 또는 로드
    const jackpot = initializeJackpot();
    setGlobalJackpot(jackpot);
  }, [initializeJackpot]);

  // 여행 데이터 저장
  const saveTravelData = useCallback((data: TravelingCat[]) => {
    localStorage.setItem('travelingCats', JSON.stringify(data));
    setTravelingCats(data);
  }, []);

  // 글로벌 잭팟 저장
  const saveJackpot = useCallback((jackpot: GlobalJackpot) => {
    localStorage.setItem('globalJackpot', JSON.stringify(jackpot));
    setGlobalJackpot(jackpot);
  }, []);

  // 사용자의 고양이 목록 불러오기
  const loadCats = useCallback(async () => {
    if (!walletAddress) {
      setIsLoadingCats(false);
      return;
    }
    try {
      setIsLoadingCats(true);
      const tokenIds = await getUserCatTokenIds(walletAddress);
      if (tokenIds.length === 0) {
        setCats([]);
        setIsLoadingCats(false);
        return;
      }
      const catsData: CatDisplay[] = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const [_, clan, power] = await getCat(tokenId);
          return {
            tokenId: tokenId.toString(),
            clan: Number(clan),
            power: Number(power),
            rarity: 0,
            lastMissionDaily: 0,
            lastMissionWeekly: 0,
            lastMissionMonthly: 0,
            canClaimReward: false,
          };
        })
      );
      setCats(catsData);
    } catch (error) {
      console.error('Failed to load cats:', error);
      toast.error('고양이 목록을 불러올 수 없습니다');
    } finally {
      setIsLoadingCats(false);
    }
  }, [walletAddress, getUserCatTokenIds, getCat]);

  // 초기 로딩
  useEffect(() => {
    if (walletAddress) {
      loadCats();
    }
    loadTravelData();
  }, [walletAddress]); // loadCats, loadTravelData 제거

  // 잭팟 터지는지 체크 (랜덤)
  const checkJackpot = useCallback((newTotalChurr: number): boolean => {
    // 기본 확률: 0.1% (1000번에 1번)
    // CHURR가 많이 쌓일수록 확률 증가
    const baseChance = 0.001;
    const bonusChance = Math.min(newTotalChurr / 100000, 0.05); // 최대 5% 추가
    const totalChance = baseChance + bonusChance;
    
    return Math.random() < totalChance;
  }, []);

  // 여행 시작하기
  const handleStartTravel = (catId: string) => {
    const cat = cats.find((c) => c.tokenId === catId);
    if (!cat) return;

    // 이미 여행 중인지 확인
    const isAlreadyTraveling = travelingCats.some((tc) => tc.tokenId === catId);
    if (isAlreadyTraveling) {
      toast.error('이미 여행 중인 고양이입니다!');
      return;
    }

    setIsProcessing(true);
    toast.loading('여행 준비 중...', { id: 'travel-start' });

    setTimeout(() => {
      const newTravelingCat: TravelingCat = {
        ...cat,
        currentNetwork: 'monad',
        visitedNetworks: ['monad'],
        totalNetworks: NETWORKS.length,
        churrContributed: 0,
        isTraveling: true,
      };

      const updatedTravelingCats = [...travelingCats, newTravelingCat];
      saveTravelData(updatedTravelingCats);
      
      // 참여자 수 업데이트
      const updatedJackpot = {
        ...globalJackpot,
        participants: updatedTravelingCats.length,
      };
      saveJackpot(updatedJackpot);
      
      setIsProcessing(false);
      toast.success(`Cat #${catId} 여행 시작! ✈️`, { id: 'travel-start' });
    }, 1500);
  };

  // 다음 네트워크로 이동
  const handleMoveToNextNetwork = (catId: string) => {
    const cat = travelingCats.find((tc) => tc.tokenId === catId);
    if (!cat) return;

    const currentIndex = NETWORKS.findIndex((n) => n.id === cat.currentNetwork);
    const nextIndex = (currentIndex + 1) % NETWORKS.length;
    const nextNetwork = NETWORKS[nextIndex];

    setIsProcessing(true);
    toast.loading(`${nextNetwork.name}로 이동 중...`, { id: 'travel-move' });

    setTimeout(() => {
      const alreadyVisited = cat.visitedNetworks.includes(nextNetwork.id);
      const churrBonus = alreadyVisited ? 10 : 50; // 새 네트워크는 더 많은 CHURR
      
      // 글로벌 잭팟에 CHURR 추가
      const newTotalChurr = globalJackpot.totalChurr + churrBonus;
      
      // 잭팟 터지는지 체크!
      const jackpotHit = checkJackpot(newTotalChurr);
      
      if (jackpotHit) {
        // 🎉 잭팟 터짐!
        toast.success(
          `🎰 잭팟! Cat #${catId}가 ${newTotalChurr.toFixed(0)} CHURR 잭팟을 터뜨렸습니다!`,
          { duration: 5000, id: 'travel-move' }
        );
        
        // 잭팟 리셋
        const resetJackpot: GlobalJackpot = {
          totalChurr: 0,
          lastWinner: `Cat #${catId}`,
          lastWinAmount: newTotalChurr,
          participants: travelingCats.length,
        };
        saveJackpot(resetJackpot);
        
        // 모든 여행 중인 고양이 리셋
        saveTravelData([]);
        setIsProcessing(false);
        return;
      }
      
      // 잭팟 안 터짐 - 계속 진행
      const updatedCats = travelingCats.map((tc) => {
        if (tc.tokenId === catId) {
          const newVisitedNetworks = alreadyVisited
            ? tc.visitedNetworks
            : [...tc.visitedNetworks, nextNetwork.id];

          return {
            ...tc,
            currentNetwork: nextNetwork.id,
            visitedNetworks: newVisitedNetworks,
            churrContributed: tc.churrContributed + churrBonus,
          };
        }
        return tc;
      });

      // 글로벌 잭팟 업데이트
      const updatedJackpot: GlobalJackpot = {
        ...globalJackpot,
        totalChurr: newTotalChurr,
        participants: travelingCats.length,
      };
      
      saveTravelData(updatedCats);
      saveJackpot(updatedJackpot);
      setIsProcessing(false);
      toast.success(
        `${nextNetwork.name} 도착! +${churrBonus} CHURR → 잭팟 풀: ${newTotalChurr.toFixed(0)} 💰`,
        { id: 'travel-move' }
      );
    }, 2000);
  };

  // 여행 취소 (기여한 CHURR는 글로벌 풀에 남음)
  const handleCancelTravel = (catId: string) => {
    const updatedCats = travelingCats.filter((tc) => tc.tokenId !== catId);
    const updatedJackpot = {
      ...globalJackpot,
      participants: updatedCats.length,
    };
    saveTravelData(updatedCats);
    saveJackpot(updatedJackpot);
    toast.success('여행이 취소되었습니다 (기여한 CHURR는 잭팟 풀에 유지됩니다)');
  };

  // 여행 가능한 고양이들 (여행 중이 아닌 것들)
  const availableCats = cats.filter(
    (cat) => !travelingCats.some((tc) => tc.tokenId === cat.tokenId)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plane size={28} className="text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Cross-Chain Travel 🌍</h2>
              <p className="text-sm text-white/60">
                CCIP를 이용해 고양이를 여행 보내고 잭팟 풀에 기여하세요!
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/60 mb-1">글로벌 잭팟 풀</div>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
              {globalJackpot.totalChurr.toFixed(0)}
            </div>
            <div className="text-xs text-white/60">CHURR</div>
          </div>
        </div>
      </div>

      {/* 📋 고양이 관리 섹션 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 왼쪽: 여행 보낼 고양이 선택 */}
        <div className="glass p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Plane size={20} className="text-primary" />
              여행 보내기
            </h3>
            <div className="text-sm text-white/60">
              {availableCats.length}마리 대기 중
            </div>
          </div>

          {isLoadingCats ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto text-primary animate-spin mb-3" size={48} />
              <p className="text-white/60">고양이 목록 로딩 중...</p>
            </div>
          ) : availableCats.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
              <Cat className="mx-auto text-white/30 mb-3" size={48} />
              <p className="text-white/60">
                {cats.length === 0
                  ? '고양이가 없습니다. Dashboard에서 민팅하세요!'
                  : '모든 고양이가 여행 중입니다!'}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2">
              {availableCats.map((cat) => {
                const catImageIndex = Number(cat.tokenId) % CAT_IMAGES.length;
                const catImage = CAT_IMAGES[catImageIndex];
                const clanColor = CLAN_COLORS[cat.clan as keyof typeof CLAN_COLORS];
                const clanName = CLAN_NAMES[cat.clan as keyof typeof CLAN_NAMES];
                const clanIcon = CLAN_ICONS[cat.clan as keyof typeof CLAN_ICONS];

                return (
                  <button
                    key={cat.tokenId}
                    onClick={() => handleStartTravel(cat.tokenId)}
                    disabled={isProcessing}
                    className="glass-hover p-3 text-left disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 group"
                  >
                    <div
                      className="w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0"
                      style={{ borderColor: clanColor }}
                    >
                      <img
                        src={catImage}
                        alt={`Cat #${cat.tokenId}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-white/80">
                          #{cat.tokenId}
                        </span>
                        <div
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                          style={{
                            backgroundColor: `${clanColor}20`,
                            color: clanColor,
                          }}
                        >
                          <span>{clanIcon}</span>
                          <span className="font-semibold">{clanName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <span>Power: {cat.power}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="px-3 py-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                        <Plane size={18} className="text-primary" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 오른쪽: 여행 중인 고양이 */}
        <div className="glass p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Trophy size={20} className="text-secondary" />
              여행 중
            </h3>
            <div className="text-sm text-white/60">
              {travelingCats.length}마리 진행 중
            </div>
          </div>

          {travelingCats.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-xl">
              <Plane className="mx-auto text-white/30 mb-3" size={48} strokeWidth={1.5} />
              <p className="text-white/60">여행 중인 고양이가 없습니다</p>
              <p className="text-sm text-white/40 mt-2">
                왼쪽에서 고양이를 선택해 여행을 시작하세요
              </p>
            </div>
          ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {travelingCats.map((cat) => {
              const catImageIndex = Number(cat.tokenId) % CAT_IMAGES.length;
              const catImage = CAT_IMAGES[catImageIndex];
              const clanColor = CLAN_COLORS[cat.clan as keyof typeof CLAN_COLORS];
              const clanIcon = CLAN_ICONS[cat.clan as keyof typeof CLAN_ICONS];

              return (
                <div key={cat.tokenId} className="glass-hover p-4 space-y-3">
                  {/* Cat Header - 컴팩트 */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0"
                      style={{ borderColor: clanColor }}
                    >
                      <img
                        src={catImage}
                        alt={`Cat #${cat.tokenId}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">Cat #{cat.tokenId}</span>
                        <div
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                          style={{
                            backgroundColor: `${clanColor}20`,
                            color: clanColor,
                          }}
                        >
                          <span>{clanIcon}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/60">
                        <span>
                          {cat.visitedNetworks.length}/{cat.totalNetworks} 네트워크
                        </span>
                        <span className="text-secondary font-semibold">
                          +{cat.churrContributed} CHURR
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Network Progress - 간소화 */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {NETWORKS.map((network) => {
                        const isVisited = cat.visitedNetworks.includes(network.id);
                        const isCurrent = cat.currentNetwork === network.id;
                        return (
                          <div
                            key={network.id}
                            className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                              isVisited
                                ? 'bg-white/10 border-2'
                                : 'bg-white/5 border border-white/10 opacity-30'
                            }`}
                            style={{
                              borderColor: isVisited ? network.color : undefined,
                            }}
                            title={network.name}
                          >
                            <span className="text-lg">{network.icon}</span>
                            {isVisited && (
                              <Check
                                size={10}
                                className="absolute -top-1 -right-1 text-green-400 bg-black rounded-full"
                              />
                            )}
                            {isCurrent && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions - 컴팩트 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveToNextNetwork(cat.tokenId)}
                      disabled={isProcessing}
                      className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-accent font-semibold hover:shadow-lg transition-all disabled:opacity-50 text-sm"
                    >
                      <ArrowRight size={16} className="inline mr-1" />
                      {isProcessing ? '이동 중...' : '다음 이동'}
                    </button>
                    <button
                      onClick={() => handleCancelTravel(cat.tokenId)}
                      disabled={isProcessing}
                      className="px-3 py-2 rounded-lg bg-white/10 hover:bg-red-500/20 font-semibold transition-all disabled:opacity-50 text-sm"
                    >
                      취소
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="glass p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Zap size={20} className="text-secondary" />
          작동 방식
        </h3>
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div>
              <p className="font-semibold text-white mb-1">고양이 선택 & 여행 시작</p>
              <p className="text-white/60">
                보유한 고양이 중 하나를 선택해 크로스체인 여행을 시작합니다.
                여행은 Monad 네트워크에서 출발합니다.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <p className="font-semibold text-white mb-1">네트워크 방문 & CHURR 기여</p>
              <p className="text-white/60">
                각 네트워크를 방문할 때마다 글로벌 잭팟 풀에 CHURR를 기여합니다.
                새로운 네트워크 방문 시 50 CHURR, 재방문 시 10 CHURR가 풀에
                추가됩니다.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <p className="font-semibold text-white mb-1">랜덤 잭팟! 🎰</p>
              <p className="text-white/60">
                네트워크를 이동할 때마다 랜덤하게 잭팟이 터질 수 있습니다! 기본
                확률 0.1%이며, 풀에 CHURR가 많이 쌓일수록 확률이 증가합니다.
                잭팟이 터지면 그 순간 이동한 고양이가 전체 풀을 가져갑니다!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Zap size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-white/80">
                <span className="font-semibold text-primary">무제한 기여:</span> CHURR
                기여에 제한이 없습니다. 계속 네트워크를 방문하며 잭팟 풀을 키우세요!
              </p>
            </div>
          </div>
          <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Trophy size={16} className="text-secondary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-white/80">
                <span className="font-semibold text-secondary">Demo Mode:</span> 현재
                버전은 로컬 스토리지를 사용한 데모입니다. 실제 CCIP 통합은 메인넷
                배포 시 활성화됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Network Info */}
      <div className="glass p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Plane size={20} className="text-primary" />
          지원 네트워크
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {NETWORKS.map((network) => (
            <div
              key={network.id}
              className="glass-hover p-3 text-center space-y-2"
              style={{ borderColor: `${network.color}40` }}
            >
              <div className="text-3xl">{network.icon}</div>
              <div>
                <p className="font-semibold text-sm">{network.name}</p>
                <p
                  className="text-xs"
                  style={{ color: network.color }}
                >
                  CCIP Enabled
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


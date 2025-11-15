import { Trophy, Zap, TrendingUp, Users, Sparkles } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface GlobalJackpot {
  totalChurr: number;
  lastWinner: string | null;
  lastWinAmount: number;
  participants: number;
}

export function JackpotPanel() {
  const [globalJackpot, setGlobalJackpot] = useState<GlobalJackpot>({
    totalChurr: 0,
    lastWinner: null,
    lastWinAmount: 0,
    participants: 0,
  });

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
      setGlobalJackpot(initialJackpot);
    } else {
      setGlobalJackpot(JSON.parse(savedJackpot));
    }
  }, []);

  // 로컬 스토리지에서 잭팟 데이터 불러오기
  const loadJackpotData = useCallback(() => {
    const savedJackpot = localStorage.getItem('globalJackpot');
    if (savedJackpot) {
      setGlobalJackpot(JSON.parse(savedJackpot));
    }
  }, []);

  useEffect(() => {
    // 최초 1회 초기화
    initializeJackpot();
    // 5초마다 업데이트
    const interval = setInterval(loadJackpotData, 5000);
    return () => clearInterval(interval);
  }, [initializeJackpot, loadJackpotData]);

  // 잭팟 확률 계산
  const jackpotChance = (
    0.1 + Math.min(globalJackpot.totalChurr / 100000, 5)
  ).toFixed(2);

  return (
    <div className="space-y-6">
      {/* 🎰 MEGA JACKPOT DISPLAY */}
      <div className="relative overflow-hidden rounded-3xl min-h-[600px] flex items-center justify-center">
        {/* 배경 애니메이션 레이어들 */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-primary to-accent opacity-20 animate-pulse" />
        <div
          className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-pink-600/20 to-red-600/20 animate-pulse"
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-bl from-blue-600/10 via-indigo-600/10 to-purple-600/10 animate-pulse"
          style={{ animationDelay: '1s' }}
        />

        {/* 메인 잭팟 디스플레이 */}
        <div className="relative z-10 w-full p-8 md:p-16">
          {/* 타이틀 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-black/40 backdrop-blur-md rounded-full border-2 border-secondary/50 mb-6">
              <Trophy size={40} className="text-secondary animate-pulse" />
              <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-accent">
                GLOBAL JACKPOT
              </span>
              <Trophy size={40} className="text-secondary animate-pulse" />
            </div>
            <p className="text-white/60 text-lg">
              언제 터질지 모르는 크로스체인 메가 잭팟!
            </p>
          </div>

          {/* 메가 CHURR 디스플레이 */}
          <div className="text-center mb-16">
            <div className="relative inline-block">
              {/* 글로우 효과 레이어들 */}
              <div className="absolute inset-0 blur-[100px] bg-secondary/40 animate-pulse" />
              <div
                className="absolute inset-0 blur-[80px] bg-primary/30 animate-pulse"
                style={{ animationDelay: '0.3s' }}
              />
              <div
                className="absolute inset-0 blur-[60px] bg-accent/20 animate-pulse"
                style={{ animationDelay: '0.6s' }}
              />

              {/* 메인 숫자 */}
              <div className="relative">
                <div className="text-8xl md:text-[12rem] lg:text-[16rem] font-black tracking-tighter leading-none">
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-secondary via-accent to-primary animate-pulse">
                    {globalJackpot.totalChurr.toFixed(0)}
                  </span>
                </div>
                <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-white/80 mt-4">
                  CHURR
                </div>
              </div>
            </div>
          </div>

          {/* 통계 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            {/* 잭팟 확률 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-30 rounded-3xl transition-all blur-xl" />
              <div className="relative glass-hover p-8 text-center">
                <div className="mb-4">
                  <TrendingUp size={40} className="mx-auto text-primary" />
                </div>
                <div className="text-5xl md:text-6xl font-black text-primary mb-3">
                  {jackpotChance}%
                </div>
                <div className="text-lg text-white/80 font-semibold mb-4">
                  잭팟 확률
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 relative"
                    style={{
                      width: `${Math.min(parseFloat(jackpotChance) * 20, 100)}%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* 참여자 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent to-secondary opacity-0 group-hover:opacity-30 rounded-3xl transition-all blur-xl" />
              <div className="relative glass-hover p-8 text-center">
                <div className="mb-4">
                  <Users size={40} className="mx-auto text-accent" />
                </div>
                <div className="text-5xl md:text-6xl font-black text-accent mb-3">
                  {globalJackpot.participants}
                </div>
                <div className="text-lg text-white/80 font-semibold mb-2">
                  참여 중
                </div>
                <div className="text-sm text-white/50">마리의 고양이</div>
              </div>
            </div>

            {/* 기여 제한 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary to-primary opacity-0 group-hover:opacity-30 rounded-3xl transition-all blur-xl" />
              <div className="relative glass-hover p-8 text-center">
                <div className="mb-4">
                  <Sparkles size={40} className="mx-auto text-secondary" />
                </div>
                <div className="text-5xl md:text-6xl font-black text-secondary mb-3">
                  ∞
                </div>
                <div className="text-lg text-white/80 font-semibold mb-2">
                  기여 제한
                </div>
                <div className="text-sm text-white/50">무제한 적립!</div>
              </div>
            </div>
          </div>

          {/* 마지막 우승자 */}
          {globalJackpot.lastWinner && (
            <div className="max-w-3xl mx-auto">
              <div className="relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/30 to-primary/30 animate-pulse" />
                <div className="relative z-10 p-8 backdrop-blur-md border-2 border-secondary/40">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-2xl">
                        <Trophy size={40} className="text-white" />
                      </div>
                      <div className="text-center md:text-left">
                        <div className="text-sm text-white/60 mb-2">
                          🎉 최근 잭팟 우승자
                        </div>
                        <div className="text-3xl md:text-4xl font-bold text-secondary">
                          {globalJackpot.lastWinner}
                        </div>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <div className="text-sm text-white/60 mb-2">획득 금액</div>
                      <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
                        {globalJackpot.lastWinAmount.toFixed(0)}
                      </div>
                      <div className="text-lg text-white/60 mt-1">CHURR</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 잭팟 정보 */}
      <div className="glass p-8">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Zap size={28} className="text-secondary" />
          잭팟 시스템 안내
        </h3>
        <div className="space-y-6 text-base">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0 font-bold text-lg">
              1
            </div>
            <div>
              <p className="font-bold text-white text-lg mb-2">
                🌍 크로스체인 여행으로 기여
              </p>
              <p className="text-white/70 leading-relaxed">
                Travel 탭에서 고양이를 크로스체인 여행에 보내세요. 각 네트워크를
                방문할 때마다 글로벌 잭팟 풀에 CHURR가 추가됩니다. 새 네트워크는
                50 CHURR, 재방문은 10 CHURR를 기여합니다.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0 font-bold text-lg">
              2
            </div>
            <div>
              <p className="font-bold text-white text-lg mb-2">
                🎰 랜덤 잭팟 시스템
              </p>
              <p className="text-white/70 leading-relaxed">
                네트워크를 이동할 때마다 랜덤하게 잭팟이 터질 수 있습니다! 기본
                확률은 0.1%이며, 풀에 CHURR가 많이 쌓일수록 확률이 최대 5%까지
                증가합니다. 잭팟이 터지면 그 순간 이동한 고양이가 전체 풀을
                독식합니다!
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center flex-shrink-0 font-bold text-lg">
              3
            </div>
            <div>
              <p className="font-bold text-white text-lg mb-2">
                ♾️ 무제한 기여
              </p>
              <p className="text-white/70 leading-relaxed">
                CHURR 기여에 제한이 없습니다! 계속해서 네트워크를 방문하며 잭팟
                풀을 키우세요. 풀이 클수록 잭팟 터질 확률도 높아집니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-secondary/30 rounded-2xl">
          <div className="flex items-start gap-3">
            <Trophy size={24} className="text-secondary flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-secondary text-lg mb-2">
                💡 전략 TIP
              </p>
              <p className="text-white/80 leading-relaxed">
                여러 고양이를 동시에 여행 보내면 더 빠르게 풀이 커지고, 잭팟
                확률도 높아집니다. 하지만 잭팟은 단 한 마리만 가져갈 수 있으니
                전략적으로 플레이하세요!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


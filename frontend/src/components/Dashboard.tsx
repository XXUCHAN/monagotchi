import { Cat, Loader2 } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { StatsCard } from './StatsCard'
import { MissionCard } from './MissionCard'
import { ClanSelectionModal } from './ClanSelectionModal'
import { CatCard } from './CatCard'
import { CatDetailModal } from './CatDetailModal'
import { FactionStats } from './FactionStats'
import { useContract, useWallet } from '../hooks'
import { toast } from 'react-hot-toast'
import { POWER_THRESHOLD, CLAN_NAMES } from '../constants'
import { formatTokenAmount } from '../lib'
import type { CatDisplay } from '../types'

export function Dashboard() {
  const { mintCat, getUserCatTokenIds, getCat, getChurrBalance } = useContract()
  const { switchNetwork, walletAddress } = useWallet()
  const [isMinting, setIsMinting] = useState(false)
  const [showClanModal, setShowClanModal] = useState(false)
  const [cats, setCats] = useState<CatDisplay[]>([])
  const [isLoadingCats, setIsLoadingCats] = useState(true)
  const [churrBalance, setChurrBalance] = useState<string>('0')
  const [selectedCat, setSelectedCat] = useState<CatDisplay | null>(null)

  // 고양이 목록 로딩
  const loadCats = useCallback(async () => {
    if (!walletAddress) {
      setIsLoadingCats(false)
      return
    }

    try {
      setIsLoadingCats(true)
      console.log('🐱 Loading cats for:', walletAddress)

      // 사용자의 고양이 토큰 ID들 가져오기
      const tokenIds = await getUserCatTokenIds(walletAddress)
      console.log('📋 Token IDs:', tokenIds)

      if (tokenIds.length === 0) {
        setCats([])
        setIsLoadingCats(false)
        return
      }

      // 각 토큰의 상세 정보 가져오기
      const catsData: CatDisplay[] = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const [_, clan, power, rewarded] = await getCat(tokenId)
          return {
            tokenId: tokenId.toString(),
            clan: Number(clan),
            power: Number(power),
            rarity: 0, // Oracle imprint에서 가져와야 하는데 일단 0
            lastMissionDaily: 0,
            lastMissionWeekly: 0,
            lastMissionMonthly: 0,
            canClaimReward: Number(power) >= POWER_THRESHOLD && !rewarded,
          }
        })
      )

      console.log('✅ Loaded cats:', catsData)
      setCats(catsData)
    } catch (error) {
      console.error('❌ Failed to load cats:', error)
      toast.error('고양이 목록을 불러오는데 실패했습니다')
    } finally {
      setIsLoadingCats(false)
    }
  }, [walletAddress, getUserCatTokenIds, getCat])

  // CHURR 잔액 로딩
  const loadChurrBalance = useCallback(async () => {
    if (!walletAddress) return

    try {
      const balance = await getChurrBalance(walletAddress)
      setChurrBalance(formatTokenAmount(balance, 18, 2))
    } catch (error) {
      console.error('Failed to load CHURR balance:', error)
    }
  }, [walletAddress, getChurrBalance])

  // 초기 로딩 - walletAddress 변경 시에만 실행
  useEffect(() => {
    if (walletAddress) {
      loadCats()
      loadChurrBalance()
    }
  }, [walletAddress]) // loadCats, loadChurrBalance 제거 → 무한 루프 방지

  // 고양이 목록이 업데이트되면 선택된 고양이도 업데이트
  useEffect(() => {
    if (selectedCat && cats.length > 0) {
      const updatedCat = cats.find(c => c.tokenId === selectedCat.tokenId)
      if (updatedCat) {
        setSelectedCat(updatedCat)
      }
    }
  }, [cats]) // cats 변경 시에만 실행

  const handleOpenMint = () => {
    setShowClanModal(true)
  }

  const handleClanSelect = async (clan: number) => {
    try {
      setIsMinting(true)
      
      // 먼저 네트워크를 올바르게 전환
      console.log('🔄 Switching to correct network...')
      try {
        await switchNetwork()
        console.log('✅ Network switched successfully')
      } catch (switchError) {
        console.error('⚠️ Network switch failed:', switchError)
        toast.error('네트워크 전환에 실패했습니다. MetaMask에서 Hardhat Local을 선택해주세요.')
        throw switchError
      }
      
      // 네트워크 전환 후 민팅
      await mintCat(clan)
      setShowClanModal(false)
      
      // 민팅 성공 후 고양이 목록 새로고침
      setTimeout(() => {
        loadCats()
        loadChurrBalance()
      }, 2000) // 블록 확인 시간 대기
    } catch (error) {
      console.error('Mint failed:', error)
    } finally {
      setIsMinting(false)
    }
  }
  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-white/60">Manage your cats and track your earnings</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleOpenMint}
            disabled={isMinting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Cat size={20} />
            <span>{isMinting ? 'Minting...' : 'Mint Cat'}</span>
          </button>
        </div>
      </div>

      {/* Clan Selection Modal */}
      <ClanSelectionModal
        isOpen={showClanModal}
        onClose={() => !isMinting && setShowClanModal(false)}
        onSelect={handleClanSelect}
        isLoading={isMinting}
      />

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          label="Your Cats"
          value={isLoadingCats ? '...' : cats.length}
          subtext={cats.length > 0 ? `${cats.length} cat${cats.length > 1 ? 's' : ''} owned` : 'No cats yet'}
        />
        <StatsCard 
          label="Total Balance"
          value={`${churrBalance} CHURR`}
          subtext="$0.00 USD"
          valueClassName="text-secondary"
        />
        <StatsCard 
          label="Can Claim Reward"
          value={cats.filter(c => c.canClaimReward).length}
          subtext={`${cats.filter(c => c.power >= POWER_THRESHOLD).length} cats with Power ≥ 50`}
        />
        <StatsCard 
          label="Top Alignment"
          value={
            cats.length > 0
              ? CLAN_NAMES[cats.sort((a, b) => b.power - a.power)[0].clan as keyof typeof CLAN_NAMES] || '—'
              : '—'
          }
          subtext={cats.length > 0 ? `Power: ${cats[0]?.power || 0}` : 'Mint a cat'}
        />
      </div>


      <div className="grid lg:grid-cols-3 gap-6">
        {/* Your Cats */}
        <div className="lg:col-span-2 glass p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Your Cats</h3>
            {cats.length > 0 && (
              <span className="text-sm text-white/60">
                {cats.length} cat{cats.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Loading State */}
          {isLoadingCats && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-3">
                <Loader2 className="mx-auto text-primary animate-spin" size={48} />
                <p className="text-white/60">Loading your cats...</p>
              </div>
            </div>
          )}

          {/* No Cats State */}
          {!isLoadingCats && cats.length === 0 && (
            <div className="flex items-center justify-center py-16 border-2 border-dashed border-white/10 rounded-xl">
              <div className="text-center space-y-3">
                <Cat className="mx-auto text-white/30" size={48} strokeWidth={1.5} />
                <p className="text-white/60">No cats yet</p>
                <button
                  onClick={handleOpenMint}
                  disabled={isMinting}
                  className="text-sm text-primary hover:text-accent transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMinting ? 'Minting...' : 'Mint your first cat →'}
                </button>
              </div>
            </div>
          )}

          {/* Cats Grid */}
          {!isLoadingCats && cats.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {cats.map((cat) => (
                <CatCard
                  key={cat.tokenId}
                  cat={cat}
                  onSelect={() => setSelectedCat(cat)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cat Detail Modal */}
        {selectedCat && (
          <CatDetailModal
            cat={selectedCat}
            isOpen={!!selectedCat}
            onClose={() => setSelectedCat(null)}
            onRefresh={() => {
              // Dashboard 데이터 새로고침
              // cats가 업데이트되면 useEffect에서 자동으로 selectedCat도 업데이트됨
              loadCats();
              loadChurrBalance();
            }}
          />
        )}

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Daily Missions */}
          <div className="glass p-6 space-y-4">
            <h3 className="text-xl font-bold">Daily Missions</h3>
            <div className="space-y-3">
              <MissionCard 
                title="Mint a Cat"
                reward="+50 CHURR"
                progress={0}
                completed={true}
              />
              <MissionCard 
                title="Complete 3 Battles"
                reward="+100 CHURR"
                completed={false}
              />
              <MissionCard 
                title="Trade 5 Times"
                reward="+200 CHURR"
                completed={false}
              />
            </div>
          </div>

          {/* Faction Stats */}
          <FactionStats />
        </div>
      </div>
    </div>
  )
}


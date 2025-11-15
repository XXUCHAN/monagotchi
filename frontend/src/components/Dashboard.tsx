import { Cat } from 'lucide-react'
import { useState } from 'react'
import { StatsCard } from './StatsCard'
import { MissionCard } from './MissionCard'
import { useContract } from '../hooks'
import { CLAN } from '../constants'

export function Dashboard() {
  const { mintCat } = useContract()
  const [isMinting, setIsMinting] = useState(false)

  const handleMintCat = async () => {
    try {
      setIsMinting(true)
      // Default to BTC clan for now
      await mintCat(CLAN.BTC)
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
            onClick={handleMintCat}
            disabled={isMinting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Cat size={20} />
            <span>{isMinting ? 'Minting...' : 'Mint Cat'}</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          label="Your Cats"
          value={0}
          subtext="+0 this week"
        />
        <StatsCard 
          label="Total Earned"
          value="0 CHURR"
          subtext="$0.00 USD"
          valueClassName="text-secondary"
        />
        <StatsCard 
          label="Missions Done"
          value="0/3"
          subtext="Reset in 12h"
        />
        <StatsCard 
          label="Alignment"
          value="—"
          subtext="Choose your side"
        />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Your Cats */}
        <div className="lg:col-span-2 glass p-6 space-y-4">
          <h3 className="text-xl font-bold">Your Cats</h3>
          <div className="flex items-center justify-center py-16 border-2 border-dashed border-white/10 rounded-xl">
            <div className="text-center space-y-3">
              <Cat className="mx-auto text-white/30" size={48} strokeWidth={1.5} />
              <p className="text-white/60">No cats yet</p>
              <button
                onClick={handleMintCat}
                disabled={isMinting}
                className="text-sm text-primary hover:text-accent transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMinting ? 'Minting...' : 'Mint your first cat →'}
              </button>
            </div>
          </div>
        </div>

        {/* Missions */}
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
      </div>
    </div>
  )
}


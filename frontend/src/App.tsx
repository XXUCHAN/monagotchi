import { usePrivy } from '@privy-io/react-auth'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'
import { LayoutDashboard, Trophy, Target, Dices } from 'lucide-react'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { FeatureCard } from './components/FeatureCard'
import { Dashboard } from './components/Dashboard'
import { Leaderboard } from './components/Leaderboard'
import { MissionsPanel } from './components/MissionsPanel'
import { RoulettePanel } from './components/RoulettePanel'
import { NetworkGuard } from './components/NetworkGuard'
import { toasterConfig } from './config'
import { FEATURES } from './constants'

type TabType = 'dashboard' | 'leaderboard' | 'missions' | 'roulette'

const TABS = [
  { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leaderboard' as TabType, label: 'Leaderboard', icon: Trophy },
  { id: 'missions' as TabType, label: 'Missions', icon: Target },
  { id: 'roulette' as TabType, label: 'Roulette', icon: Dices },
]

function App() {
  const { ready, authenticated, login, logout, user } = usePrivy()
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  // Loading State
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-6 flex items-center gap-3">
          <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
          <div className="w-2 h-2 bg-secondary rounded-full animate-ping delay-75" />
          <div className="w-2 h-2 bg-accent rounded-full animate-ping delay-150" />
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={toasterConfig} />
      <NetworkGuard />
      
      <div className="min-h-screen text-white">
        {/* Header - Fixed at Top */}
        <Header 
          authenticated={authenticated}
          userAddress={user?.wallet?.address}
          onLogin={login}
          onLogout={logout}
        />

      {/* Main Content - Add padding-top to account for fixed header */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 min-h-screen">
        {!authenticated ? (
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">
            {/* Left: Hero Section */}
            <HeroSection onGetStarted={login} />

            {/* Right: Feature Grid */}
            <div className="grid gap-4">
              {FEATURES.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        ) : (
          <div className="min-h-[calc(100vh-8rem)] space-y-6">
            {/* Tab Navigation */}
            <div className="glass p-2 flex gap-2 overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'leaderboard' && <Leaderboard />}
              {activeTab === 'missions' && <MissionsPanel />}
              {activeTab === 'roulette' && <RoulettePanel />}
            </div>
      </div>
        )}
      </main>
      </div>
    </>
  )
}

export default App

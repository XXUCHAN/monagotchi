import { usePrivy } from '@privy-io/react-auth'
import { TrendingUp, Coins, Award } from 'lucide-react'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { FeatureCard } from './components/FeatureCard'
import { Dashboard } from './components/Dashboard'

function App() {
  const { ready, authenticated, login, logout, user } = usePrivy()

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

  const handleMintCat = () => {
    console.log('Mint cat clicked')
    // TODO: Implement mint cat logic
  }

  return (
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
              <FeatureCard 
                icon={TrendingUp}
                iconColor="text-btc"
                iconBgColor="bg-btc/10 border border-btc/20"
                title="Bitcoin Alignment"
                description="Bet on orange coin supremacy. Higher volatility means higher rewards."
                number="01"
              />
              
              <FeatureCard 
                icon={Coins}
                iconColor="text-eth"
                iconBgColor="bg-eth/10 border border-eth/20"
                title="Ethereum Alignment"
                description="Join the blue side. Stability and smart contracts lead to consistent gains."
                number="02"
              />
              
              <FeatureCard 
                icon={Award}
                iconColor="text-secondary"
                iconBgColor="bg-secondary/10 border border-secondary/20"
                title="Daily Missions"
                description="Complete challenges to earn $CHURR tokens and unlock special rewards."
                number="03"
              />
            </div>
          </div>
        ) : (
          <div className="min-h-[calc(100vh-8rem)]">
            <Dashboard onMintCat={handleMintCat} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App

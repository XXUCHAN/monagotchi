import { usePrivy } from '@privy-io/react-auth'
import { Cat, LogOut, TrendingUp, Coins, Award, ChevronRight, Play } from 'lucide-react'

function App() {
  const { ready, authenticated, login, logout, user } = usePrivy()

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
    <div className="min-h-screen text-white">
      {/* Modern Minimal Header */}
      <header className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Cat className="text-primary" size={28} strokeWidth={2.5} />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full animate-pulse" />
              </div>
              <span className="text-xl font-bold tracking-tight">Volatility</span>
            </div>
            
            {!authenticated ? (
              <button 
                onClick={login}
                className="group relative overflow-hidden bg-gradient-to-r from-primary to-accent px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Connect
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs font-mono text-white/70">
                    {user?.wallet?.address.slice(0, 4)}...{user?.wallet?.address.slice(-4)}
                  </span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  title="Disconnect"
                >
                  <LogOut size={18} className="text-white/60 hover:text-white/90 transition-colors" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!authenticated ? (
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-12rem)]">
            {/* Left: Hero Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-primary font-medium">Live on Monad Testnet</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                Trade volatility.
                <br />
                <span className="text-gradient">Earn rewards.</span>
              </h1>
              
              <p className="text-lg text-white/60 max-w-lg leading-relaxed">
                Choose your side in the eternal battle. Mint cats aligned with Bitcoin or Ethereum, 
                complete missions, and claim rewards based on market volatility.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={login}
                  className="group relative overflow-hidden bg-gradient-to-r from-primary to-accent px-8 py-4 rounded-xl font-semibold transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Start Playing
                    <Play size={20} className="group-hover:translate-x-1 transition-transform" fill="currentColor" />
                  </span>
                </button>
                
                <button className="px-8 py-4 rounded-xl font-semibold border border-white/10 hover:bg-white/5 transition-all">
                  Learn More
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
                <div>
                  <div className="text-2xl font-bold text-gradient">1,234</div>
                  <div className="text-xs text-white/50 mt-1">Cats Minted</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gradient">$12.5k</div>
                  <div className="text-xs text-white/50 mt-1">Rewards Paid</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gradient">847</div>
                  <div className="text-xs text-white/50 mt-1">Active Players</div>
                </div>
              </div>
            </div>

            {/* Right: Feature Grid */}
            <div className="grid gap-4">
              <div className="group glass-hover p-6 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-btc/10 border border-btc/20">
                    <TrendingUp className="text-btc" size={24} />
                  </div>
                  <span className="text-xs font-medium text-white/40">01</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Bitcoin Alignment</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Bet on orange coin supremacy. Higher volatility means higher rewards.
                </p>
              </div>

              <div className="group glass-hover p-6 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-eth/10 border border-eth/20">
                    <Coins className="text-eth" size={24} />
                  </div>
                  <span className="text-xs font-medium text-white/40">02</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Ethereum Alignment</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Join the blue side. Stability and smart contracts lead to consistent gains.
                </p>
              </div>

              <div className="group glass-hover p-6 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                    <Award className="text-secondary" size={24} />
                  </div>
                  <span className="text-xs font-medium text-white/40">03</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Daily Missions</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Complete challenges to earn $FISH tokens and unlock special rewards.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
                <p className="text-white/60">Manage your cats and track your earnings</p>
              </div>
              
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                  <Cat size={20} />
                  <span>Mint Cat</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass p-5 space-y-2">
                <div className="text-white/60 text-sm">Your Cats</div>
                <div className="text-3xl font-bold">0</div>
                <div className="text-xs text-white/40">+0 this week</div>
              </div>

              <div className="glass p-5 space-y-2">
                <div className="text-white/60 text-sm">Total Earned</div>
                <div className="text-3xl font-bold text-secondary">0 FISH</div>
                <div className="text-xs text-white/40">$0.00 USD</div>
              </div>

              <div className="glass p-5 space-y-2">
                <div className="text-white/60 text-sm">Missions Done</div>
                <div className="text-3xl font-bold">0/3</div>
                <div className="text-xs text-white/40">Reset in 12h</div>
              </div>

              <div className="glass p-5 space-y-2">
                <div className="text-white/60 text-sm">Alignment</div>
                <div className="text-3xl font-bold">—</div>
                <div className="text-xs text-white/40">Choose your side</div>
              </div>
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
                    <button className="text-sm text-primary hover:text-accent transition-colors font-medium">
                      Mint your first cat →
                    </button>
                  </div>
                </div>
              </div>

              {/* Missions */}
              <div className="glass p-6 space-y-4">
                <h3 className="text-xl font-bold">Daily Missions</h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mint a Cat</span>
                      <span className="text-xs text-secondary">+50 FISH</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-secondary w-0" />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 opacity-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Complete 3 Battles</span>
                      <span className="text-xs text-secondary">+100 FISH</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 opacity-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Trade 5 Times</span>
                      <span className="text-xs text-secondary">+200 FISH</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App

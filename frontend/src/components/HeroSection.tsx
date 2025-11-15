import { Play } from 'lucide-react'

interface HeroSectionProps {
  onGetStarted: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="space-y-8">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm">
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
        <span className="text-primary font-medium">Live on Monad Testnet</span>
      </div>
      
      {/* Hero Title */}
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
        Cross-Chain NFT.
        <br />
        <span className="text-gradient">Epic Jackpots.</span>
      </h1>
      
      {/* Description */}
      <p className="text-lg text-white/60 max-w-lg leading-relaxed">
        Mint your Monagotchi, send them on cross-chain adventures via CCIP, 
        and win massive jackpots! Complete missions, earn CHURR tokens, and compete for glory.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={onGetStarted}
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
  )
}


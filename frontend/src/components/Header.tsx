import { Cat, LogOut, ChevronRight } from 'lucide-react'

interface HeaderProps {
  authenticated: boolean
  userAddress?: string
  onLogin: () => void
  onLogout: () => void
}

export function Header({ authenticated, userAddress, onLogin, onLogout }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 border-b border-white/10 backdrop-blur-xl bg-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Cat className="text-primary" size={28} strokeWidth={2.5} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight">Monagotchi</span>
          </div>
          
          {/* Auth Section */}
          {!authenticated ? (
            <button 
              onClick={onLogin}
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
                  {userAddress?.slice(0, 4)}...{userAddress?.slice(-4)}
                </span>
              </div>
              <button 
                onClick={onLogout}
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
  )
}


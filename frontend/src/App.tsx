import { usePrivy } from '@privy-io/react-auth'
import { Toaster } from 'react-hot-toast'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { FeatureCard } from './components/FeatureCard'
import { Dashboard } from './components/Dashboard'
import { toasterConfig } from './config'
import { FEATURES } from './constants'

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

  return (
    <>
      <Toaster position="top-right" toastOptions={toasterConfig} />
      
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
          <div className="min-h-[calc(100vh-8rem)]">
            <Dashboard />
      </div>
        )}
      </main>
      </div>
    </>
  )
}

export default App

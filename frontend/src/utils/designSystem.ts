/**
 * Volatility Cats Design System
 * Modern Glassmorphism Theme
 */

export const colors = {
  primary: '#fb5a49',     // Coral Red - 주요 액션, CTA 버튼
  secondary: '#fed16e',   // Sunshine Yellow - 보상, 성공 메시지
  accent: '#f0b07d',      // Peach - 부드러운 강조, 호버 상태
  
  // Context Colors
  btc: '#F7931A',
  eth: '#627EEA',
} as const

/**
 * Glassmorphism 스타일 유틸리티
 */
export const glass = {
  // 기본 글라스 카드
  card: 'backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-glass',
  
  // 호버 효과가 있는 글라스 카드
  cardHover: 'backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-glass hover:shadow-glass-hover hover:bg-white/15 transition-all duration-300',
  
  // 버튼 스타일
  button: {
    primary: 'flex items-center gap-2 backdrop-blur-md bg-primary/80 hover:bg-primary border border-white/20 text-white font-semibold rounded-xl px-6 py-3 shadow-glass transition-all duration-300 hover:scale-105',
    secondary: 'flex items-center gap-2 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-xl px-6 py-3 shadow-glass transition-all duration-300',
    accent: 'flex items-center gap-2 backdrop-blur-md bg-accent/80 hover:bg-accent border border-white/20 text-white font-semibold rounded-xl px-6 py-3 shadow-glass transition-all duration-300 hover:scale-105',
  },
  
  // 헤더
  header: 'backdrop-blur-lg bg-white/5 border-b border-white/10',
  
  // 입력 필드
  input: 'backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50',
} as const

/**
 * 아이콘 크기 표준
 */
export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
} as const

/**
 * 간격 표준
 */
export const spacing = {
  section: 'py-8 px-6',
  card: 'p-6',
  cardLg: 'p-8',
} as const

/**
 * 애니메이션 유틸리티
 */
export const animations = {
  fadeIn: 'animate-fadeIn',
  slideUp: 'animate-slideUp',
  scale: 'transition-transform duration-300 hover:scale-105',
  glow: 'transition-shadow duration-300 hover:shadow-glass-hover',
} as const

/**
 * 타이포그래피
 */
export const typography = {
  h1: 'text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent',
  h2: 'text-4xl font-bold text-white',
  h3: 'text-2xl font-semibold text-white',
  body: 'text-base text-white/90',
  caption: 'text-sm text-white/70',
} as const


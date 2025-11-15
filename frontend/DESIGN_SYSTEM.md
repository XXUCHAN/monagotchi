# Volatility Cats Design System

## 🎨 색상 팔레트

### 브랜드 컬러

```css
primary:   #fb5a49  /* Coral Red - 주요 액션, CTA 버튼 */
secondary: #fed16e  /* Sunshine Yellow - 보상, 성공 메시지 */
accent:    #f0b07d  /* Peach - 부드러운 강조, 호버 상태 */
```

### 컨텍스트 컬러

```css
btc: #F7931A  /* Bitcoin Orange */
eth: #627EEA  /* Ethereum Blue */
```

### 사용 가이드

- **Primary (#fb5a49)**: 주요 버튼, 중요한 액션, 강조가 필요한 요소
- **Secondary (#fed16e)**: 보상 알림, 성공 메시지, 긍정적 피드백
- **Accent (#f0b07d)**: 호버 상태, 부드러운 강조, 보조 UI 요소

## 🪟 글라스모피즘 (Glassmorphism)

### 핵심 스타일

```css
backdrop-blur-md       /* 배경 블러 효과 */
bg-white/10           /* 반투명 배경 */
border border-white/20 /* 은은한 테두리 */
shadow-glass          /* 글라스 그림자 */
```

### 컴포넌트별 적용

#### 카드

```tsx
// 기본 카드
<div className="glass p-6">
  {/* 내용 */}
</div>

// 호버 효과가 있는 카드
<div className="glass-hover p-8">
  {/* 내용 */}
</div>
```

#### 버튼

```tsx
import { glass } from './utils/designSystem'

// Primary 버튼
<button className={glass.button.primary}>
  Click Me
</button>

// Secondary 버튼
<button className={glass.button.secondary}>
  Cancel
</button>

// Accent 버튼
<button className={glass.button.accent}>
  Learn More
</button>
```

#### 헤더

```tsx
<header className={glass.header}>{/* 헤더 내용 */}</header>
```

## 🎭 아이콘

### Lucide React 사용

```tsx
import { Cat, Wallet, Sparkles, Bitcoin, Zap } from 'lucide-react'

// 아이콘 크기 표준
<Cat size={16} />  // xs
<Cat size={20} />  // sm
<Cat size={24} />  // md (기본)
<Cat size={32} />  // lg
<Cat size={40} />  // xl
<Cat size={48} />  // 2xl
```

### 아이콘 컬러링

```tsx
// Primary 컬러
<Cat className="text-primary" size={24} />

// Secondary 컬러
<Sparkles className="text-secondary" size={24} />

// Accent 컬러
<Zap className="text-accent" size={24} />

// 반투명
<Wallet className="text-white/70" size={20} />
```

## 📐 타이포그래피

### 헤딩

```tsx
// H1 - 그라디언트 텍스트
<h1 className="text-6xl font-bold text-gradient">
  Welcome
</h1>

// H2
<h2 className="text-4xl font-bold text-white">
  Section Title
</h2>

// H3
<h3 className="text-2xl font-semibold text-white">
  Card Title
</h3>
```

### 본문

```tsx
// 일반 텍스트
<p className="text-white/90">
  Regular text content
</p>

// 보조 텍스트
<p className="text-white/70">
  Secondary text
</p>

// 캡션
<span className="text-sm text-white/60">
  Caption text
</span>
```

## 🎬 애니메이션

### 호버 효과

```tsx
// 스케일 애니메이션
<div className="transition-transform duration-300 hover:scale-105">
  {/* 내용 */}
</div>

// 글로우 효과
<div className="transition-shadow duration-300 hover:shadow-glass-hover">
  {/* 내용 */}
</div>
```

### 로딩 상태

```tsx
import { Sparkles } from 'lucide-react';

<Sparkles className="animate-spin text-primary" size={24} />;
```

## 📦 유틸리티 클래스

### 그라디언트 배경

```tsx
// 메인 그라디언트 (body 기본값)
<div className="bg-gradient-main">

// Warm 그라디언트
<div className="bg-gradient-warm">

// 글라스 그라디언트
<div className="bg-gradient-glass">
```

### 간격

```tsx
// 섹션 간격
<section className="py-8 px-6">

// 카드 내부 간격
<div className="glass p-6">

// 큰 카드 내부 간격
<div className="glass p-8">
```

## 🛠 디자인 시스템 사용 예시

### 전체 레이아웃

```tsx
import { glass } from './utils/designSystem';
import { Cat, Wallet } from 'lucide-react';

function MyComponent() {
    return (
        <div className="min-h-screen">
            <header className={glass.header}>
                <div className="container mx-auto px-6 py-4">
                    <Cat className="text-primary" size={32} />
                    <h1 className="text-gradient">Title</h1>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12">
                <div className="glass-hover p-8">
                    <h2 className="text-3xl font-bold mb-4">Card Title</h2>
                    <p className="text-white/80 mb-6">Content here</p>
                    <button className={glass.button.primary}>
                        <Wallet size={20} />
                        <span>Action</span>
                    </button>
                </div>
            </main>
        </div>
    );
}
```

## 🎯 반응형 가이드

```tsx
// 모바일 우선 접근
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 그리드 아이템 */}
</div>

// 컨테이너
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* 내용 */}
</div>
```

## 🚀 성능 최적화

1. **Backdrop Blur**: 과도한 사용 지양, 주요 카드에만 적용
2. **애니메이션**: `duration-300`으로 통일, 부드러운 전환
3. **그라디언트**: CSS 그라디언트 사용, 이미지 지양
4. **아이콘**: Lucide React의 트리셰이킹 활용

## 📚 참고 자료

- [Tailwind CSS 공식 문서](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [Glassmorphism Generator](https://hype4.academy/tools/glassmorphism-generator)

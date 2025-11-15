# Component Structure

## 📁 컴포넌트 구조

```
src/
├── components/
│   ├── index.ts              # 컴포넌트 Export 파일
│   ├── Header.tsx            # 고정 헤더 (sticky)
│   ├── HeroSection.tsx       # 랜딩 페이지 Hero 섹션
│   ├── FeatureCard.tsx       # 재사용 가능한 Feature 카드
│   ├── Dashboard.tsx         # 로그인 후 대시보드
│   ├── StatsCard.tsx         # 통계 카드 컴포넌트
│   └── MissionCard.tsx       # 미션 카드 컴포넌트
├── utils/
│   └── designSystem.ts       # 디자인 시스템 유틸리티
├── types/
│   └── index.ts              # TypeScript 타입 정의
├── App.tsx                   # 메인 앱 컴포넌트
└── main.tsx                  # 앱 진입점
```

---

## 🧩 컴포넌트 상세

### 1. **Header** (Sticky Navigation)
**파일**: `components/Header.tsx`

상단에 고정되는 네비게이션 헤더입니다.

```tsx
interface HeaderProps {
  authenticated: boolean
  userAddress?: string
  onLogin: () => void
  onLogout: () => void
}
```

**특징:**
- `sticky top-0 z-50` - 스크롤해도 상단 고정
- `backdrop-blur-xl` - 글라스모피즘 효과
- 로그인/로그아웃 상태에 따라 다른 UI 표시
- 반응형 디자인 (모바일에서 지갑 주소 숨김)

**사용 예시:**
```tsx
<Header 
  authenticated={authenticated}
  userAddress={user?.wallet?.address}
  onLogin={login}
  onLogout={logout}
/>
```

---

### 2. **HeroSection** (Landing Hero)
**파일**: `components/HeroSection.tsx`

랜딩 페이지의 메인 히어로 섹션입니다.

```tsx
interface HeroSectionProps {
  onGetStarted: () => void
}
```

**구성 요소:**
- Live Badge (Monad Testnet)
- 큰 타이틀 ("Trade volatility. Earn rewards.")
- 설명 텍스트
- CTA 버튼 2개 (Start Playing, Learn More)
- 통계 표시 (Cats Minted, Rewards Paid, Active Players)

---

### 3. **FeatureCard** (Reusable Card)
**파일**: `components/FeatureCard.tsx`

재사용 가능한 Feature 카드 컴포넌트입니다.

```tsx
interface FeatureCardProps {
  icon: LucideIcon
  iconColor: string
  iconBgColor: string
  title: string
  description: string
  number: string
}
```

**특징:**
- Lucide 아이콘 지원
- 번호 표시 (01, 02, 03...)
- 호버 효과 (glass-hover)
- 커스터마이징 가능한 아이콘 색상

**사용 예시:**
```tsx
<FeatureCard 
  icon={TrendingUp}
  iconColor="text-btc"
  iconBgColor="bg-btc/10 border border-btc/20"
  title="Bitcoin Alignment"
  description="Bet on orange coin supremacy..."
  number="01"
/>
```

---

### 4. **Dashboard** (Authenticated View)
**파일**: `components/Dashboard.tsx`

로그인 후 표시되는 대시보드 메인 화면입니다.

```tsx
interface DashboardProps {
  onMintCat: () => void
}
```

**구성 요소:**
- Dashboard Header (제목 + Mint Cat 버튼)
- Quick Stats (4개의 StatsCard)
- Your Cats 영역 (Empty State)
- Daily Missions 사이드바 (3개의 MissionCard)

---

### 5. **StatsCard** (Statistics Display)
**파일**: `components/StatsCard.tsx`

통계를 표시하는 작은 카드 컴포넌트입니다.

```tsx
interface StatsCardProps {
  label: string
  value: string | number
  subtext: string
  valueClassName?: string
}
```

**사용 예시:**
```tsx
<StatsCard 
  label="Total Earned"
  value="0 FISH"
  subtext="$0.00 USD"
  valueClassName="text-secondary"
/>
```

---

### 6. **MissionCard** (Mission Item)
**파일**: `components/MissionCard.tsx`

개별 미션을 표시하는 카드입니다.

```tsx
interface MissionCardProps {
  title: string
  reward: string
  progress?: number
  completed?: boolean
}
```

**특징:**
- 진행률 바 (progress > 0일 때만 표시)
- 완료 여부에 따른 opacity 조절
- 그라디언트 진행률 바

**사용 예시:**
```tsx
<MissionCard 
  title="Mint a Cat"
  reward="+50 FISH"
  progress={50}
  completed={true}
/>
```

---

## 🎨 컴포넌트 디자인 원칙

### 1. **단일 책임 원칙 (SRP)**
각 컴포넌트는 하나의 명확한 역할만 수행합니다.
- `Header` → 네비게이션
- `StatsCard` → 통계 표시
- `MissionCard` → 미션 표시

### 2. **Props 기반 커스터마이징**
컴포넌트는 props를 통해 유연하게 커스터마이징 가능합니다.

```tsx
// 같은 컴포넌트, 다른 스타일
<FeatureCard iconColor="text-btc" ... />
<FeatureCard iconColor="text-eth" ... />
```

### 3. **합성 가능 (Composable)**
큰 컴포넌트는 작은 컴포넌트들로 구성됩니다.

```tsx
// Dashboard는 StatsCard와 MissionCard를 사용
<Dashboard>
  <StatsCard />
  <StatsCard />
  <MissionCard />
</Dashboard>
```

### 4. **TypeScript 타입 안정성**
모든 Props는 명확한 타입 정의를 가집니다.

---

## 📦 컴포넌트 Import 방법

### 방법 1: 개별 Import
```tsx
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
```

### 방법 2: Index Export 사용 (추천)
```tsx
import { 
  Header, 
  HeroSection, 
  FeatureCard, 
  Dashboard 
} from './components'
```

---

## 🔄 컴포넌트 데이터 흐름

```
App.tsx (Root)
  │
  ├─→ Header (인증 상태, 지갑 주소)
  │
  └─→ Main Content
       │
       ├─→ HeroSection (미인증)
       │    └─→ Stats (정적 데이터)
       │
       └─→ Dashboard (인증됨)
            ├─→ StatsCard × 4
            └─→ MissionCard × 3
```

---

## 🎯 다음 단계: 추가 컴포넌트

향후 추가할 컴포넌트들:

1. **CatCard** - 개별 고양이 NFT 카드
2. **MintModal** - 고양이 민팅 모달
3. **BattleCard** - 배틀 화면 컴포넌트
4. **RewardModal** - 보상 수령 모달
5. **Notification** - 알림 토스트
6. **LoadingSpinner** - 로딩 상태 컴포넌트

---

## 💡 베스트 프랙티스

### 1. 컴포넌트 네이밍
- PascalCase 사용 (`Header`, `StatsCard`)
- 명확하고 설명적인 이름
- 파일명 = 컴포넌트명

### 2. Props 타입 정의
```tsx
// ✅ Good
interface HeaderProps {
  authenticated: boolean
  onLogin: () => void
}

// ❌ Bad
function Header(props: any) { }
```

### 3. 재사용성
공통 패턴을 발견하면 컴포넌트로 추출하세요.

```tsx
// 반복되는 패턴 발견
<div className="glass p-5 space-y-2">
  <div className="text-white/60 text-sm">{label}</div>
  <div className="text-3xl font-bold">{value}</div>
</div>

// → StatsCard 컴포넌트로 추출
```

### 4. 상태 관리
- 컴포넌트는 가능한 stateless하게
- 상태는 부모 컴포넌트에서 관리
- Props로 데이터와 이벤트 핸들러 전달

---

## 🛠 유지보수 가이드

### 컴포넌트 수정 시
1. Props 인터페이스 먼저 확인
2. 타입 안정성 유지
3. 기존 사용처 영향 확인
4. Linter 오류 체크

### 새 컴포넌트 추가 시
1. `components/` 폴더에 생성
2. Props 인터페이스 정의
3. `components/index.ts`에 export 추가
4. 디자인 시스템 컬러/스타일 사용


# Frontend Development Rules - Volatility Cats on Monad

> 10년차 프론트엔드 개발자의 6시간 해커톤 전략: **Simple, Fast, Works**

## 🎯 프로젝트 컨텍스트

- **체인**: Monad Testnet
- **인증/지갑**: Privy (임베디드 월렛)
- **Web3 라이브러리**: ethers v6
- **프레임워크**: React 18 + TypeScript + Vite
- **스타일링**: TailwindCSS
- **목표**: 6시간 안에 동작하는 데모 완성

## 🚫 절대 금지 사항

### 1. 과도한 추상화 금지
```typescript
// ❌ BAD - 6시간 해커톤에서 이런 거 만들지 마라
class ContractServiceFactory {
  createService<T extends BaseContract>() { ... }
}

// ✅ GOOD - 직관적이고 빠르게
const contract = new ethers.Contract(ADDRESS, ABI, signer);
await contract.mintRandomCat(0);
```

### 2. wagmi/rainbowkit/web3modal 설치 금지
- **이유**: Privy가 이미 지갑 연결을 처리함
- **설치하면**: 패키지 충돌, 시간 낭비, 혼란

### 3. 백엔드 의존 최소화
- 모든 데이터는 **온체인에서 직접 읽기**
- 백엔드는 리더보드 캐싱 정도만
- API 호출 실패 시에도 UI는 작동해야 함

### 4. 완벽한 에러 처리 집착 금지
```typescript
// ❌ BAD - 모든 엣지케이스 처리
try {
  await tx.wait();
} catch (err) {
  if (err.code === 'INSUFFICIENT_FUNDS') { ... }
  else if (err.code === 'NONCE_EXPIRED') { ... }
  // 20줄의 에러 처리...
}

// ✅ GOOD - 간단하게
try {
  await tx.wait();
  toast.success('미션 완료!');
} catch (err) {
  toast.error('실패: ' + err.message.slice(0, 50));
}
```

## ✅ 핵심 원칙

### 1. 의존성 최소화
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@privy-io/react-auth": "^1.x.x",
    "ethers": "^6.x.x",
    "react-hot-toast": "^2.x.x"
  }
}
```

### 2. 컴포넌트는 기능 단위로 1개씩
```
src/
├── App.tsx                 # Privy Provider + 라우팅
├── components/
│   ├── LoginButton.tsx     # Privy 로그인/로그아웃
│   ├── CatCard.tsx         # 고양이 카드 (alignment, power)
│   ├── MintButton.tsx      # 고양이 뽑기
│   └── MissionButtons.tsx  # Daily/Weekly/Monthly
├── hooks/
│   ├── useContract.ts      # ethers 컨트랙트 인스턴스
│   └── useCatData.ts       # 고양이 데이터 읽기
└── config.ts               # 컨트랙트 주소, ABI
```

### 3. 상태 관리는 React State만
- **Zustand/Redux 금지**: 오버엔지니어링
- **useState + useEffect로 충분**
- **로컬스토리지**: 마지막 민트한 tokenId만 저장

### 4. 스타일링은 TailwindCSS 인라인
```tsx
// ✅ GOOD - 빠르고 직관적
<div className="bg-purple-600 rounded-lg p-6 shadow-xl">
  <h2 className="text-2xl font-bold text-white">
    {cat.alignment === 0 ? '🪙 BTC Cat' : '💎 ETH Cat'}
  </h2>
  <p className="text-gray-200">Power: {cat.power}</p>
</div>
```

## 🔧 핵심 코드 패턴

### Privy 인증
```typescript
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';

// App.tsx
<PrivyProvider
  appId={import.meta.env.VITE_PRIVY_APP_ID}
  config={{
    embeddedWallets: { createOnLogin: 'users-without-wallets' }
  }}
>
  <YourApp />
</PrivyProvider>

// LoginButton.tsx
const { login, logout, authenticated, user } = usePrivy();
const address = user?.wallet?.address;
```

### ethers 컨트랙트 호출
```typescript
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';

// useContract.ts
export function useContract() {
  const { user } = usePrivy();
  
  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  };

  const mintCat = async (alignment: number) => {
    const contract = await getContract();
    const tx = await contract.mintRandomCat(alignment);
    await tx.wait();
    return tx;
  };

  return { mintCat };
}
```

### 쿨다운 계산
```typescript
// useCatData.ts
export function useCooldown(lastMissionTimestamp: number, cooldownSeconds: number) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - lastMissionTimestamp;
      const left = Math.max(0, cooldownSeconds - elapsed);
      setRemaining(left);
      if (left === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [lastMissionTimestamp, cooldownSeconds]);

  return {
    canRun: remaining === 0,
    remainingTime: remaining,
    displayTime: `${Math.floor(remaining / 3600)}h ${Math.floor((remaining % 3600) / 60)}m`
  };
}
```

## 🎨 UI/UX 가이드

### 1. 로딩 상태는 단순하게
```tsx
{isLoading ? <div className="animate-spin">⏳</div> : <button>민트</button>}
```

### 2. 에러는 toast로
```typescript
import toast from 'react-hot-toast';

toast.error('트랜잭션 실패');
toast.success('고양이 민트 완료! 🐱');
```

### 3. 데이터 없을 때 placeholder
```tsx
{cats.length === 0 ? (
  <div className="text-gray-400">
    아직 고양이가 없어요. 먼저 뽑아보세요! 🎲
  </div>
) : (
  <CatCard cat={cats[0]} />
)}
```

## 🚀 개발 순서 (우선순위)

### P0 - 필수 (첫 3시간)
1. ✅ Privy 로그인/로그아웃
2. ✅ 고양이 민트 (alignment 선택)
3. ✅ 내 고양이 보기 (tokenId, power, alignment)
4. ✅ 미션 실행 버튼 (3개)

### P1 - 중요 (다음 2시간)
5. ✅ 쿨다운 타이머 표시
6. ✅ 보상 claim 버튼
7. ✅ FishToken 잔액 표시

### P2 - 선택 (마지막 1시간, 시간 있으면)
8. ⭐ 간단한 애니메이션 (power 증가 시)
9. ⭐ 리더보드 (백엔드 API 필요)
10. ⭐ 고양이 이미지 (SVG 또는 emoji)

## 📊 데이터 흐름

```
1. 사용자 로그인 (Privy)
   ↓
2. 지갑 주소 획득 (user.wallet.address)
   ↓
3. 컨트랙트 연결 (ethers)
   ↓
4. 고양이 민트 (mintRandomCat)
   ↓
5. tokenId 저장 (localStorage)
   ↓
6. 고양이 데이터 읽기 (cats[tokenId])
   ↓
7. UI 렌더링 (CatCard)
   ↓
8. 미션 실행 (runMission)
   ↓
9. power 증가 확인 (재조회)
   ↓
10. 보상 claim (power >= 50)
```

## 🐛 디버깅 체크리스트

### 트랜잭션 실패 시
- [ ] Monad Testnet에 연결되어 있는가?
- [ ] 지갑에 테스트넷 토큰이 있는가?
- [ ] 컨트랙트 주소가 올바른가?
- [ ] ABI가 최신인가?
- [ ] ownerOf(tokenId) == msg.sender 인가?
- [ ] 쿨다운이 남아있지 않은가?

### Privy 이슈 시
- [ ] VITE_PRIVY_APP_ID가 .env에 있는가?
- [ ] Privy 대시보드에서 도메인이 허용되었는가?
- [ ] embeddedWallets 설정이 올바른가?

### ethers 이슈 시
- [ ] window.ethereum이 존재하는가?
- [ ] BrowserProvider vs JsonRpcProvider 구분
- [ ] signer await 했는가?

## 💡 Pro Tips (10년차의 조언)

1. **console.log는 친구다**: 해커톤에서 디버거 켜는 건 시간 낭비
2. **Hard refresh (Cmd+Shift+R)**: 캐시 문제 90% 해결
3. **컨트랙트 주소 바뀌면**: localStorage 지우고 시작
4. **Transaction pending**: 2분 이상이면 실패한 거임, 새로 시도
5. **마지막 1시간은 UI 다듬기**: 기능 추가 금지, 버그 수정만

## 🎬 데모 시나리오 (리허설용)

```
1. 로그인 → "이메일로 간편 로그인" (Privy)
2. BTC 고양이 민트 → "랜덤으로 초기 능력치 생성"
3. Daily Mission 실행 → "BTC 가격 기반으로 능력치 증가"
4. Power 표시 → "현재 15 → 18로 증가"
5. 쿨다운 타이머 → "12시간 후 다시 가능"
6. (시간 조작으로) 50 달성 → Claim 버튼 활성화
7. FishToken 받기 → "10 FISH 지급 완료"
```

## 🔒 보안 주의사항

- `.env` 파일은 절대 커밋하지 말 것
- Private Key는 하드코딩 금지
- 테스트넷이라도 실제 자금 넣지 말 것
- 컨트랙트 주소는 배포 후 `config.ts`에만 관리

---

**마지막 조언**: 6시간 해커톤에서 "완벽한 코드"는 없다. **"동작하는 코드"가 최고다.** 🚀


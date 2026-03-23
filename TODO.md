# Project Status & Backlog

이 파일은 Antigravity(AI 코딩 어시스턴트)와 유저가 함께 진행 중인 프로젝트의 현재 진행 상황과 앞으로의 계획을 기록합니다. 다른 환경에서 작업을 이어갈 때 이 파일을 참조하여 정확한 맥락(Context)을 파악할 수 있습니다.

---

## 🏗️ 아키텍처 및 주요 결정 사항 (Context)
- **Framework:** Next.js (App Router)
- **Database:** Supabase (PostgreSQL) - MariaDB에서 마이그레이션 완료
- **Auth:** JWT 기반 세션 관리 (HttpOnly Cookies), bcryptjs 비밃번호 해싱
- **UI Architecture:** 모달 기반의 SPA(Single Page Application) 구조
    - `[category]` 목록 페이지 내에서 모든 추가/수정/상세조회/검색 모달로 처리
    - `add`, `edit`, `[id]` 등 기존 하드코딩된 단독 페이지는 `app/_deprecated`로 아카이빙됨
- **Config Driven:** `app/constants.ts`와 `types/index.ts`의 `CATEGORY_CONFIG`를 통해 필드 구성 및 이미지 비율(`imageAspectRatio`)이 결정됨 (Data-Driven UI)

---

## ✅ 완료된 작업 (Status)

### Phase 1: 인증 및 세션 보안 강화
- [x] 비밀번호 해싱 (bcryptjs) 적용
- [x] JWT + Cookie 기반 세션 관리 구현
- [x] `user_id`, `nickname` 중복 검사 및 Unique 제약 조건 추가
- [x] 비밀번호 마이그레이션 툴 제작 완료
- [x] `AuthContext`, `AuthProvider`, `useAuth` 커스텀 훅 구현 (인증 상태 중앙화)
- [x] 이메일 필드 추가 및 비밀번호 초기화(Reset Password) 흐름 구현

### Phase 1.6: 구조적 리팩토링 (Data-Driven)
- [x] `types/index.ts` 신설 및 DB/Config 타입 정의
- [x] `constants.ts` 내 `COMMON_FIELDS` 분리 및 적용
- [x] `ItemForm`, `ItemDetail`, `InputField` 동적 렌더링 리팩토링
- [x] `createInitialFormData` 헬퍼 함수를 통한 폼 상태 초기화 최적화
- [x] 레거시 라우팅(`add`, `edit` 등) `_deprecated` 이동 및 프로젝트 정리
- [x] **Phase 1.8: UI/UX 고도화 (Global Button Refactoring)**
    - [x] 공용 `Button` 컴포넌트 개발 (`isLoading`, `variant`, `size` 지원)
    - [x] 전역 `<button>` 태그를 `Button` 컴포넌트로 전수 교체 (Auth, List, Item, Bulk 등)
    - [x] 모든 주요 작업(저장, 삭제, 검색, 로그아웃)에 로딩 상태 및 더블 클릭 방지 적용
- [x] **Phase 1.9: 이미지 비율 및 레이아웃 최적화**
    - [x] 카테고리별 동적 이미지 비율(1:1, 3:4, 2:3) 설정 및 적용
    - [x] `ItemDetail` 모달 레이아웃 콤팩트화 (여백/이미지/폰트 크기 조정)
    - [x] 리스트 그리드 뷰(Grid View) 카드 크기 최적화 (5열 배치)

---

## 🚀 앞으로 해야 할 일 (Next Steps)

### Phase 2: 친구 및 소셜 기능 (Current Goal)
- [ ] 친구 관계(Follow/Friend) DB 스키마 설계
- [ ] 친구 추가/삭제/목록 조회 API 및 UI
- [ ] 친구의 수집 목록(Feed) 보기 기능

### UI/UX 개선 및 기능 추가
- [ ] **Pagination:** 상세 조회 및 검색 결과 많을 때 '더보기' 버튼
- [ ] **Home 스크롤 이슈:** 상단 Navigation만큼 스크롤되는 문제 해결
- [ ] **데이터 중복 처리:** DB 저장 전 중복 여부 체크 로직 강화
- [ ] **소셜 로그인:** Google/GitHub 등 OAuth 연결
- [ ] **필드 확장:** 게임 카테고리에 `playtime`, `playing` 추가 및 아이템별 `favorite`, `rating` 등 추가
- [ ] **검색 고도화:** 온라인 검색 결과를 선택해도 다시 한 번 DB 체크하는 로직

### 기타
- [ ] 데이터 백업 및 복구 기능
- [ ] 불필요한 텍스트 데이터 정제 (`- single`, `- EP` 등 제거)

---

## 📌 작업 팁 (For AI Assistant)
1. 새로운 필드를 추가할 때는 `app/constants.ts`의 `CATEGORY_CONFIG`만 수정하면 UI가 자동 반영됩니다.
2. 데이터 조작 로직은 `hooks`나 `lib` 폴더를 최대한 활용하세요.
3. 배포는 Vercel을 사용 중이며, DB 수정 시 Supabase 대시보드 확인이 필요할 수 있습니다.

# 📀 My Archive (마이 아카이브)

나만의 소중한 수집품(앨범, 도서 등)을 체계적으로 기록하고 관리하는 개인 아카이빙 플랫폼입니다.

## 🚀 Key Features (주요 기능)

* **다양한 카테고리 관리**: 앨범, 도서 등 설정에 따른 맞춤형 필드 관리 (TypeScript 기반 카테고리 설정)
* **스마트 검색 매칭**: 내부 데이터베이스 검색 및 외부 API(iTunes 등) 연동을 통한 자동 데이터 매칭
* **대량 등록 (Bulk Add)**: CSV 파일 또는 텍스트 일괄 입력을 통한 대량 아이템 등록 지원
* **지능형 에러 핸들링**: 외부 API 호출 제한(Rate Limit) 대응을 위한 Retry 메커니즘 및 Throttling 로직 구현
* **실시간 진행 상태 UI**: 대량 등록 시 실시간 진행률(%) 및 항목별 매칭 상태 시각화
* **반응형 UI**: 리스트 뷰 및 그리드 뷰 전환 기능 지원

## 🛠 Tech Stack (기술 스택)

* **Frontend**: Next.js (App Router), React, Tailwind CSS, TypeScript
* **State Management**: React Hooks (Custom Hooks)
* **Backend**: Next.js Route Handlers
* **Database**: Supabase (PostgreSQL)
* **API Integration**: iTunes Search API

## 🏗 Project Architecture (구조 설계)

본 프로젝트는 유지보수성과 확장성을 위해 다음과 같은 설계 원칙을 준수합니다.

* **관심사 분리 (Separation of Concerns)**: 비즈니스 로직은 Custom Hooks(/hooks)로, UI 표현은 Atomic Components(/components)로 분리하여 관리합니다.
* **안정성 아키텍처**: 네트워크 불안정 및 API 제한 상황을 고려하여 Exponential Backoff 스타일의 재시도 로직을 프론트엔드에 구현하였습니다.

## 📦 Directory Structure (주요 구조)

```text
├── app/               # Next.js App Router (Pages & API Routes)
├── components/        # 재사용 가능한 UI 컴포넌트
│   ├── bulk/          # 일괄 등록 관련 컴포넌트
│   ├── list/          # 목록 조회 관련 컴포넌트
│   └── item/          # 아이템 상세/수정 관련 컴포넌트
├── hooks/             # 커스텀 훅 (비즈니스 로직 캡슐화)
├── lib/               # 유틸리티 및 외부 서비스 연동 (Supabase, API)
└── constants.ts       # 카테고리 및 필드 설정 정보
```

## 📝 Ongoing Improvements (진행 예정 사항)
* [ ] 매칭 결과 개별 수정을 위한 모달 팝업 구현
* [ ] 일괄 등록 최종 저장을 위한 Bulk Insert API 최적화
* [ ] 사용자별 통계 대시보드 추가
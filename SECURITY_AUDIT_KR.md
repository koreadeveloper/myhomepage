# 보안 감사 및 구현 보고서 (Security Audit Report) 🛡️

이 문서는 **sia.kr** 관리자 대시보드 및 주요 애플리케이션에 적용된 보안 아키텍처와 강화 조치 사항을 정리한 보고서입니다.

## 1. 프론트엔드 보안 및 접근 제어 🚦

### 관리자 라우트 보호 (Administrative Route Protection)
- **엄격한 라우트 가드**: 모든 관리자 경로(`/admin/*`)는 `AdminLayout` 컴포넌트에 의해 보호됩니다.
- **실시간 세션 검증**: 관리자 페이지 마운트 시 Supabase Auth를 통해 실시간 세션 체크를 수행합니다. 인증되지 않은 요청은 즉시 `/admin/login`으로 리다이렉트됩니다.
- **네비게이션 격리**: `AdminLogin` 라우트를 `AdminLayout`에서 완전히 분리하여, 로그인하지 않은 사용자가 관리자 사이드바나 민감한 UI 요소에 절대 접근할 수 없도록 설계했습니다.
- **SPA Fallback 처리**: GitHub Pages 배포 환경에서 서브 도메인(예: `/admin/contents`)으로 직접 접근 시 발생할 수 있는 404 오류를 방지하고 프론트엔드 라우터가 정상 작동하도록 `404.html` 전략을 구현했습니다.

---

## 2. 로그인 보안 강화 (Login Hardening) 🔒

### 무차별 대입 및 계정 열거 방지
- **범용 에러 메시지**: "존재하지 않는 사용자"와 같은 개별 에러 대신, *"이메일 또는 비밀번호가 잘못되었거나 접근 권한이 없습니다"*라는 포괄적인 메시지를 사용하여 해커가 특정 아이디의 존재 여부를 유추(User Enumeration)할 수 없게 차단했습니다.
- **클라이언트 측 속도 제한 (Rate Limiting)**: 로그인 시도 실패 시 버튼을 3초간 비활성화하는 로직을 추가했습니다. 이는 매크로나 위협 스크립트를 통한 무차별 대입 공격(Brute Force)을 UI 레벨에서 1차적으로 방어합니다.
- **입력값 검증**: 네트워크 요청 전 이메일 형식 및 비밀번호 길이에 대한 엄격한 유효성 검사를 수행합니다.

### 보안 지향적 데이터 페칭 (Security-First Data Fetching)
- **비밀글 보호 RPC**: 방명록(`guestbook`) 조회 시 일반 사용자가 네트워크 탭을 통해 비밀글 내용을 훔쳐볼 수 없도록, 데이터베이스 레벨에서 내용을 마스킹하여 반환하는 `get_guestbook_entries` RPC를 적용했습니다.
- **비밀번호 유효성 검사 RPC**: 모든 게시물 삭제 시 비밀번호를 브라우저로 가져오지 않고, 서버 내부에서만 비교하는 `verify_item_password` RPC를 통해 비밀번호 유출을 원천 봉쇄했습니다.
- **관리자 권한 우회**: 관리자 세션이 활성 상태인 경우, 별도의 비밀번호 입력 없이도 RPC 수준에서 삭제 권한을 부여하도록 고도화했습니다.

---

## 3. 데이터베이스 보안 (Row Level Security - RLS) 🗄️

프론트엔드를 우회하거나 API를 직접 호출하는 공격에 대비하여, **PostgreSQL Row Level Security (RLS)**를 통해 데이터베이스 레벨에서 접근을 제어합니다.

### 콘텐츠 관리 보안 (Content Management)
| 테이블명 | 정책명 | 명령어 | 설명 |
| :--- | :--- | :--- | :--- |
| `chat_messages` | `Admin delete chat` | `DELETE` | `admins` 테이블에 등록된 관리자만 삭제 가능. |
| `guestbook` | `Admin delete guestbook` | `DELETE` | `admins` 테이블에 등록된 관리자만 삭제 가능. |
| `posts` | `Admin delete posts` | `DELETE` | `admins` 테이블에 등록된 관리자만 삭제 가능. |
| `game_scores` | `Admin delete scores` | `DELETE` | `admins` 테이블에 등록된 관리자만 삭제 가능. |

### 시스템 및 통계 보안
| 테이블명 | 정책명 | 명령어 | 설명 |
| :--- | :--- | :--- | :--- |
| `visit_logs` | `Admin select` | `SELECT` | 관리자만 방문자 기록 및 IP 로그 조회 가능. |
| `game_play_logs`| `Admin view logs` | `SELECT` | 관리자만 원본 게임 통계 데이터 조회 가능. |
| `site_settings` | `Admin update` | `ALL` | 사이트 프로필/배너 설정 변경은 관리자만 가능. |
| `admins` | `Allow read own` | `SELECT` | 본인의 관리자 권한 여부만 확인할 수 있도록 제한. |

---

## 4. 사용자 관리 및 차단 🚫

### 차단 시스템 (Banning System)
- **IP 및 닉네임 블랙리스트**: 악성 사용자의 IP와 닉네임을 `blocked_users` 테이블에 저장합니다.
- **실시간 차단 체크**: 채팅, 방명록, 커뮤니티 게시글 작성 전 `check_ban_status` RPC 함수를 호출하여 즉각적으로 작성을 차단합니다.

---

## 5. 향후 보안 권장 사항 🚀
- **MFA (2단계 인증)**: 주요 관리자 계정에 대해 Supabase MFA 기능 활성화를 권장합니다.
- **관리자 활동 로그 (Audit Log)**: 어떤 관리자가 언제 게시물을 삭제했는지 기록하는 전용 로그 테이블 구축을 권장합니다.
- **IP 기반 관리자 제한**: 특정 IP 대역에서만 `/admin` 페이지에 접속할 수 있도록 추가 제한 설정을 고려할 수 있습니다.

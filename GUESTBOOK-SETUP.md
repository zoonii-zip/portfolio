# 방명록 연결

현재 DB 테이블·저장 함수 생성과 guestbook Edge Function 배포를 완료했습니다.
TURNSTILE_SECRET_KEY와 ALLOWED_ORIGINS도 서버에 저장했습니다.
사용자 승인 후 함수의 Verify JWT 설정을 해제했습니다.
배포 서버 확인: 익명 목록 GET 200, 검증 없는 등록 POST 400, 다른 출처 요청 403.
실제 Turnstile 성공 토큰을 이용한 글 등록은 아직 검증하지 않았습니다.
GitHub 반영·사이트 배포·실제 방문자 등록 검증은 아직 하지 않았습니다.
기존 GitHub Pages와 메모지 디자인을 유지합니다. 계정 연결 전에는 등록 버튼이 비활성화됩니다.

## 1. Supabase

https://supabase.com/dashboard 에서 계정을 만들고 새 프로젝트를 생성합니다.
프로젝트 이름은 portfolio-guestbook, 리전은 가까운 지역을 선택합니다.
DB 비밀번호와 비밀키는 채팅이나 GitHub에 올리지 않습니다.

SQL Editor에서 supabase/migrations/202610150001_guestbook.sql 전체를 한 번 실행합니다.
테이블 두 개와 서버 전용 등록 함수를 생성하며, 익명·로그인 사용자의 DB 직접 접근을 차단합니다.

## 2. 스팸 방지

https://dash.cloudflare.com/ 의 Turnstile에서 위젯을 만듭니다.
Managed 모드로 만들고 실제 도메인 zoonii.zip을 등록합니다.
www.zoonii.zip도 사용한다면 함께 등록합니다. Cloudflare로 DNS를 이전할 필요는 없습니다.
Site key는 공개 설정값이며 Secret key는 서버에만 저장합니다.

## 3. 서버 배포

Supabase CLI가 있는 환경에서 저장소 루트에서 실행합니다.

```sh
supabase login
supabase link --project-ref PROJECT_REF
supabase functions deploy guestbook --no-verify-jwt
```

Supabase Dashboard의 Edge Functions → Secrets에서 다음 값을 저장합니다.

- ALLOWED_ORIGINS: https://zoonii.zip (여러 출처는 쉼표로 구분하며 끝에 /를 붙이지 않음)
- TURNSTILE_SECRET_KEY: Turnstile의 비밀키
- GUESTBOOK_DB_SECRET: Supabase 프로젝트의 secret API key (sb_secret_로 시작)

SUPABASE_URL은 실행 환경에 자동 제공됩니다. 신규 secret key가 없으면 기존 환경의
SUPABASE_SERVICE_ROLE_KEY를 사용하도록 호환 처리되어 있습니다.
로그인 없는 방명록이라 함수의 JWT 검증을 끄며, 글 등록 때 서버에서 Turnstile을 검증합니다.
CORS만으로 인증을 대신하지 않습니다. 삭제 API는 제공하지 않습니다.

## 4. 화면 연결

사이트 루트 guestbook-config.js에 공개 값 두 개만 입력합니다.

```js
window.ZooniiGuestbookConfig = {
  endpoint: 'https://PROJECT_REF.supabase.co/functions/v1/guestbook',
  turnstileSiteKey: 'YOUR_PUBLIC_SITE_KEY'
};
```

코드를 저장소에 반영하고 기존 사이트 배포 절차로 배포합니다.
생성된 HTML 26개에도 공통 스크립트가 연결되어 있어 직접 주소 및 메뉴 진입 모두 지원합니다.
기준 HTML을 바꾸면 python3 scripts/build-seo.py로 다시 생성합니다.

## 5. 운영 및 실제 연결 검증

- 방문자 A가 작성 → 다른 브라우저 B에서 새로고침 → 같은 글이 보이는지 확인합니다.
- 새로고침 후에도 글이 남고, 종이 종류·닉네임·날짜가 표시되는지 확인합니다.
- 등록 후 60초 이내 재등록이 거절되는지 확인합니다.
- 네트워크 오류 때 작성 내용이 유지되는지 확인합니다.
- DB Table Editor의 guestbook_entries에서 관리자가 글을 삭제합니다.
- 방문자에게는 최신 100개를 표시합니다. 이전 글은 DB에 남습니다.
- 본문은 HTML로 실행하지 않고 텍스트로 표시합니다.
- CAPTCHA를 통과한 요청만 저장하며, 서버가 브라우저 식별자별 60초 간격과 전체 분당 30개 제한을 원자적으로 확인합니다.
- 브라우저 식별자는 로그인 인증이 아닙니다. 저장소 초기화/식별자 변경으로 개별 간격 제한을 우회할 수 있어 CAPTCHA와 전체 제한을 병행합니다.
- IP 주소를 별도로 저장하지 않습니다. 닉네임·글·날짜는 공개됩니다.

## 완료한 검사와 남은 검사

node --test tests/guestbook.test.mjs: 서버 핸들러 테스트 8개 통과.
python3 scripts/verify-seo.py: 26개 경로 검사 통과.
로컬 브라우저에서 연결 전 방명록 UI를 확인했습니다.
테스트는 외부 서비스 응답을 대체한 단위 테스트입니다. 실제 PostgreSQL 마이그레이션,
Turnstile 검증, 배포된 함수와의 저장·불러오기는 계정 생성 후 위 절차로 검증해야 합니다.

공식 문서:
- https://supabase.com/docs/guides/functions/secrets
- https://supabase.com/docs/guides/functions/function-configuration
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

# Web Push 설정 순서

## 1. Supabase SQL 실행
Supabase Dashboard → SQL Editor에서 실행:
```
supabase/push_subscriptions.sql
```

## 2. Edge Function 배포
```bash
npx supabase functions deploy send-push --project-ref vzmdklmwhajbblbcbvvj
```

## 3. Edge Function 환경변수 설정
Supabase Dashboard → Edge Functions → send-push → Secrets:
```
VAPID_PUBLIC_KEY  = BNfloNE5rm0BV7Z7qmsxX5LYhzONXxS2Gy8GsRyHd4L_gWkTb858MObwZwargcLopS3kn5C09Ien9fqlfCyiijQ
VAPID_PRIVATE_KEY = 31Ku7RC5HREyD15rcOSvDJIbDLFBkxEqUfevwf9OLxY
VAPID_SUBJECT     = mailto:msh9176@gmail.com
```
(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY는 자동 주입됨)

## 4. Cron 트리거 설정
Supabase Dashboard → Database → Extensions에서 pg_cron 활성화 후
SQL Editor에서 실행:

```sql
SELECT cron.schedule(
  'send-push-daily',
  '0 9 * * *',  -- 매일 오전 9시 (UTC 기준, 한국은 +9 이므로 오후 6시)
  $$
  SELECT net.http_post(
    url := 'https://vzmdklmwhajbblbcbvvj.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

## 5. 한국 시간 기준 발송 시각 조정
- `0 9 * * *` = UTC 09:00 = KST 18:00 (저녁 6시)
- `0 0 * * *` = UTC 00:00 = KST 09:00 (오전 9시) ← 권장

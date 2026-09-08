-- Peer chat moderation lived only on the device.
--
-- PeerChatPanel refused WhatsApp numbers and masked insults before insert, but
-- the insert policy on `messages` only checked `sender_id = auth.uid()`. Anyone
-- who talked to PostgREST directly could deliver the same text unfiltered — the
-- exact path App Store 1.2 and Play UGC policy expect the server to close.
--
-- The LLM gate stays on the client: a database trigger cannot call it. What
-- lands here is the deterministic half — off-platform contact and masked
-- hostile profanity — so a bypass at least cannot share a phone number or a
-- Venmo handle. Trusted writers (service role, SQL editor) still pass, same as
-- the other guards.

create or replace function public.messages_guard_content()
returns trigger
language plpgsql
as $$
declare
  cleaned text;
begin
  if public.is_trusted_writer() then
    return new;
  end if;

  -- Strip the invisible characters people use to walk past a filter, then
  -- collapse runs of spaces so "w h a t s a p p" still reads as one word.
  cleaned := lower(
    regexp_replace(
      regexp_replace(
        coalesce(new.body, ''),
        E'[\\u200B-\\u200F\\u202A-\\u202E\\u2060-\\u206F\\uFEFF]',
        '',
        'g'
      ),
      '[[:space:]]+',
      ' ',
      'g'
    )
  );
  cleaned := btrim(cleaned);

  if cleaned = '' then
    raise exception 'Message blocked: empty body'
      using errcode = 'P0001';
  end if;

  -- Off-platform contact and pay-outside. Keep payments and chat in the app.
  if cleaned ~*
    '(whats?[[:space:]]*app|wa\.me/|api\.whatsapp\.com|t(ele)?gram|t\.me/|signal\.me|viber|line\.me|wechat|kakao|discord\.gg|pay[[:space:]]*outside|pay[[:space:]]*me[[:space:]]*(outside|directly|cash)|cash[[:space:]]*only|venmo|zelle|cash[[:space:]]*app|cashapp|paypal\.me|pay[[:space:]]*pal\.me|wire[[:space:]]*transfer|bitcoin|btc[[:space:]]*wallet|crypto[[:space:]]*wallet|iban[[:space:]]*[:=]|call[[:space:]]*me[[:space:]]*(on|at)[[:space:]]*\+?[0-9]|text[[:space:]]*me[[:space:]]*(on|at)[[:space:]]*\+?[0-9]|(my|наш|mi)[[:space:]]*(whats?app|telegram|номер|número|number)[[:space:]]*[:：]?[[:space:]]*\+?[0-9]|\+[0-9][0-9[:space:]().-]{8,}[0-9])'
  then
    raise exception 'Message blocked: keep contact and payment inside the app'
      using errcode = 'P0001';
  end if;

  -- Masked hostile profanity (EN / ES / CS / RU). The LLM still catches what
  -- these miss; this stops the obvious bypasses a direct API call would use.
  if cleaned ~*
    '(f+[[:space:].*_[:punct:]]*u+[[:space:].*_[:punct:]]*c+[[:space:].*_[:punct:]]*k+|f[[:space:].*_[:punct:]]*ck|sh[[:space:].*_[:punct:]]*[i1!][[:space:].*_[:punct:]]*t+|b[[:space:].*_[:punct:]]*[i1!][[:space:].*_[:punct:]]*t+[[:space:].*_[:punct:]]*c+[[:space:].*_[:punct:]]*h+|c[[:space:].*_[:punct:]]*u+[[:space:].*_[:punct:]]*n+[[:space:].*_[:punct:]]*t+|n+[[:space:].*_[:punct:]]*[i1!][[:space:].*_[:punct:]]*gg+[[:space:].*_[:punct:]]*[ae3]+r*|p[[:space:].*_[:punct:]]*u+[[:space:].*_[:punct:]]*t+[[:space:].*_[:punct:]]*[ao]|m[[:space:].*_[:punct:]]*[i1!][[:space:].*_[:punct:]]*[e3][[:space:].*_[:punct:]]*r+[[:space:].*_[:punct:]]*d[ao]|j[[:space:].*_[:punct:]]*[e3][[:space:].*_[:punct:]]*b+[[:space:].*_[:punct:]]*[aá]|k[[:space:].*_[:punct:]]*u+[[:space:].*_[:punct:]]*r+[[:space:].*_[:punct:]]*v[ao]|б[[:space:].*_[:punct:]]*л[[:space:].*_[:punct:]]*я[[:space:].*_[:punct:]]*[дт]|х[[:space:].*_[:punct:]]*у[[:space:].*_[:punct:]]*[йи]|п[[:space:].*_[:punct:]]*и[[:space:].*_[:punct:]]*[зд][[:space:].*_[:punct:]]*[ае])'
  then
    raise exception 'Message blocked: hostile language'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists messages_guard_content on public.messages;
create trigger messages_guard_content
  before insert on public.messages
  for each row execute function public.messages_guard_content();

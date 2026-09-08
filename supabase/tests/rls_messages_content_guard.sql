-- Behaviour checks for 060_messages_content_guard.sql.
-- Runs as part of: node ./scripts/check-migrations.mjs

grant usage on schema public to authenticated, anon, service_role;
grant all on all tables in schema public to authenticated, anon, service_role;

insert into auth.users (id) values
  ('a0a0a0a0-0600-4600-8600-a0a0a0a0a060'), -- sender
  ('b0b0b0b0-0600-4600-8600-b0b0b0b0b060'); -- recipient

insert into public.profiles (id) values
  ('a0a0a0a0-0600-4600-8600-a0a0a0a0a060'),
  ('b0b0b0b0-0600-4600-8600-b0b0b0b0b060');

insert into public.listings (id, owner_id, listing_status)
values ('c0c0c0c0-0600-4600-8600-c0c0c0c0c060', 'a0a0a0a0-0600-4600-8600-a0a0a0a0a060', 'active');

-- Ordinary logistics still go through.
do $$
begin
  set local role authenticated;
  set local request.jwt.claim.sub = 'a0a0a0a0-0600-4600-8600-a0a0a0a0a060';

  insert into public.messages (id, listing_id, sender_id, recipient_id, body)
  values (
    'd0d0d0d0-0600-4600-8600-d0d0d0d0d060',
    'c0c0c0c0-0600-4600-8600-c0c0c0c0c060',
    'a0a0a0a0-0600-4600-8600-a0a0a0a0a060',
    'b0b0b0b0-0600-4600-8600-b0b0b0b0b060',
    'I can meet at 5 with the ladder, PIN is on the rental.'
  );
end $$;

-- WhatsApp is refused even when the client never saw the message.
do $$
declare
  blocked boolean := false;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = 'a0a0a0a0-0600-4600-8600-a0a0a0a0a060';

  begin
    insert into public.messages (id, listing_id, sender_id, recipient_id, body)
    values (
      'e0e0e0e0-0600-4600-8600-e0e0e0e0e060',
      'c0c0c0c0-0600-4600-8600-c0c0c0c0c060',
      'a0a0a0a0-0600-4600-8600-a0a0a0a0a060',
      'b0b0b0b0-0600-4600-8600-b0b0b0b0b060',
      'Message me on WhatsApp +14155552671'
    );
  exception
    when others then
      blocked := true;
  end;

  if not blocked then
    raise exception 'off-platform contact was accepted';
  end if;
end $$;

-- Masked hostile language is refused the same way.
do $$
declare
  blocked boolean := false;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = 'a0a0a0a0-0600-4600-8600-a0a0a0a0a060';

  begin
    insert into public.messages (id, listing_id, sender_id, recipient_id, body)
    values (
      'f0f0f0f0-0600-4600-8600-f0f0f0f0f060',
      'c0c0c0c0-0600-4600-8600-c0c0c0c0c060',
      'a0a0a0a0-0600-4600-8600-a0a0a0a0a060',
      'b0b0b0b0-0600-4600-8600-b0b0b0b0b060',
      'f.u.c.k you'
    );
  exception
    when others then
      blocked := true;
  end;

  if not blocked then
    raise exception 'masked hostile language was accepted';
  end if;
end $$;

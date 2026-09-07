-- Behaviour checks for 048_reports_and_blocks.sql.
-- Runs as part of: node ./scripts/check-migrations.mjs

grant usage on schema public to authenticated, anon, service_role;
grant all on all tables in schema public to authenticated, anon, service_role;

insert into auth.users (id) values
  ('33333333-3333-4333-8333-333333333333'),
  ('44444444-4444-4444-8444-444444444444');

insert into public.profiles (id) values
  ('33333333-3333-4333-8333-333333333333'),
  ('44444444-4444-4444-8444-444444444444');

insert into public.listings (id, owner_id, listing_status)
values ('cccccccc-cccc-4ccc-8ccc-ccccccccdddd', '33333333-3333-4333-8333-333333333333', 'active');

do $$
declare
  blocked boolean;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '44444444-4444-4444-8444-444444444444';

  -- A report about the other person goes through.
  insert into public.content_reports (
    id, target_kind, target_id, reported_user_id, reporter_id, reason, details
  ) values (
    '55555555-5555-4555-8555-555555555555',
    'listing',
    'cccccccc-cccc-4ccc-8ccc-ccccccccdddd',
    '33333333-3333-4333-8333-333333333333',
    '44444444-4444-4444-8444-444444444444',
    'scam',
    'Asked me to pay by bank transfer'
  );

  -- Filing under someone else's name is not allowed.
  blocked := false;
  begin
    insert into public.content_reports (id, target_kind, reporter_id, reason)
    values (
      '66666666-6666-4666-8666-666666666666',
      'profile',
      '33333333-3333-4333-8333-333333333333',
      'spam'
    );
  exception when others then
    blocked := true;
  end;
  if not blocked then
    raise exception 'a report could be filed in another user''s name';
  end if;

  -- Reporting yourself is not a thing.
  blocked := false;
  begin
    insert into public.content_reports (id, target_kind, reported_user_id, reporter_id, reason)
    values (
      '77777777-7777-4777-8777-777777777777',
      'profile',
      '44444444-4444-4444-8444-444444444444',
      '44444444-4444-4444-8444-444444444444',
      'spam'
    );
  exception when others then
    blocked := true;
  end;
  if not blocked then
    raise exception 'a user could report themselves';
  end if;

  -- The reporter sees their own report and nothing else.
  if (select count(*) from public.content_reports) <> 1 then
    raise exception 'a reporter should see exactly their own report';
  end if;

  -- Moving a report to "dismissed" is the moderator's call, not the reporter's.
  update public.content_reports
  set status = 'dismissed', moderator_note = 'nothing to see'
  where id = '55555555-5555-4555-8555-555555555555';

  if exists (
    select 1 from public.content_reports
    where id = '55555555-5555-4555-8555-555555555555'
      and (status <> 'new' or moderator_note <> '')
  ) then
    raise exception 'a reporter could close their own report';
  end if;

  reset role;
end $$;

do $$
declare
  blocked boolean;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '44444444-4444-4444-8444-444444444444';

  -- Blocking is per-person and only for yourself.
  insert into public.user_blocks (blocker_id, blocked_id)
  values ('44444444-4444-4444-8444-444444444444', '33333333-3333-4333-8333-333333333333');

  blocked := false;
  begin
    insert into public.user_blocks (blocker_id, blocked_id)
    values ('33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-444444444444');
  exception when others then
    blocked := true;
  end;
  if not blocked then
    raise exception 'a user could block people on someone else''s behalf';
  end if;

  reset role;
end $$;

insert into public.rentals (id, listing_id, owner_id, renter_id, start_date, end_date)
values (
  '88888888-8888-4888-8888-888888888888',
  'cccccccc-cccc-4ccc-8ccc-ccccccccdddd',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  current_date,
  current_date + 1
);

do $$
declare
  blocked boolean;
begin
  -- The blocked person must not be able to write, even calling the API directly.
  set local role authenticated;
  set local request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';

  blocked := false;
  begin
    insert into public.messages (id, rental_id, sender_id, recipient_id, body)
    values (
      '99999999-9999-4999-8999-99999999aaaa',
      '88888888-8888-4888-8888-888888888888',
      '33333333-3333-4333-8333-333333333333',
      '44444444-4444-4444-8444-444444444444',
      'let me back in'
    );
  exception when others then
    blocked := true;
  end;
  if not blocked then
    raise exception 'a blocked user could still send a message';
  end if;

  -- And the person who blocked them cannot keep the thread going either.
  set local request.jwt.claim.sub = '44444444-4444-4444-8444-444444444444';
  blocked := false;
  begin
    insert into public.messages (id, rental_id, sender_id, recipient_id, body)
    values (
      '99999999-9999-4999-8999-99999999bbbb',
      '88888888-8888-4888-8888-888888888888',
      '44444444-4444-4444-8444-444444444444',
      '33333333-3333-4333-8333-333333333333',
      'one more thing'
    );
  exception when others then
    blocked := true;
  end;
  if not blocked then
    raise exception 'a blocked thread stayed writable for the blocker';
  end if;

  reset role;
end $$;

-- Unblocking restores the conversation.
delete from public.user_blocks
where blocker_id = '44444444-4444-4444-8444-444444444444';

do $$
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';

  insert into public.messages (id, rental_id, sender_id, recipient_id, body)
  values (
    '99999999-9999-4999-8999-99999999cccc',
    '88888888-8888-4888-8888-888888888888',
    '33333333-3333-4333-8333-333333333333',
    '44444444-4444-4444-8444-444444444444',
    'sorry about that'
  );

  reset role;
end $$;

select 'rls_reports_blocks: all checks passed' as result;

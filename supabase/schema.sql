create table if not exists public.champion_scores (
  player_id uuid primary key,
  player_name varchar(18) not null,
  score integer not null check (score >= 0 and score <= 50000000),
  correct_answers smallint not null check (correct_answers between 25 and 100),
  level_reached smallint not null check (level_reached between 2 and 4),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard', 'veryHard')),
  time_limit_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists champion_scores_ranking_idx
  on public.champion_scores (score desc, correct_answers desc, updated_at asc);

alter table public.champion_scores enable row level security;

revoke all on table public.champion_scores from anon, authenticated;
grant select, insert, update on table public.champion_scores to service_role;

create or replace function public.submit_champion_score(
  p_player_id uuid,
  p_player_name text,
  p_score integer,
  p_correct_answers smallint,
  p_level_reached smallint,
  p_difficulty text,
  p_time_limit_enabled boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  previous_score integer;
  previous_correct_answers smallint;
  saved_score public.champion_scores;
  score_improved boolean;
begin
  if char_length(trim(p_player_name)) < 1 or char_length(trim(p_player_name)) > 18 then
    raise exception 'invalid player name';
  end if;

  if p_correct_answers < 25 or p_correct_answers > 100 then
    raise exception 'invalid correct answers';
  end if;

  if p_level_reached <> least(4, floor(p_correct_answers::numeric / 25)::integer + 1) then
    raise exception 'invalid level';
  end if;

  select score, correct_answers
    into previous_score, previous_correct_answers
    from public.champion_scores
    where player_id = p_player_id;

  score_improved :=
    previous_score is null
    or p_score > previous_score
    or (p_score = previous_score and p_correct_answers > previous_correct_answers);

  insert into public.champion_scores (
    player_id,
    player_name,
    score,
    correct_answers,
    level_reached,
    difficulty,
    time_limit_enabled
  )
  values (
    p_player_id,
    trim(p_player_name),
    p_score,
    p_correct_answers,
    p_level_reached,
    p_difficulty,
    p_time_limit_enabled
  )
  on conflict (player_id) do update
    set player_name = excluded.player_name,
        score = excluded.score,
        correct_answers = excluded.correct_answers,
        level_reached = excluded.level_reached,
        difficulty = excluded.difficulty,
        time_limit_enabled = excluded.time_limit_enabled,
        updated_at = now()
    where excluded.score > champion_scores.score
       or (
         excluded.score = champion_scores.score
         and excluded.correct_answers > champion_scores.correct_answers
       )
  returning * into saved_score;

  if saved_score.player_id is null then
    select *
      into saved_score
      from public.champion_scores
      where player_id = p_player_id;
  end if;

  return jsonb_build_object(
    'improved', score_improved,
    'score', saved_score.score,
    'correct_answers', saved_score.correct_answers,
    'level_reached', saved_score.level_reached
  );
end;
$$;

revoke all on function public.submit_champion_score(
  uuid,
  text,
  integer,
  smallint,
  smallint,
  text,
  boolean
) from public, anon, authenticated;

grant execute on function public.submit_champion_score(
  uuid,
  text,
  integer,
  smallint,
  smallint,
  text,
  boolean
) to service_role;

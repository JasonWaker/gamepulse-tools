-- GamePulse Tools v0.1.0. Apply only to a new dedicated Supabase project.
-- This schema is not applied to any existing production database.
create table public.games (
 id text primary key, slug text unique not null, name text not null,
 short_description text not null, developer text, publisher text,
 platforms text[] not null default '{}', release_date date, status text not null,
 official_url text, steam_app_id bigint, roblox_universe_id bigint, roblox_place_id bigint,
 trend_score numeric check (trend_score between 0 and 100),
 opportunity_score numeric check (opportunity_score between 0 and 100),
 growth_status text, discovery_source text, priority integer default 0,
 theme_json jsonb not null default '{}', media_sources_json jsonb not null default '{}', published boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.tools (
 id text primary key, game_id text not null references public.games(id) on delete cascade,
 slug text not null, name text not null, tool_type text not null, short_description text,
 status text not null default 'draft', version text not null, config_json jsonb not null default '{}',
 is_featured boolean not null default false, popularity_score numeric,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(game_id,slug)
);
create table public.game_media (
 id text primary key, game_id text not null references public.games(id) on delete cascade,
 type text not null check(type in ('logo','hero','screenshot','thumbnail','video','icon','background','character','weapon','item')),
 source_type text not null check(source_type in ('press_kit','official_site','steam','roblox_api','youtube','publisher','manual')),
 source_owner text not null, source_url text not null, external_url text, storage_path text,
 rights_status text not null default 'review_required' check(rights_status in ('approved','embed_only','review_required','rejected')),
 license_note text not null, usage_rights text, attribution_text text, width integer, height integer,
 aspect_ratio text, is_primary boolean default false, display_order integer default 0,
 video_id text, channel_name text, is_official boolean default false, fetched_at timestamptz,
 verified_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.game_entities (
 id text primary key, game_id text not null references public.games(id) on delete cascade,
 entity_type text not null, slug text not null, name text not null,
 image_media_id text references public.game_media(id) on delete set null,
 data_json jsonb not null default '{}', source_url text not null,
 verified_at timestamptz not null, game_version text not null,
 published boolean not null default false, content_complete boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(game_id,entity_type,slug)
);
create table public.game_updates (
 id text primary key, game_id text not null references public.games(id) on delete cascade,
 version text not null, title text not null, summary text, source_url text not null,
 published_at timestamptz, data_changes_json jsonb not null default '{}'
);
create table public.tool_events (
 id uuid primary key default gen_random_uuid(), tool_id text not null references public.tools(id) on delete cascade,
 event_type text not null check(event_type in ('tool_view','tool_start','tool_complete','tool_share','entity_view')),
 session_id uuid not null, metadata jsonb not null default '{}', created_at timestamptz not null default now()
);
create index tools_game_status on public.tools(game_id,status);
create index media_game_rights on public.game_media(game_id,rights_status);
create index entities_game_type on public.game_entities(game_id,entity_type);
create index updates_game_date on public.game_updates(game_id,published_at desc);
create index events_tool_date on public.tool_events(tool_id,created_at desc);
alter table public.games enable row level security;
alter table public.tools enable row level security;
alter table public.game_media enable row level security;
alter table public.game_entities enable row level security;
alter table public.game_updates enable row level security;
alter table public.tool_events enable row level security;
grant select on public.games,public.tools,public.game_media,public.game_entities,public.game_updates to anon,authenticated;
revoke all on public.tool_events from anon,authenticated;
create policy games_public on public.games for select to anon,authenticated using(published);
create policy tools_public on public.tools for select to anon,authenticated using(status='published' and exists(select 1 from public.games where id=game_id and published));
create policy media_public on public.game_media for select to anon,authenticated using(rights_status in ('approved','embed_only') and exists(select 1 from public.games where id=game_id and published));
create policy entities_public on public.game_entities for select to anon,authenticated using(published and exists(select 1 from public.games where id=game_id and published));
create policy updates_public on public.game_updates for select to anon,authenticated using(published_at is not null and published_at<=now() and exists(select 1 from public.games where id=game_id and published));
-- No client write policies. Future authenticated CMS must use app_metadata role checks.
-- No public event inserts: use a rate-limited, validated ingestion endpoint later.

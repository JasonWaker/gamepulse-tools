import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
test("schema executes; RLS hides drafts and unapproved media, blocks public mutations and events", async () => {
  const db = new PGlite();
  await db.exec("create role anon; create role authenticated;");
  await db.exec(readFileSync("supabase/schema.sql", "utf8"));
  await db.exec(readFileSync("supabase/seed.sql", "utf8"));
  await db.exec(
    "insert into games(id,slug,name,short_description,status,published) values('hidden','hidden','Hidden','Draft','draft',false)",
  );
  const tables = await db.query<{ relrowsecurity: boolean }>(
    "select relrowsecurity from pg_class where relname in ('games','tools','game_media','game_entities','game_updates','tool_events')",
  );
  assert.equal(tables.rows.length, 6);
  assert.ok(tables.rows.every((r) => r.relrowsecurity));
  await db.exec("set role anon");
  assert.equal((await db.query("select * from games")).rows.length, 3);
  assert.equal((await db.query("select * from tools")).rows.length, 5);
  assert.equal((await db.query("select * from game_media")).rows.length, 3);
  assert.equal((await db.query("select * from game_entities")).rows.length, 8);
  await assert.rejects(() => db.exec("update games set name='hacked'"));
  await assert.rejects(() => db.query("select * from tool_events"));
  await db.exec("reset role");
  await db.close();
});

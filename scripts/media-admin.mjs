import http from "node:http";
import { readFile, writeFile } from "node:fs/promises";
const port = 3101;
const file = new URL("../src/data/media-decisions.json", import.meta.url);
const sources = [
  {
    id: "wardogs-official-gallery",
    game: "WARDOGS",
    source: "https://bulkhead.com/games/wardogs/",
  },
  {
    id: "aniimo-official-gallery",
    game: "Aniimo",
    source: "https://aniimo.com/main",
  },
];
const page = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Media review · local development only</title><style>body{background:#0c1118;color:#ddd;font:15px system-ui;max-width:950px;margin:50px auto;padding:20px}article{border:1px solid #334;padding:24px;margin:20px 0;border-radius:12px}a{color:#ff9856}button,input,select{padding:12px;margin:8px 8px 8px 0;background:#202933;color:white;border:1px solid #556;border-radius:6px}input{min-width:300px}p{color:#9da9b5}</style><h1>Media rights review</h1><p>Local development only. Changes update the repository rights register; rebuild to publish. No remote image is requested in this review screen. Approval requires a license note.</p><div id="items"></div><p role="status" id="status"></p><script>
const sources=${JSON.stringify(sources)};
async function render(){const r=await fetch('/api/media');const data=await r.json();document.querySelector('#items').replaceChildren();for(const m of sources){const el=document.createElement('article');const title=document.createElement('h2');title.textContent=m.game+' · Hero';el.append(title);const a=document.createElement('a');a.href=m.source;a.textContent='Open official source ↗';a.target='_blank';a.rel='noreferrer';el.append(a);const p=document.createElement('p');p.textContent='Current: '+(data[m.id]?.rights_status||'review_required')+' · Preview withheld until approved';el.append(p);const input=document.createElement('input');input.placeholder='License / approval evidence';input.setAttribute('aria-label','License note for '+m.game);input.value=data[m.id]?.license_note||'';el.append(input);for(const [label,rights] of [['Approve','approved'],['Embed Only','embed_only'],['Reject','rejected']]){const b=document.createElement('button');b.textContent=label;b.onclick=async()=>{const r=await fetch('/api/media',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:m.id,rights_status:rights,license_note:input.value})});const result=await r.json();document.querySelector('#status').textContent=result.message;if(r.ok)render();};el.append(b);}document.querySelector('#items').append(el);}}render();</script></html>`;
http
  .createServer(async (req, res) => {
    const host = req.headers.host;
    if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) {
      res.writeHead(403).end();
      return;
    }
    res.setHeader("Cache-Control", "no-store");
    if (req.url === "/admin/media" && req.method === "GET") {
      res.setHeader("Content-Type", "text/html");
      res.end(page);
      return;
    }
    if (req.url !== "/api/media") {
      res.writeHead(404).end();
      return;
    }
    res.setHeader("Content-Type", "application/json");
    if (req.method === "GET") {
      res.end(await readFile(file, "utf8"));
      return;
    }
    if (req.method === "POST") {
      if (
        ![`http://localhost:${port}`, `http://127.0.0.1:${port}`].includes(
          req.headers.origin,
        )
      ) {
        res
          .writeHead(403)
          .end(JSON.stringify({ message: "Local origin required" }));
        return;
      }
      let body = "";
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 16000) {
          res.writeHead(413).end();
          return;
        }
      }
      try {
        const d = JSON.parse(body);
        if (
          !sources.some((m) => m.id === d.id) ||
          !["approved", "embed_only", "rejected"].includes(d.rights_status) ||
          typeof d.license_note !== "string" ||
          d.license_note.trim().length < 12
        )
          throw Error(
            "Add a meaningful license or rejection note (at least 12 characters).",
          );
        const saved = JSON.parse(await readFile(file, "utf8"));
        saved[d.id] = {
          rights_status: d.rights_status,
          license_note: d.license_note.slice(0, 2000),
          verified_at: new Date().toISOString(),
        };
        await writeFile(file, JSON.stringify(saved, null, 2) + "\n");
        res.end(
          JSON.stringify({
            message: "Saved to the repository. Rebuild to publish.",
          }),
        );
      } catch (e) {
        res.writeHead(400).end(JSON.stringify({ message: e.message }));
      }
      return;
    }
    res.writeHead(405).end();
  })
  .listen(port, "127.0.0.1", () =>
    console.log(
      `Development media review: http://127.0.0.1:${port}/admin/media`,
    ),
  );

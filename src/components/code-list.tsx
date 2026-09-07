"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { GameCode } from "@/lib/codes";
export function CodeList({ codes }: { codes: GameCode[] }) {
  const [copied, setCopied] = useState("");
  const [notice, setNotice] = useState("");
  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setNotice(`${code} copied. Open the game to try redeeming it.`);
    } catch {
      setNotice(
        "Clipboard unavailable. Select the code text and copy it manually.",
      );
    }
  };
  return (
    <>
      <div className="source-summary">
        <strong>Listed by the developer, not redemption-tested</strong>
        <p>
          These codes appeared in the official experience description when
          checked. Expiration dates and redemption steps were not supplied by
          the source. Copy the exact spelling; an expired or previously redeemed
          code may fail.
        </p>
        <a href={codes[0].source_url}>Read the official source ↗</a> · Checked{" "}
        {codes[0].checked_at}
      </div>
      <div className="code-grid">
        {codes.map((c) => (
          <article className="code-card" key={c.code}>
            <small>OFFICIALLY LISTED</small>
            <code>{c.code}</code>
            <p>{c.reward}</p>
            <small>Expiration unknown · Checked {c.checked_at}</small>
            <button className="button primary" onClick={() => copy(c.code)}>
              {copied === c.code ? <Check size={16} /> : <Copy size={16} />}{" "}
              {copied === c.code ? "Copied" : "Copy code"}
            </button>
          </article>
        ))}
      </div>
      <p role="status">{notice}</p>
    </>
  );
}

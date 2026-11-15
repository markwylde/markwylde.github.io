import { useEffect, useState } from "react";
import { BASE_CSS } from "../bulletin/bits";

const BASE = "/bulletin-part-2/after";

type Shot = { file: string; title: string; phone?: boolean };

const TABS: { id: string; label: string; shots: Shot[] }[] = [
  {
    id: "forum",
    label: "Forum",
    shots: [
      { file: "index-desktop", title: "Board index" },
      { file: "index-desktop-dark", title: "Board index, dark" },
      { file: "forum-desktop", title: "A forum" },
      { file: "topic-desktop", title: "A topic" },
      { file: "topic-desktop-dark", title: "A topic, dark" },
      { file: "profile-desktop", title: "Member profile" },
      { file: "account-desktop", title: "Account settings" },
      { file: "conversations-desktop", title: "Conversations" },
      { file: "conversation-desktop", title: "A conversation" },
      { file: "moderation-queue-desktop", title: "Moderation queue" },
      { file: "lounge-index-desktop", title: "The Lounge theme (cards)" },
    ],
  },
  {
    id: "staff",
    label: "Staff console",
    shots: [
      { file: "staff-dashboard-desktop", title: "Dashboard" },
      { file: "staff-dashboard-desktop-dark", title: "Dashboard, dark" },
      { file: "staff-forums-desktop", title: "Forums" },
      { file: "staff-permissions-desktop", title: "Permission masks" },
      { file: "staff-group-settings-desktop", title: "Group settings" },
      {
        file: "staff-board-settings-savebar-desktop",
        title: "Board settings with unsaved changes",
      },
      {
        file: "staff-board-settings-savebar-desktop-dark",
        title: "Board settings, dark",
      },
    ],
  },
  {
    id: "phone",
    label: "At 360 px",
    shots: [
      { file: "index-mobile360", title: "Board index", phone: true },
      { file: "forum-mobile360", title: "A forum", phone: true },
      { file: "topic-mobile360", title: "A topic", phone: true },
      {
        file: "account-mobile360-dark",
        title: "Account, dark",
        phone: true,
      },
      {
        file: "lounge-index-mobile360",
        title: "The Lounge theme",
        phone: true,
      },
      {
        file: "staff-dashboard-mobile360",
        title: "Staff dashboard",
        phone: true,
      },
      {
        file: "staff-group-settings-mobile360",
        title: "Staff group settings",
        phone: true,
      },
    ],
  },
];

const CSS = `
.b2-ag{display:flex;flex-direction:column;gap:12px}
.b2-ag .tabs{display:inline-flex;align-self:flex-start;border:1px solid var(--line);border-radius:8px;overflow:hidden}
.b2-ag .tabs button{font:inherit;font-size:.82rem;padding:6px 12px;border:0;background:var(--btn-bg);color:var(--fg);cursor:pointer}
.b2-ag .tabs button+button{border-left:1px solid var(--line)}
.b2-ag .tabs button[aria-pressed="true"]{background:var(--fg-strong);color:var(--btn-bg)}
.b2-ag .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:12px}
.b2-ag .grid.phone{grid-template-columns:repeat(auto-fill,minmax(8.5rem,1fr))}
.b2-ag figure{display:flex;flex-direction:column;gap:6px}
.b2-ag .thumb{display:block;padding:0;border:1px solid var(--line);border-radius:8px;overflow:hidden;cursor:zoom-in;background:var(--btn-bg)}
.b2-ag .thumb img{display:block;margin:0;border:0;border-radius:0;width:100%;height:auto;aspect-ratio:16/10;object-fit:cover;object-position:top}
.b2-ag .phone .thumb img{aspect-ratio:360/780}
.b2-ag figcaption{font-size:.76rem;color:var(--muted)}
.b2-ag .lb{position:fixed;inset:0;border:0;font:inherit;width:100%;z-index:1000;background:rgba(0,0,0,.86);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:16px;cursor:zoom-out}
.b2-ag .lb img{max-width:100%;max-height:calc(100vh - 80px);border-radius:6px}
.b2-ag .lb p{color:#eee;font-size:.85rem}
`;

export default function AfterGallery() {
  const [tab, setTab] = useState(TABS[0]);
  const [open, setOpen] = useState<Shot | null>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="demo bl-x b2-ag">
      <style>{BASE_CSS + CSS}</style>
      <div className="tabs">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.id}
            aria-pressed={t.id === tab.id}
            onClick={() => setTab(t)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={`grid${tab.id === "phone" ? " phone" : ""}`}>
        {tab.shots.map((s) => (
          <figure key={s.file}>
            <button
              type="button"
              className="thumb"
              onClick={() => setOpen(s)}
              aria-label={`Open ${s.title}`}
            >
              <img src={`${BASE}/${s.file}.png`} alt={s.title} loading="lazy" />
            </button>
            <figcaption>{s.title}</figcaption>
          </figure>
        ))}
      </div>
      {open && (
        <button type="button" className="lb" onClick={() => setOpen(null)}>
          <img src={`${BASE}/${open.file}.png`} alt={open.title} />
          <p>{open.title} · click or press Escape to close</p>
        </button>
      )}
    </div>
  );
}

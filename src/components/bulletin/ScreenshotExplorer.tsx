import { useCallback, useEffect, useState } from "react";
import { BASE_CSS } from "./bits";

type Shot = { file: string; title: string; note?: string };
type Tab = { id: string; label: string; intro: string; shots: Shot[] };

const BASE = "/bulletin-part-1/shots";

const TABS: Tab[] = [
  {
    id: "user",
    label: "Forum",
    intro:
      "The member-facing site, rendered by the default Liquid theme. Desktop at 1440 px, captured at 2x.",
    shots: [
      { file: "user/01-home-guest", title: "Home, as a guest" },
      { file: "user/02-home-member", title: "Home, signed in" },
      {
        file: "user/03-home-member-full",
        title: "Home, full page",
        note: "Board statistics, who's online, then the forum list.",
      },
      {
        file: "user/04-forum",
        title: "A password-protected forum",
        note: "The unlock form is part of the permission system, not a separate feature.",
      },
      { file: "user/05-topic", title: "A topic" },
      {
        file: "user/06-topic-full",
        title: "A long topic, full page",
        note: "Cropped at 16,000 px. Reactions, tips, quotes and the reply editor.",
      },
      { file: "user/07-profile", title: "Member profile" },
      { file: "user/08-members", title: "Member list with filters" },
      { file: "user/09-online", title: "Who's online" },
      { file: "user/10-leaderboards", title: "Leaderboards" },
      { file: "user/11-search", title: "Search" },
      { file: "user/12-new-content", title: "New content" },
      { file: "user/13-conversations", title: "Conversations" },
      { file: "user/14-conversation", title: "A conversation" },
      { file: "user/15-account", title: "Account settings" },
      { file: "user/16-account-profile", title: "Edit profile" },
      { file: "user/17-account-notifications", title: "Notifications" },
      {
        file: "user/18-account-notifications-preferences",
        title: "Notification preferences",
      },
      { file: "user/19-account-api-keys", title: "Personal API keys" },
      {
        file: "user/20-account-privacy",
        title: "Privacy: export and erase",
      },
      { file: "user/21-account-follows", title: "Follows" },
      { file: "user/22-account-attachments", title: "My attachments" },
      { file: "user/23-privacy", title: "Privacy policy" },
      { file: "user/24-api-docs", title: "Public API docs" },
      {
        file: "user/30-moderation-queue",
        title: "Moderation queue (front end)",
      },
      { file: "user/31-moderation-reports", title: "Reports" },
      { file: "user/32-moderation-log", title: "Moderation log" },
    ],
  },
  {
    id: "staff",
    label: "Staff console",
    intro:
      "The admin and moderator app, a separate Vite + React SPA on its own origin. Every link in its sidebar.",
    shots: [
      { file: "staff/01-dashboard", title: "Dashboard" },
      { file: "staff/02-moderation", title: "Moderation queue" },
      { file: "staff/03-moderation-bans", title: "Bans and IP tools" },
      { file: "staff/04-moderation-warnings", title: "Warnings" },
      { file: "staff/05-moderation-multimod", title: "Multi-moderation" },
      { file: "staff/06-moderation-log", title: "Moderation log" },
      { file: "staff/07-log", title: "Admin log" },
      {
        file: "staff/08-system-health",
        title: "System health",
        note: "Services, queues, cache hit rate and DB connections. From operations-observability.",
      },
      {
        file: "staff/09-system-missing-objects",
        title: "Missing files after a restore",
      },
      { file: "staff/10-system-dead-letters", title: "Dead letters" },
      { file: "staff/11-settings-board", title: "Board settings" },
      { file: "staff/12-privacy-retention", title: "Data retention" },
      { file: "staff/13-privacy-policy", title: "Privacy policy editor" },
      { file: "staff/14-privacy-requests", title: "Data requests" },
      { file: "staff/15-privacy-access-log", title: "PII access log" },
      { file: "staff/16-settings-filters", title: "Content filters" },
      { file: "staff/17-settings-emoticons", title: "Emoticon sets" },
      { file: "staff/18-flags", title: "Feature flags" },
      { file: "staff/19-settings-webhooks", title: "Webhooks" },
      { file: "staff/20-settings-api-keys", title: "Integration API keys" },
      { file: "staff/21-settings-strings", title: "String overrides" },
      { file: "staff/22-groups", title: "Groups" },
      {
        file: "staff/23-groups-settings",
        title: "Group settings matrix",
        note: "84 group-setting keys, edited per group.",
      },
      { file: "staff/24-permissions", title: "Permission masks" },
      { file: "staff/25-forums", title: "Forum tree" },
      { file: "staff/26-forums-prefixes", title: "Topic prefixes" },
      { file: "staff/27-announcements", title: "Announcements" },
      { file: "staff/28-members-groups", title: "Member groups" },
      { file: "staff/29-members-reputation", title: "Member reputation" },
      { file: "staff/30-members-profiles", title: "Member profiles" },
      { file: "staff/31-ranks", title: "Ranks" },
      { file: "staff/32-badges", title: "Badges" },
      {
        file: "staff/33-members-profile-fields",
        title: "Custom profile fields",
      },
      { file: "staff/34-moderators", title: "Moderator assignments" },
      { file: "staff/35-reactions", title: "Reactions" },
      {
        file: "staff/36-plugins",
        title: "Plugins",
        note: "Two sample plugins. Installing new ones from the marketplace isn't wired up (see the review).",
      },
      { file: "staff/37-themes", title: "Themes" },
      { file: "staff/38-promotions", title: "Auto-promotion rules" },
    ],
  },
  {
    id: "mobile",
    label: "Mobile",
    intro: "The same forum at 390 px, captured at 3x.",
    shots: [
      { file: "mobile/01-home", title: "Home" },
      { file: "mobile/02-topic", title: "Topic" },
      { file: "mobile/03-profile", title: "Profile" },
      { file: "mobile/04-conversation", title: "Conversation" },
    ],
  },
  {
    id: "i18n",
    label: "Languages & feeds",
    intro:
      "Every string goes through the i18n catalog: 2,294 keys in each of English, Spanish and French.",
    shots: [
      { file: "user/33-home-es", title: "Home in Spanish" },
      {
        file: "user/34-topic-fr",
        title: "A French topic",
        note: "The seed data has members writing in Spanish and French too.",
      },
      { file: "user/40-feed-rss", title: "The RSS feed, raw" },
    ],
  },
];

const CSS = `
.bl-se{display:flex;flex-direction:column;gap:12px}
.bl-se .tabs{display:flex;flex-wrap:wrap;gap:6px}
.bl-se .tabs button{font:inherit;font-size:.84rem;padding:6px 12px;border-radius:999px;border:1px solid var(--line);background:var(--btn-bg);color:var(--fg);cursor:pointer}
.bl-se .tabs button[aria-selected="true"]{border-color:var(--fg-strong);color:var(--fg-strong);font-weight:600}
.bl-se .tabs .count{color:var(--muted);font-weight:400;margin-left:4px}
.bl-se .intro{margin:0;font-size:.88rem;color:var(--muted)}
.bl-se .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}
.bl-se .grid.mobile{grid-template-columns:repeat(auto-fill,minmax(110px,1fr))}
.bl-se .thumb{display:flex;flex-direction:column;gap:5px;background:none;border:none;padding:0;cursor:zoom-in;font:inherit;color:var(--fg);text-align:left}
.bl-se .thumb img{width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top;border-radius:6px;border:1px solid var(--line);background:#fff;display:block}
.bl-se .grid.mobile .thumb img{aspect-ratio:390/844}
.bl-se .thumb span{font-size:.74rem;line-height:1.3;color:var(--muted)}
.bl-se .thumb:hover img,.bl-se .thumb:focus-visible img{border-color:var(--fg-strong)}
.bl-lb{position:fixed;inset:0;z-index:100000;background:rgba(8,10,14,.92);display:flex;flex-direction:column}
.bl-lb .bar{display:flex;align-items:center;gap:10px;padding:10px 14px;color:#e7eaf5;font-size:.85rem}
.bl-lb .bar .t{flex:1;min-width:0}
.bl-lb .bar .t b{display:block;font-size:.95rem}
.bl-lb .bar .t small{color:#9aa0b6}
.bl-lb .bar button,.bl-lb .bar a{font:inherit;font-size:.82rem;color:#e7eaf5;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:8px;padding:6px 10px;cursor:pointer;text-decoration:none;white-space:nowrap}
.bl-lb .stage{flex:1;overflow:auto;display:flex;justify-content:center;align-items:flex-start;padding:0 12px 16px}
.bl-lb .stage img{max-width:100%;height:auto;border-radius:6px;background:#fff}
.bl-lb .stage.fit img{max-height:calc(100vh - 80px);width:auto}
`;

export default function ScreenshotExplorer() {
  const [tab, setTab] = useState("user");
  const [open, setOpen] = useState<number | null>(null);
  const [fit, setFit] = useState(true);
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];
  const shot = open === null ? null : current.shots[open];

  const step = useCallback(
    (d: number) =>
      setOpen((i) =>
        i === null ? i : (i + d + current.shots.length) % current.shots.length,
      ),
    [current.shots.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, step]);

  return (
    <div className="demo bl-x bl-se">
      <style>{BASE_CSS + CSS}</style>
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === tab}
            onClick={() => {
              setTab(t.id);
              setOpen(null);
            }}
          >
            {t.label}
            <span className="count">{t.shots.length}</span>
          </button>
        ))}
      </div>
      <p className="intro">
        {current.intro} Click any screenshot to open it full size; arrow keys
        move between them.
      </p>
      <div className={`grid${tab === "mobile" ? " mobile" : ""}`}>
        {current.shots.map((s, i) => (
          <button
            key={s.file}
            type="button"
            className="thumb"
            onClick={() => {
              setFit(!s.file.includes("full"));
              setOpen(i);
            }}
          >
            <img
              src={`${BASE}/thumbs/${s.file}.webp`}
              alt={s.title}
              loading="lazy"
            />
            <span>{s.title}</span>
          </button>
        ))}
      </div>
      {shot && open !== null && (
        <div
          className="bl-lb"
          role="dialog"
          aria-modal="true"
          aria-label={shot.title}
        >
          <div className="bar">
            <div className="t">
              <b>{shot.title}</b>
              <small>
                {open + 1} of {current.shots.length}
                {shot.note ? ` · ${shot.note}` : ""}
              </small>
            </div>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous"
            >
              ←
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next">
              →
            </button>
            <button type="button" onClick={() => setFit((f) => !f)}>
              {fit ? "Actual size" : "Fit"}
            </button>
            <a
              href={`${BASE}/${shot.file}.webp`}
              target="_blank"
              rel="noreferrer"
            >
              Open
            </a>
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          {/* biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: backdrop click; Escape closes via the window listener */}
          <div
            className={`stage${fit ? " fit" : ""}`}
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(null);
            }}
          >
            <img src={`${BASE}/${shot.file}.webp`} alt={shot.title} />
          </div>
        </div>
      )}
    </div>
  );
}

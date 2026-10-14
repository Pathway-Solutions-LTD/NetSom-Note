import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Note,
  createNote,
  deleteNote,
  listNotes,
  saveNote,
  setPinned,
} from "./db";
import RichEditor, { textOf } from "./RichEditor";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

type ThemeMode = "auto" | "light" | "dark";
const ACCENTS: Record<string, string> = {
  Blue: "#3b82f6",
  Purple: "#8b5cf6",
  Pink: "#ec4899",
  Orange: "#f97316",
  Green: "#22c55e",
  Teal: "#14b8a6",
};

function loadPref<T extends string>(key: string, fallback: T): T {
  try {
    return (localStorage.getItem(key) as T) || fallback;
  } catch {
    return fallback;
  }
}
function savePref(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function formatDate(ms: number) {
  const d = new Date(ms);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function sortNotes(notes: Note[]) {
  return [...notes].sort(
    (a, b) => b.pinned - a.pinned || b.updated_at - a.updated_at,
  );
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mode, setMode] = useState<ThemeMode>(() => loadPref("theme", "auto"));
  const [accent, setAccent] = useState(() => loadPref<string>("accent", "Blue"));
  const [sidebarHidden, setSidebarHidden] = useState(
    () => loadPref<string>("sidebarHidden", "0") === "1",
  );
  const [showSettings, setShowSettings] = useState(false);
  const saveTimer = useRef<number | undefined>(undefined);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = mode === "dark" || (mode === "auto" && mq.matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [mode]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--accent",
      ACCENTS[accent] ?? ACCENTS.Blue,
    );
  }, [accent]);

  useEffect(() => {
    listNotes()
      .then((rows) => {
        setNotes(rows);
        if (rows.length) setSelectedId(rows[0].id);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const selected = notes.find((n) => n.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || textOf(n.body).toLowerCase().includes(q),
    );
  }, [notes, query]);

  const toggleSidebar = useCallback(() => {
    setSidebarHidden((h) => {
      savePref("sidebarHidden", h ? "0" : "1");
      return !h;
    });
  }, []);

  const addNote = useCallback(async () => {
    try {
      const note = await createNote();
      setNotes((prev) => sortNotes([note, ...prev]));
      setSelectedId(note.id);
      setQuery("");
      setConfirmDelete(false);
      setTimeout(() => titleRef.current?.focus(), 0);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  // "New Note" from the tray / menu bar icon.
  useEffect(() => {
    // From the tray: jump straight into a fresh note with the list tucked away.
    const un = listen("new-note", () => {
      setSidebarHidden(true);
      addNote();
    });
    return () => {
      un.then((f) => f());
    };
  }, [addNote]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        addNote();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addNote, toggleSidebar]);

  function edit(patch: Partial<Pick<Note, "title" | "body">>) {
    if (!selected) return;
    const next = { ...selected, ...patch };
    setNotes((prev) => prev.map((n) => (n.id === next.id ? next : n)));
    setSaving(true);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      try {
        const updated = await saveNote(next.id, next.title, next.body);
        setNotes((prev) =>
          sortNotes(
            prev.map((n) =>
              n.id === next.id ? { ...n, updated_at: updated } : n,
            ),
          ),
        );
      } catch (e) {
        setError(String(e));
      } finally {
        setSaving(false);
      }
    }, 400);
  }

  async function togglePin() {
    if (!selected) return;
    const pinned = selected.pinned ? 0 : 1;
    await setPinned(selected.id, !!pinned);
    setNotes((prev) =>
      sortNotes(prev.map((n) => (n.id === selected.id ? { ...n, pinned } : n))),
    );
  }

  async function removeNote() {
    if (!selected) return;
    window.clearTimeout(saveTimer.current);
    setSaving(false);
    await deleteNote(selected.id);
    const rest = notes.filter((n) => n.id !== selected.id);
    setNotes(rest);
    setSelectedId(rest.length ? rest[0].id : null);
    setConfirmDelete(false);
  }

  const selectedText = selected ? textOf(selected.body) : "";
  const words = selectedText ? selectedText.split(/\s+/).length : 0;

  return (
    <div className="app">
      {!sidebarHidden && (
      <aside className="sidebar">
        <header className="brand">
          <img src="/logo-rounded.png" alt="" className="brand-logo" />
          <span>NetSom Note</span>
          <button
            className="gear"
            title="Appearance"
            onClick={() => setShowSettings((v) => !v)}
          >
            ⚙︎
          </button>
          {showSettings && (
            <div className="settings">
              <div className="label">Theme</div>
              <div className="segmented">
                {(["auto", "light", "dark"] as ThemeMode[]).map((m) => (
                  <button
                    key={m}
                    className={m === mode ? "on" : ""}
                    onClick={() => {
                      setMode(m);
                      savePref("theme", m);
                    }}
                  >
                    {m[0].toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
              <div className="label">Accent color</div>
              <div className="accents">
                {Object.entries(ACCENTS).map(([name, c]) => (
                  <button
                    key={name}
                    title={name}
                    className={"swatch big" + (name === accent ? " sel" : "")}
                    style={{ background: c }}
                    onClick={() => {
                      setAccent(name);
                      savePref("accent", name);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </header>
        <div className="toolbar">
          <input
            className="search"
            type="search"
            placeholder="Search notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn primary" onClick={addNote} title="New note (Ctrl/⌘+N)">
            + New
          </button>
        </div>
        <ul className="note-list">
          {loading && <li className="hint">Loading…</li>}
          {!loading && filtered.length === 0 && (
            <li className="hint">
              {query ? "No notes match your search." : "No notes yet."}
            </li>
          )}
          {filtered.map((n) => (
            <li key={n.id}>
              <button
                className={"note-item" + (n.id === selectedId ? " active" : "")}
                onClick={() => {
                  setSelectedId(n.id);
                  setConfirmDelete(false);
                }}
              >
                <div className="note-title">
                  {n.pinned ? "📌 " : ""}
                  {n.title.trim() || "Untitled"}
                </div>
                <div className="note-meta">
                  <span>{formatDate(n.updated_at)}</span>
                  <span className="snippet">
                    {textOf(n.body).slice(0, 60) || "No content"}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
        <footer className="status">
          {notes.length} {notes.length === 1 ? "note" : "notes"} · stored on this device
          <div className="powered">Powered by Pathway Solutions</div>
        </footer>
      </aside>
      )}

      <section className="editor">
        {error && (
          <div className="error" onClick={() => setError("")}>
            {error} (click to dismiss)
          </div>
        )}
        {selected ? (
          <>
            <div className="editor-bar">
              <button
                className="btn"
                onClick={toggleSidebar}
                title="Show / hide all notes (Ctrl/⌘+\\)"
              >
                {sidebarHidden ? "☰ All notes" : "◧ Hide list"}
              </button>
              <span className="saved">
                {saving ? "Saving…" : "Saved"} · {words}{" "}
                {words === 1 ? "word" : "words"}
              </span>
              <div className="actions">
                <button className="btn" onClick={togglePin}>
                  {selected.pinned ? "Unpin" : "Pin"}
                </button>
                {confirmDelete ? (
                  <>
                    <button className="btn danger" onClick={removeNote}>
                      Confirm delete
                    </button>
                    <button className="btn" onClick={() => setConfirmDelete(false)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="btn" onClick={() => setConfirmDelete(true)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
            <input
              ref={titleRef}
              className="title-input"
              placeholder="Title"
              value={selected.title}
              onChange={(e) => edit({ title: e.target.value })}
            />
            <RichEditor
              noteId={selected.id}
              html={selected.body}
              onChange={(body) => edit({ body })}
            />
          </>
        ) : (
          <div className="empty">
            {sidebarHidden && (
              <button className="btn show-list" onClick={toggleSidebar}>
                ☰ All notes
              </button>
            )}
            <img src="/logo-rounded.png" alt="" />
            <h2>Welcome to NetSom Note</h2>
            <p>Your notes are saved privately on this device and work offline.</p>
            <button className="btn primary" onClick={addNote}>
              + Create your first note
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;

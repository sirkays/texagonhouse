// useTabs.ts
//
// Tab state for the IDE. Replaces the previous per-language buffer model
// (htmlCode/cssCode/jsCode/codeBuffers + editCtxByLang/titleByLang/...)
// with an explicit list of independent tabs, à la VS Code.
//
// Why this matters:
//  - Multiple tabs of the same language can coexist
//  - "New file" creates a new tab instead of clobbering the current one
//  - Each tab tracks its own dirty state, backend identity, lesson, etc.
//  - The "Update vs Submit" button in the toolbar reads from the active tab
//    instead of a parallel per-language map (fixes issue #1)

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Tab,
  LangKey,
  LANGUAGES,
  Snippet,
  Submission,
  UploadedFile,
  detectLangFromName,
  makeTabId,
  TabKind,
} from "./types";

const DRAFT_KEY = "code-ide-tabs-v2";

type DraftShape = {
  tabs: Tab[];
  activeId: string | null;
};

function loadDraft(): DraftShape | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.tabs)) return null;
    return parsed as DraftShape;
  } catch {
    return null;
  }
}

function saveDraft(state: DraftShape) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be full or disabled — ignore
  }
}

function makeScratchTab(language: LangKey = "javascript"): Tab {
  const tpl = LANGUAGES[language].template;
  return {
    id: makeTabId(),
    kind: "scratch",
    language,
    title: "untitled",
    code: tpl,
    savedCode: tpl,
    snippetId: null,
    submissionId: null,
    uploadId: null,
    folderId: null,
    lessonId: "",
    submissionTitle: "",
  };
}

export function useTabs() {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const draft = loadDraft();
    if (draft && draft.tabs.length > 0) return draft.tabs;
    return [makeScratchTab("javascript")];
  });

  const [activeId, setActiveId] = useState<string | null>(() => {
    const draft = loadDraft();
    if (draft && draft.activeId && draft.tabs.some((t) => t.id === draft.activeId)) {
      return draft.activeId;
    }
    return null; // resolved by effect below
  });

  // Ensure activeId is always valid
  useEffect(() => {
    if (tabs.length === 0) {
      // Always keep at least one tab open — empty state is jarring
      const fresh = makeScratchTab("javascript");
      setTabs([fresh]);
      setActiveId(fresh.id);
      return;
    }
    if (!activeId || !tabs.some((t) => t.id === activeId)) {
      setActiveId(tabs[0].id);
    }
  }, [tabs, activeId]);

  // Persist drafts on every change. Keeping this in one place avoids the
  // sprawling localStorage writes the old component had.
  useEffect(() => {
    saveDraft({ tabs, activeId });
  }, [tabs, activeId]);

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeId) ?? null,
    [tabs, activeId]
  );

  // ─── Generic tab mutation ──────────────────────────────────────────────
  const updateTab = useCallback((id: string, patch: Partial<Tab>) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const updateActiveTab = useCallback(
    (patch: Partial<Tab>) => {
      if (!activeId) return;
      updateTab(activeId, patch);
    },
    [activeId, updateTab]
  );

  // ─── New / open / close ─────────────────────────────────────────────────
  const openNewTab = useCallback((language: LangKey = "javascript") => {
    const fresh = makeScratchTab(language);
    setTabs((prev) => [...prev, fresh]);
    setActiveId(fresh.id);
    return fresh;
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        if (prev.length <= 1) {
          // Don't close the last tab — replace it with a fresh scratch tab
          // so the editor never goes empty (matches VS Code's "Welcome" behavior).
          const fresh = makeScratchTab("javascript");
          setActiveId(fresh.id);
          return [fresh];
        }
        const idx = prev.findIndex((t) => t.id === id);
        const next = prev.filter((t) => t.id !== id);
        if (id === activeId) {
          // Activate the neighbor (left preferred, else first remaining)
          const neighbor = next[Math.max(0, idx - 1)] ?? next[0];
          setActiveId(neighbor.id);
        }
        return next;
      });
    },
    [activeId]
  );

  const closeAllTabs = useCallback(() => {
    const fresh = makeScratchTab("javascript");
    setTabs([fresh]);
    setActiveId(fresh.id);
  }, []);

  const closeOtherTabs = useCallback((keepId: string) => {
    setTabs((prev) => {
      const keep = prev.find((t) => t.id === keepId);
      if (!keep) return prev;
      return [keep];
    });
    setActiveId(keepId);
  }, []);

  // ─── Loading from backend ──────────────────────────────────────────────
  // Each loader checks: is this resource already open in a tab? If so,
  // refresh that tab and switch to it. Otherwise open a new tab.
  const findTabBy = useCallback(
    (predicate: (t: Tab) => boolean) => tabs.find(predicate),
    [tabs]
  );

  const openSnippet = useCallback(
    (snippet: Snippet) => {
      const existing = findTabBy(
        (t) => t.kind === "snippet" && t.snippetId === snippet.id
      );
      if (existing) {
        // Refresh content in case the snippet changed remotely
        updateTab(existing.id, {
          code: snippet.code_text,
          savedCode: snippet.code_text,
          title: snippet.title || "untitled",
          language: snippet.language,
          folderId: snippet.folder ?? null,
          lessonId: snippet.lesson ? String(snippet.lesson) : "",
        });
        setActiveId(existing.id);
        return existing.id;
      }
      const tab: Tab = {
        id: makeTabId(),
        kind: "snippet",
        language: snippet.language,
        title: snippet.title || "untitled",
        code: snippet.code_text,
        savedCode: snippet.code_text,
        snippetId: snippet.id,
        submissionId: null,
        uploadId: null,
        folderId: snippet.folder ?? null,
        lessonId: snippet.lesson ? String(snippet.lesson) : "",
        submissionTitle: "",
      };
      setTabs((prev) => [...prev, tab]);
      setActiveId(tab.id);
      return tab.id;
    },
    [findTabBy, updateTab]
  );

  const openSubmission = useCallback(
    (sub: Submission) => {
      const existing = findTabBy(
        (t) => t.kind === "submission" && t.submissionId === sub.id
      );
      if (existing) {
        updateTab(existing.id, {
          code: sub.code_text || "",
          savedCode: sub.code_text || "",
          title: sub.title || "submission",
          language: sub.language,
          submissionTitle: sub.title || "",
          lessonId: String(sub.lesson),
        });
        setActiveId(existing.id);
        return existing.id;
      }
      const tab: Tab = {
        id: makeTabId(),
        kind: "submission",
        language: sub.language,
        title: sub.title || "submission",
        code: sub.code_text || "",
        savedCode: sub.code_text || "",
        snippetId: null,
        submissionId: sub.id,
        uploadId: null,
        folderId: null,
        lessonId: String(sub.lesson),
        submissionTitle: sub.title || "",
      };
      setTabs((prev) => [...prev, tab]);
      setActiveId(tab.id);
      return tab.id;
    },
    [findTabBy, updateTab]
  );

  const openUploadAsTab = useCallback(
    (
      file: UploadedFile,
      content: string | null,
      asImage: boolean
    ) => {
      const existing = findTabBy(
        (t) => t.kind === "upload" && t.uploadId === file.id
      );
      if (existing) {
        setActiveId(existing.id);
        return existing.id;
      }
      const lang = detectLangFromName(file.original_name);
      const tab: Tab = {
        id: makeTabId(),
        kind: "upload",
        language: lang,
        title: file.label || file.original_name.replace(/\.[^.]+$/, ""),
        code: content ?? "",
        savedCode: content ?? "",
        snippetId: null,
        submissionId: null,
        uploadId: file.id,
        folderId: file.folder ?? null,
        lessonId: file.lesson ? String(file.lesson) : "",
        submissionTitle: "",
        isImagePreview: asImage,
        imageUrl: asImage ? file.url : undefined,
      };
      setTabs((prev) => [...prev, tab]);
      setActiveId(tab.id);
      return tab.id;
    },
    [findTabBy]
  );

  // ─── Convenience derived values ─────────────────────────────────────────
  const isDirty = useCallback(
    (tab: Tab) => tab.code !== tab.savedCode,
    []
  );

  const hasAnyUnsaved = useMemo(
    () => tabs.some((t) => t.code !== t.savedCode),
    [tabs]
  );

  // Build the virtual filesystem for HTML/CSS/JS preview. We look at every
  // open tab, take saved snippet titles where available, and build
  // `{ "name.ext": content }`. When folders are provided, we also register
  // the full path (e.g. "styles/main.css") so cross-folder references work.
  const buildPreviewFilesystem = useCallback((folders?: { id: number; path: string }[]) => {
    const fs: Record<string, { content: string; lang: LangKey }> = {};
    const folderMap = new Map<number, string>();
    if (folders) {
      for (const f of folders) {
        folderMap.set(f.id, f.path);
      }
    }
    for (const tab of tabs) {
      const ext = LANGUAGES[tab.language].ext;
      const baseName = `${(tab.title || "untitled").trim() || "untitled"}.${ext}`;
      const entry = { content: tab.code, lang: tab.language };

      // Always register the flat basename so existing references still work
      fs[baseName.toLowerCase()] = entry;

      // Also register the full folder path (e.g. "styles/main.css")
      if (tab.folderId != null && folderMap.has(tab.folderId)) {
        const folderPath = folderMap.get(tab.folderId)!;
        const fullPath = `${folderPath}/${baseName}`.toLowerCase();
        fs[fullPath] = entry;
      }
    }
    return fs;
  }, [tabs]);

  return {
    // state
    tabs,
    activeTab,
    activeId,

    // active tab helpers
    setActiveId,
    updateTab,
    updateActiveTab,

    // tab lifecycle
    openNewTab,
    closeTab,
    closeAllTabs,
    closeOtherTabs,

    // loaders
    openSnippet,
    openSubmission,
    openUploadAsTab,

    // derived
    isDirty,
    hasAnyUnsaved,
    buildPreviewFilesystem,
  };
}
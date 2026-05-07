// FilesSidebar.tsx
//
// VS Code-style Explorer panel:
//  - A folder tree built from the flat folder list returned by Django
//  - Snippets and uploads live inside their folder (or at the root)
//  - Click a folder to expand/collapse; click an item to open it as a tab
//  - Right-side action buttons appear on hover (open URL, delete)
//  - "New folder" / "New file" / "Upload" actions in the panel header
//
// The component receives all data + callbacks from the parent. It stores
// only UI state (filter text, expanded folder ids, in-progress rename id).

import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  FilePlus,
  FolderPlus,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Upload,
  Loader2,
  Trash2,
  Link as LinkIcon,
  FileCode,
  Image as ImageIcon,
  Pencil,
  ClipboardCopy,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Folder, Snippet, UploadedFile } from "./types";
import { ThemeTokens } from "./useTheme";
import { LangBadge } from "./LangBadge";

// Internal tree node used purely for rendering. We don't try to mutate
// these — they're rebuilt on each render from the source-of-truth arrays.
type TreeFolder = {
  folder: Folder;
  children: TreeFolder[];
  snippets: Snippet[];
  uploads: UploadedFile[];
};

type RootTree = {
  rootSnippets: Snippet[];
  rootUploads: UploadedFile[];
  rootFolders: TreeFolder[];
};

function buildTree(
  folders: Folder[],
  snippets: Snippet[],
  uploads: UploadedFile[]
): RootTree {
  // Build folder index
  const byId = new Map<number, TreeFolder>();
  for (const f of folders) {
    byId.set(f.id, { folder: f, children: [], snippets: [], uploads: [] });
  }
  // Wire parent links
  const roots: TreeFolder[] = [];
  for (const node of byId.values()) {
    if (node.folder.parent && byId.has(node.folder.parent)) {
      byId.get(node.folder.parent)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  // Distribute snippets and uploads
  const rootSnippets: Snippet[] = [];
  for (const s of snippets) {
    if (s.folder && byId.has(s.folder)) {
      byId.get(s.folder)!.snippets.push(s);
    } else {
      rootSnippets.push(s);
    }
  }
  const rootUploads: UploadedFile[] = [];
  for (const u of uploads) {
    if (u.folder && byId.has(u.folder)) {
      byId.get(u.folder)!.uploads.push(u);
    } else {
      rootUploads.push(u);
    }
  }
  // Sort everything for stable display
  const sortFolderName = (a: TreeFolder, b: TreeFolder) =>
    a.folder.name.localeCompare(b.folder.name);
  const sortByTitle = (a: any, b: any) =>
    (a.title || a.label || a.original_name || "").localeCompare(
      b.title || b.label || b.original_name || ""
    );
  const walk = (n: TreeFolder) => {
    n.children.sort(sortFolderName);
    n.snippets.sort(sortByTitle);
    n.uploads.sort(sortByTitle);
    n.children.forEach(walk);
  };
  roots.sort(sortFolderName);
  roots.forEach(walk);
  rootSnippets.sort(sortByTitle);
  rootUploads.sort(sortByTitle);

  return { rootSnippets, rootUploads, rootFolders: roots };
}

// Filter the tree by a query. Folders that contain matching items
// (or whose name matches) are kept. Empty branches collapse out.
function filterTree(root: RootTree, query: string): RootTree {
  if (!query.trim()) return root;
  const q = query.toLowerCase();

  const matchSnippet = (s: Snippet) =>
    (s.title || "").toLowerCase().includes(q) ||
    (s.code_text || "").toLowerCase().includes(q);
  const matchUpload = (u: UploadedFile) =>
    (u.label || u.original_name || "").toLowerCase().includes(q);

  const walk = (n: TreeFolder): TreeFolder | null => {
    const folderHit = n.folder.name.toLowerCase().includes(q);
    const sn = n.snippets.filter(matchSnippet);
    const up = n.uploads.filter(matchUpload);
    const ch = n.children
      .map(walk)
      .filter(Boolean) as TreeFolder[];
    if (folderHit || sn.length || up.length || ch.length) {
      return { ...n, snippets: sn, uploads: up, children: ch };
    }
    return null;
  };

  return {
    rootSnippets: root.rootSnippets.filter(matchSnippet),
    rootUploads: root.rootUploads.filter(matchUpload),
    rootFolders: root.rootFolders
      .map(walk)
      .filter(Boolean) as TreeFolder[],
  };
}

export type FilesSidebarProps = {
  folders: Folder[];
  snippets: Snippet[];
  uploads: UploadedFile[];

  onLoadSnippet: (s: Snippet) => void;
  onLoadFile: (f: UploadedFile) => void;
  onDeleteSnippet: (id: number) => void;
  onDeleteFile: (id: number) => void;
  onCopySnippetUrl: (id: number) => void;
  onCopyFileUrl: (f: UploadedFile) => void;
  onCopySnippetPath: (s: Snippet) => void;
  onCopyFilePath: (f: UploadedFile) => void;
  onUploadClick: (folderId: number | null) => void;
  onNewFile: (folderId: number | null) => void;
  onCreateFolder: (parentId: number | null) => void;
  onRenameFolder: (id: number, name: string) => void | Promise<void>;
  onDeleteFolder: (id: number) => void;

  snippetLoadingId: number | null;
  fileLoadingId: number | null;
  deletingSnippetId: number | null;
  deletingFileId: number | null;
  activeSnippetId: number | null;

  uploading: boolean;
  uploadProgress: number;

  t: ThemeTokens;
};

export function FilesSidebar(props: FilesSidebarProps) {
  const {
    folders,
    snippets,
    uploads,
    onLoadSnippet,
    onLoadFile,
    onDeleteSnippet,
    onDeleteFile,
    onCopySnippetUrl,
    onCopyFileUrl,
    onCopySnippetPath,
    onCopyFilePath,
    onUploadClick,
    onNewFile,
    onCreateFolder,
    onRenameFolder,
    onDeleteFolder,
    snippetLoadingId,
    fileLoadingId,
    deletingSnippetId,
    deletingFileId,
    activeSnippetId,
    uploading,
    uploadProgress,
    t,
  } = props;

  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const rawTree = useMemo(
    () => buildTree(folders, snippets, uploads),
    [folders, snippets, uploads]
  );
  const tree = useMemo(() => filterTree(rawTree, filter), [rawTree, filter]);

  // Auto-expand all folders when filtering, so matches are visible
  useEffect(() => {
    if (filter.trim()) {
      const all = new Set<number>(folders.map((f) => f.id));
      setExpanded(all);
    }
  }, [filter, folders]);

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startRename = (id: number, current: string) => {
    setRenamingId(id);
    setRenameValue(current);
  };

  const commitRename = async () => {
    if (renamingId == null) return;
    const v = renameValue.trim();
    if (!v) {
      setRenamingId(null);
      return;
    }
    await onRenameFolder(renamingId, v);
    setRenamingId(null);
  };

  // ─── Recursive renderer ────────────────────────────────────────────────
  const renderFolder = (node: TreeFolder, depth: number): React.ReactNode => {
    const isOpen = expanded.has(node.folder.id);
    const isRenaming = renamingId === node.folder.id;
    const totalCount =
      node.snippets.length + node.uploads.length + node.children.length;

    return (
      <React.Fragment key={`folder-${node.folder.id}`}>
        <div
          className="sidebar-item folder-row"
          style={{ paddingLeft: 6 + depth * 12 }}
        >
          <button
            onClick={() => toggle(node.folder.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              flex: 1,
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              padding: 0,
              minWidth: 0,
              textAlign: "left",
            }}
          >
            {isOpen ? (
              <ChevronDown
                className="h-3 w-3"
                style={{ flexShrink: 0, color: t.textMuted }}
              />
            ) : (
              <ChevronRight
                className="h-3 w-3"
                style={{ flexShrink: 0, color: t.textMuted }}
              />
            )}
            {isOpen ? (
              <FolderOpenIcon
                className="h-3.5 w-3.5"
                style={{ flexShrink: 0, color: t.accent }}
              />
            ) : (
              <FolderIcon
                className="h-3.5 w-3.5"
                style={{ flexShrink: 0, color: t.accent }}
              />
            )}
            {isRenaming ? (
              <input
                type="text"
                className="ide-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") setRenamingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                style={{ height: 22, fontSize: 12, padding: "2px 6px" }}
              />
            ) : (
              <>
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {node.folder.name}
                </span>
                {totalCount > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      color: t.textDim,
                      marginRight: 4,
                    }}
                  >
                    {totalCount}
                  </span>
                )}
              </>
            )}
          </button>
          {!isRenaming && (
            <div className="actions">
              <button
                className="sidebar-item-action"
                onClick={(e) => {
                  e.stopPropagation();
                  onNewFile(node.folder.id);
                }}
                title="New file in this folder"
              >
                <FilePlus className="h-3 w-3" />
              </button>
              <button
                className="sidebar-item-action"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateFolder(node.folder.id);
                }}
                title="New subfolder"
              >
                <FolderPlus className="h-3 w-3" />
              </button>
              <button
                className="sidebar-item-action"
                onClick={(e) => {
                  e.stopPropagation();
                  startRename(node.folder.id, node.folder.name);
                }}
                title="Rename"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                className="sidebar-item-action"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder(node.folder.id);
                }}
                title="Delete folder"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {isOpen && (
          <>
            {node.children.map((c) => renderFolder(c, depth + 1))}
            {node.snippets.map((s) => renderSnippet(s, depth + 1))}
            {node.uploads.map((u) => renderUpload(u, depth + 1))}
          </>
        )}
      </React.Fragment>
    );
  };

  const renderSnippet = (s: Snippet, depth: number) => (
    <div
      key={`snip-${s.id}`}
      className={`sidebar-item ${activeSnippetId === s.id ? "active" : ""}`}
      style={{ paddingLeft: 14 + depth * 12 }}
    >
      <button
        onClick={() => onLoadSnippet(s)}
        disabled={snippetLoadingId === s.id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flex: 1,
          background: "transparent",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          padding: 0,
          minWidth: 0,
          textAlign: "left",
        }}
      >
        <LangBadge lang={s.language} />
        <span
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: 12,
          }}
        >
          {snippetLoadingId === s.id ? "Loading..." : s.title || "untitled"}
        </span>
      </button>
      <div className="actions">
        <button
          className="sidebar-item-action"
          onClick={(e) => {
            e.stopPropagation();
            onCopySnippetPath(s);
          }}
          title="Copy file path"
        >
          <ClipboardCopy className="h-3 w-3" />
        </button>
        <button
          className="sidebar-item-action"
          onClick={(e) => {
            e.stopPropagation();
            onCopySnippetUrl(s.id);
          }}
          title="Copy URL"
        >
          <LinkIcon className="h-3 w-3" />
        </button>
        <button
          className="sidebar-item-action"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteSnippet(s.id);
          }}
          title="Delete"
          disabled={deletingSnippetId === s.id}
        >
          {deletingSnippetId === s.id ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>
  );

  const renderUpload = (file: UploadedFile, depth: number) => {
    const ext = file.original_name.split(".").pop()?.toLowerCase();
    const isImage = ["png", "jpg", "jpeg", "gif", "svg"].includes(ext || "");
    return (
      <div
        key={`upl-${file.id}`}
        className="sidebar-item"
        style={{ paddingLeft: 14 + depth * 12 }}
      >
        <button
          onClick={() => onLoadFile(file)}
          disabled={fileLoadingId === file.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flex: 1,
            background: "transparent",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            padding: 0,
            minWidth: 0,
            textAlign: "left",
          }}
        >
          {isImage ? (
            <ImageIcon
              className="h-3.5 w-3.5"
              style={{ color: t.textMuted, flexShrink: 0 }}
            />
          ) : (
            <FileCode
              className="h-3.5 w-3.5"
              style={{ color: t.textMuted, flexShrink: 0 }}
            />
          )}
          <span
            style={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: 12,
            }}
          >
            {fileLoadingId === file.id
              ? "Loading..."
              : file.label || file.original_name}
          </span>
        </button>
        <div className="actions">
          <button
            className="sidebar-item-action"
            onClick={(e) => {
              e.stopPropagation();
              onCopyFilePath(file);
            }}
            title="Copy file path"
          >
            <ClipboardCopy className="h-3 w-3" />
          </button>
          <button
            className="sidebar-item-action"
            onClick={(e) => {
              e.stopPropagation();
              onCopyFileUrl(file);
            }}
            title="Copy URL"
          >
            <LinkIcon className="h-3 w-3" />
          </button>
          <button
            className="sidebar-item-action"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFile(file.id);
            }}
            title="Delete"
            disabled={deletingFileId === file.id}
          >
            {deletingFileId === file.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>
    );
  };

  const isEmpty =
    tree.rootFolders.length === 0 &&
    tree.rootSnippets.length === 0 &&
    tree.rootUploads.length === 0;

  return (
    <div>
      <div className="sidebar-section" style={{ paddingBottom: 8 }}>
        <div className="sidebar-heading" style={{ justifyContent: "flex-end" }}>
          <div style={{ display: "flex", gap: 2 }}>
            <button
              className="sidebar-item-action"
              onClick={() => onNewFile(null)}
              title="New file at root"
            >
              <FilePlus className="h-3.5 w-3.5" />
            </button>
            <button
              className="sidebar-item-action"
              onClick={() => onCreateFolder(null)}
              title="New folder"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </button>
            <button
              className="sidebar-item-action"
              onClick={() => onUploadClick(null)}
              title="Upload file"
              disabled={uploading}
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <input
          type="text"
          placeholder="Filter files..."
          className="ide-input"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        {uploading && (
          <div style={{ marginBottom: 8 }}>
            <Progress value={uploadProgress} />
            <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4 }}>
              Uploading {Math.round(uploadProgress)}%
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-section" style={{ paddingTop: 0, paddingLeft: 6 }}>
        {isEmpty ? (
          <div
            style={{
              fontSize: 11,
              color: t.textDim,
              padding: "8px 8px",
              textAlign: "center",
            }}
          >
            {filter ? "No matches" : "No files yet"}
          </div>
        ) : (
          <>
            {tree.rootFolders.map((f) => renderFolder(f, 0))}
            {tree.rootSnippets.map((s) => renderSnippet(s, 0))}
            {tree.rootUploads.map((u) => renderUpload(u, 0))}
          </>
        )}
      </div>
    </div>
  );
}
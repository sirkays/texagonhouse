// SubmissionsSidebar.tsx
//
// Submissions panel with:
//  - Filter input
//  - Paginated list (Load more / Page next/prev) — issue #5
//  - Inline detail view with comments
//
// `pageSize` is fixed at 8 — this keeps the list compact in the narrow
// sidebar. The "Load more" button appends another page; "Reset" goes back
// to a single page. The full set is always available locally; pagination
// here is purely a presentation concern (data fetched in one go on mount).

import React, { useMemo, useState } from "react";
import {
  ChevronRight,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import { Submission, Comment } from "./types";
import { ThemeTokens } from "./useTheme";
import { LangBadge } from "./LangBadge";

const PAGE_SIZE = 8;

export type SubmissionsSidebarProps = {
  submissions: Submission[];
  onLoad: (s: Submission) => void;
  fetchSubmissionDetail: (id: number) => Promise<Submission>;
  onComment: (id: number, msg: string) => Promise<Comment>;
  showCustomAlert: (m: string) => void;
  t: ThemeTokens;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SubmissionsSidebar({
  submissions,
  onLoad,
  fetchSubmissionDetail,
  onComment,
  showCustomAlert,
  t,
}: SubmissionsSidebarProps) {
  const [filter, setFilter] = useState("");
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Submission | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);

  // Reset page when filter changes — otherwise you'd see "page 3 of 0"
  React.useEffect(() => {
    setPage(1);
  }, [filter]);

  const filtered = useMemo(() => {
    return submissions
      .filter((s) =>
        `${s.title ?? ""} ${s.language} ${s.status}`
          .toLowerCase()
          .includes(filter.toLowerCase())
      )
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [submissions, filter]);

  // Pagination math
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(0, safePage * PAGE_SIZE);
  const canLoadMore = visible.length < filtered.length;
  const hasMore = filtered.length > PAGE_SIZE;

  const openDetail = async (id: number) => {
    setViewingId(id);
    setLoadingDetail(true);
    try {
      const full = await fetchSubmissionDetail(id);
      setDetail(full);
    } catch {
      showCustomAlert("Could not load details");
      setViewingId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const sendComment = async () => {
    if (!detail || !comment.trim()) return;
    setSending(true);
    try {
      await onComment(detail.id, comment);
      setComment("");
      const fresh = await fetchSubmissionDetail(detail.id);
      setDetail(fresh);
    } catch {
      showCustomAlert("Comment failed");
    } finally {
      setSending(false);
    }
  };

  // ─── Detail view ───────────────────────────────────────────────────────
  if (viewingId !== null) {
    return (
      <div
        style={{
          // Make the detail view a flex column so the comments scroll, not the whole sidebar.
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div
          className="sidebar-section"
          style={{
            background: t.bgPanel,
            borderBottom: `1px solid ${t.borderMuted}`,
            paddingBottom: 8,
            flexShrink: 0,
          }}
        >
          <button
            className="ide-btn ghost"
            style={{ width: "100%", justifyContent: "flex-start", gap: 6 }}
            onClick={() => {
              setViewingId(null);
              setDetail(null);
              setComment("");
            }}
          >
            <ChevronRight
              className="h-3 w-3"
              style={{ transform: "rotate(180deg)" }}
            />
            Back to list
          </button>
        </div>

        {loadingDetail || !detail ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            <Loader2
              className="h-4 w-4 animate-spin"
              style={{ color: t.textMuted, margin: "0 auto" }}
            />
          </div>
        ) : (
          <div
            className="sidebar-section scroll-thin"
            style={{ flex: 1, overflow: "auto", minHeight: 0 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
              }}
            >
              <LangBadge lang={detail.language} />
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {detail.title || `Submission #${detail.id}`}
              </span>
            </div>

            <div
              style={{
                fontSize: 10,
                color: t.textMuted,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                marginBottom: 12,
              }}
            >
              <div>
                <span
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                    color:
                      detail.status === "graded"
                        ? t.success
                        : detail.status === "revised"
                        ? t.warning
                        : t.textMuted,
                    fontWeight: 600,
                  }}
                >
                  {detail.status}
                </span>
                {" · "}
                {detail.score ?? "Not graded"}
              </div>
              <div>Submitted {formatDate(detail.created_at)}</div>
              {detail.graded_at && (
                <div>Graded {formatDate(detail.graded_at)}</div>
              )}
            </div>

            <Section label="Code" t={t}>
              <pre
                className="ide-mono scroll-thin"
                style={{
                  fontSize: 11,
                  background: t.bgAlt,
                  border: `1px solid ${t.borderMuted}`,
                  borderRadius: 4,
                  padding: 8,
                  margin: 0,
                  maxHeight: 280,
                  overflow: "auto",
                  whiteSpace: "pre",
                }}
              >
                {detail.code_text}
              </pre>
            </Section>

            {detail.feedback && (
              <Section label="Feedback" t={t}>
                <div
                  style={{
                    fontSize: 12,
                    background: t.bgAlt,
                    border: `1px solid ${t.borderMuted}`,
                    borderRadius: 4,
                    padding: 8,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {detail.feedback}
                </div>
              </Section>
            )}

            {detail.correction_code && (
              <Section label="Correction" t={t}>
                <pre
                  className="ide-mono scroll-thin"
                  style={{
                    fontSize: 11,
                    background: t.bgAlt,
                    border: `1px solid ${t.borderMuted}`,
                    borderRadius: 4,
                    padding: 8,
                    margin: 0,
                    maxHeight: 280,
                    overflow: "auto",
                    whiteSpace: "pre",
                  }}
                >
                  {detail.correction_code}
                </pre>
              </Section>
            )}

            <div style={{ marginBottom: 8 }}>
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  fontWeight: 600,
                  color: t.textMuted,
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <MessageSquare className="h-3 w-3" />
                Comments ({detail.comments.length})
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  maxHeight: 200,
                  overflow: "auto",
                  marginBottom: 8,
                }}
                className="scroll-thin"
              >
                {detail.comments.length === 0 ? (
                  <div
                    style={{
                      fontSize: 11,
                      color: t.textDim,
                      textAlign: "center",
                      padding: "8px 0",
                    }}
                  >
                    No comments yet
                  </div>
                ) : (
                  detail.comments.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        background: t.bgAlt,
                        border: `1px solid ${t.borderMuted}`,
                        borderRadius: 4,
                        padding: 6,
                        fontSize: 11,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 2,
                          fontSize: 10,
                          color: t.textMuted,
                        }}
                      >
                        <span style={{ fontWeight: 600, color: t.text }}>
                          {c.author_name}
                        </span>
                        <span>{formatDate(c.created_at)}</span>
                      </div>
                      <div style={{ whiteSpace: "pre-wrap" }}>{c.message}</div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="ide-input"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && comment.trim() && !sending) {
                      sendComment();
                    }
                  }}
                  disabled={sending}
                  style={{ flex: 1 }}
                />
                <button
                  className="ide-btn primary icon-only"
                  onClick={sendComment}
                  disabled={!comment.trim() || sending}
                  title="Send"
                >
                  {sending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <button
              className="ide-btn primary"
              style={{ width: "100%", marginTop: 4 }}
              onClick={() => onLoad(detail)}
            >
              Load into editor
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── List view ─────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <div className="sidebar-section" style={{ flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 6 }}>
          {filtered.length}{" "}
          {filtered.length === 1 ? "submission" : "submissions"}
        </div>
        <input
          type="text"
          placeholder="Filter submissions..."
          className="ide-input"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Scrollable list area — bounded height so long lists don't push the
          page; the "Load more" button stays anchored below. */}
      <div
        className="sidebar-section scroll-thin"
        style={{
          paddingTop: 0,
          flex: 1,
          overflow: "auto",
          minHeight: 0,
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              fontSize: 11,
              color: t.textDim,
              padding: "8px 4px",
              textAlign: "center",
            }}
          >
            No submissions yet
          </div>
        ) : (
          visible.map((s) => (
            <div
              key={s.id}
              style={{
                padding: 8,
                marginBottom: 4,
                borderRadius: 4,
                border: `1px solid ${t.borderMuted}`,
                background: t.bgPanel,
                fontSize: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <LangBadge lang={s.language} />
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontWeight: 500,
                  }}
                >
                  {s.title || `#${s.id}`}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10,
                  color: t.textMuted,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                    color:
                      s.status === "graded"
                        ? t.success
                        : s.status === "revised"
                        ? t.warning
                        : t.textMuted,
                  }}
                >
                  {s.status}
                </span>
                <span>{s.score ?? "—"}</span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: t.textDim,
                  marginBottom: 6,
                }}
              >
                {formatDate(s.created_at)}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  className="ide-btn ghost"
                  style={{ flex: 1, height: 24, fontSize: 11 }}
                  onClick={() => onLoad(s)}
                >
                  Load
                </button>
                <button
                  className="ide-btn ghost"
                  style={{ flex: 1, height: 24, fontSize: 11 }}
                  onClick={() => openDetail(s.id)}
                >
                  Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination footer — only renders when there's actually more than one page. */}
      {hasMore && (
        <div
          style={{
            flexShrink: 0,
            padding: 8,
            borderTop: `1px solid ${t.borderMuted}`,
            background: t.bgPanel,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {canLoadMore ? (
            <button
              className="ide-btn"
              onClick={() => setPage((p) => p + 1)}
              style={{ width: "100%" }}
            >
              Load more (
              {filtered.length - visible.length} remaining)
            </button>
          ) : (
            <button
              className="ide-btn ghost"
              onClick={() => setPage(1)}
              style={{ width: "100%" }}
            >
              Showing all {filtered.length} · Reset
            </button>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 10,
              color: t.textMuted,
            }}
          >
            <button
              className="ide-btn ghost"
              style={{ height: 22, fontSize: 10 }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              ← Prev
            </button>
            <span>
              Page {safePage} / {totalPages}
            </span>
            <button
              className="ide-btn ghost"
              style={{ height: 22, fontSize: 10 }}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  label,
  children,
  t,
}: {
  label: string;
  children: React.ReactNode;
  t: ThemeTokens;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          fontWeight: 600,
          color: t.textMuted,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
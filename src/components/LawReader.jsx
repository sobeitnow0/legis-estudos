import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { HighlightingToolbar } from "./HighlightingToolbar";
import { 
  Bookmark, Trash2, ChevronLeft, ChevronRight, CheckCircle, 
  AlertTriangle, BookOpen, Clock, Tag, MessageSquare
} from "lucide-react";
import lawsData from "../data/lawsDemo.json";
import RichTextEditor from "./editor/RichTextEditor";

export default function LawReader() {
  const { lawId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusBlockId = searchParams.get("focus");

  const [law, setLaw] = useState(null);
  const [activeNoteBlockId, setActiveNoteBlockId] = useState(null);
  
  // Inline Editor States
  const [activeInlineEditorId, setActiveInlineEditorId] = useState(null);
  const [inlineNoteText, setInlineNoteText] = useState("");
  
  // Data persistence states
  const [highlights, setHighlights] = useState({});
  const [comments, setComments] = useState({});
  const [blockStatuses, setBlockStatuses] = useState({}); // { [blockId]: 'read' | 'review' }

  // Selection toolbar state
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0, visible: false });
  const [currentSelection, setCurrentSelection] = useState(null);

  // Load law from local storage or demo data
  useEffect(() => {
    let selectedLaw = lawsData.laws.find((l) => l.id === lawId);
    
    if (!selectedLaw) {
      try {
        const savedContent = localStorage.getItem(`legis_law_content_${lawId}`);
        if (savedContent) {
          selectedLaw = JSON.parse(savedContent);
        }
      } catch (e) {
        console.error("Erro ao carregar lei do localStorage:", e);
      }
    }
    
    setLaw(selectedLaw);
    
    if (selectedLaw && selectedLaw.blocks && selectedLaw.blocks.length > 0) {
      // Focus element if specified in URL query params
      if (focusBlockId) {
        setActiveNoteBlockId(focusBlockId);
        setTimeout(() => {
          const el = document.getElementById(focusBlockId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add("active-note-block");
            setTimeout(() => {
              el.classList.remove("active-note-block");
            }, 2000);
          }
        }, 500);
      } else {
        // Default to first block
        setActiveNoteBlockId(selectedLaw.blocks[0].id);
      }
    }
  }, [lawId, focusBlockId]);

  // Load highlights, comments, and statuses from localStorage
  useEffect(() => {
    const savedHl = localStorage.getItem(`legis_hl_${lawId}`) || "{}";
    const savedCm = localStorage.getItem(`legis_cm_${lawId}`) || "{}";
    const savedSt = localStorage.getItem(`legis_status_${lawId}`) || "{}";
    setHighlights(JSON.parse(savedHl));
    setComments(JSON.parse(savedCm));
    setBlockStatuses(JSON.parse(savedSt));
  }, [lawId]);

  // Automatic "Lido" (read) status timer: 30 seconds focused on the same block
  useEffect(() => {
    if (!activeNoteBlockId || !lawId) return;

    const timer = setTimeout(() => {
      setBlockStatuses((prev) => {
        // If it's already marked as 'read' or 'review', do not overwrite
        if (prev[activeNoteBlockId] === "read" || prev[activeNoteBlockId] === "review") {
          return prev;
        }
        const updated = { ...prev, [activeNoteBlockId]: "read" };
        localStorage.setItem(`legis_status_${lawId}`, JSON.stringify(updated));
        return updated;
      });
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [activeNoteBlockId, lawId]);

  if (!law || !law.blocks || law.blocks.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--notion-text-secondary)" }}>
        Carregando legislação...
      </div>
    );
  }

  // Find list of all articles for select navigation
  const articlesList = law.blocks.filter(b => b.type === "article");

  const handleJumpToArticle = (articleId) => {
    setActiveNoteBlockId(articleId);
    const el = document.getElementById(articleId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Handle highlights
  const handleTextSelection = (e, blockId) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setToolbarPosition({
        top: rect.top + window.scrollY - 44,
        left: rect.left + window.scrollX + rect.width / 2 - 120,
        visible: true,
      });

      setCurrentSelection({
        blockId,
        text: selectedText,
        start: range.startOffset,
        end: range.endOffset,
      });
    } else {
      setToolbarPosition((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleApplyHighlight = (color) => {
    if (!currentSelection) return;
    const { blockId, text } = currentSelection;

    const blockHighlights = highlights[blockId] || [];
    const existingIndex = blockHighlights.findIndex((h) => h.text === text);
    let newHl = [...blockHighlights];

    if (existingIndex > -1) {
      newHl[existingIndex].color = color;
    } else {
      newHl.push({ text, color });
    }

    const updatedHighlights = {
      ...highlights,
      [blockId]: newHl,
    };

    setHighlights(updatedHighlights);
    localStorage.setItem(`legis_hl_${lawId}`, JSON.stringify(updatedHighlights));
    
    window.getSelection().removeAllRanges();
    setToolbarPosition((prev) => ({ ...prev, visible: false }));
    setCurrentSelection(null);
  };

  const handleClearHighlights = (blockId) => {
    const updatedHighlights = { ...highlights };
    delete updatedHighlights[blockId];
    setHighlights(updatedHighlights);
    localStorage.setItem(`legis_hl_${lawId}`, JSON.stringify(updatedHighlights));
  };

  // Status handlers (manual toggle for review)
  const handleToggleStatus = (blockId, statusType) => {
    const current = blockStatuses[blockId];
    
    let nextStatus = statusType;
    if (current === statusType) {
      nextStatus = null; // Toggle off
    }

    const updated = {
      ...blockStatuses,
      [blockId]: nextStatus
    };
    setBlockStatuses(updated);
    localStorage.setItem(`legis_status_${lawId}`, JSON.stringify(updated));
  };

  // Inline editor toggle
  const handleOpenInlineEditor = (blockId) => {
    setActiveInlineEditorId(blockId);
    setInlineNoteText(comments[blockId] || "");
  };

  // Save Note Handler (automatically marks block as read)
  const handleSaveInlineNote = (blockId) => {
    if (!inlineNoteText.trim()) {
      handleDeleteNote(blockId);
      setActiveInlineEditorId(null);
      return;
    }

    const updatedComments = {
      ...comments,
      [blockId]: inlineNoteText.trim()
    };
    setComments(updatedComments);
    localStorage.setItem(`legis_cm_${lawId}`, JSON.stringify(updatedComments));

    // Automatically mark as read when note is saved (unless it's already marked as review)
    setBlockStatuses((prev) => {
      if (prev[blockId] === "read" || prev[blockId] === "review") {
        return prev;
      }
      const updated = { ...prev, [blockId]: "read" };
      localStorage.setItem(`legis_status_${lawId}`, JSON.stringify(updated));
      return updated;
    });

    setActiveInlineEditorId(null);
  };

  const handleDeleteNote = (blockId) => {
    const updatedComments = { ...comments };
    delete updatedComments[blockId];
    setComments(updatedComments);
    localStorage.setItem(`legis_cm_${lawId}`, JSON.stringify(updatedComments));
  };

  // Text highlighting renderer helper
  const renderTextWithHighlights = (blockId, originalText) => {
    const blockHls = highlights[blockId];
    if (!blockHls || blockHls.length === 0) return originalText;

    let formattedText = originalText;
    const sortedHls = [...blockHls].sort((a, b) => b.text.length - a.text.length);

    sortedHls.forEach((hl) => {
      const escapedText = hl.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`(${escapedText})`, "g");
      formattedText = formattedText.replace(
        regex,
        `<span class="hl-${hl.color} font-medium px-0.5 rounded cursor-pointer">${hl.text}</span>`
      );
    });

    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  return (
    <div style={{ flex: 1, backgroundColor: "var(--notion-bg)", display: "flex", flexDirection: "column" }}>
      <div className="notion-page-frame animate-fade-in" style={{ paddingBottom: "120px", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        
        {/* Navigation Dropdown & Header metadata */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div className="article-select-container">
            <BookOpen size={15} style={{ color: "var(--notion-accent)" }} />
            <select
              onChange={(e) => handleJumpToArticle(e.target.value)}
              className="article-select"
              defaultValue=""
            >
              <option value="" disabled>Ir para artigo...</option>
              {articlesList.map((art) => {
                const label = art.content.substring(0, 45);
                return (
                  <option key={art.id} value={art.id}>
                    {art.content.match(/^Art\.\s*\d+[^\s]*/i)?.[0] || "Artigo"} - {label.replace(/^Art\.\s*(\d+[^\s]*)\s*[-–]?\s*/i, "")}...
                  </option>
                );
              })}
            </select>
          </div>
          
          <div style={{ fontSize: "0.85rem", color: "var(--notion-text-secondary)", fontWeight: 500 }}>
            {law.title} — {law.type}
          </div>
        </div>

        {/* Scrollable Blocks List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          
          {law.blocks.map((block) => {
            const isH2 = block.type === "heading-2";
            const isH3 = block.type === "heading-3";
            const isArticle = block.type === "article";
            const isInciso = block.type === "inciso";
            const isAlinea = block.type === "alinea" || block.type === "paragraph-item";
            const isLegalParagraph = block.type === "paragraph" && (block.content.trim().startsWith("§") || block.content.trim().toLowerCase().startsWith("parágrafo"));
            
            const isActive = activeNoteBlockId === block.id;
            const status = blockStatuses[block.id];
            const hasNotes = !!comments[block.id];

            if (isH2) {
              return (
                <div 
                  key={block.id} 
                  id={block.id} 
                  onClick={() => setActiveNoteBlockId(block.id)}
                  className={`notion-block-container ${isActive ? "active-note-block" : ""}`}
                  style={{ cursor: "pointer", padding: "8px 12px", borderRadius: "var(--notion-radius)" }}
                >
                  <h2 id={`h2-${block.id}`} style={{ margin: "24px 0 12px 0", fontSize: "1.45rem", border: "none", padding: 0 }}>
                    {block.content}
                  </h2>
                </div>
              );
            }

            if (isH3) {
              return (
                <div 
                  key={block.id} 
                  id={block.id} 
                  onClick={() => setActiveNoteBlockId(block.id)}
                  className={`notion-block-container ${isActive ? "active-note-block" : ""}`}
                  style={{ cursor: "pointer", padding: "8px 12px", borderRadius: "var(--notion-radius)" }}
                >
                  <h3 id={`h3-${block.id}`} style={{ margin: "16px 0 8px 0", fontSize: "1.15rem", color: "var(--notion-text-secondary)" }}>
                    {block.content}
                  </h3>
                </div>
              );
            }

            return (
              <div
                key={block.id}
                id={block.id}
                onClick={() => setActiveNoteBlockId(block.id)}
                onMouseUp={(e) => handleTextSelection(e, block.id)}
                className={`notion-block-container ${isActive ? "active-note-block" : ""} ${isArticle ? "vercel-article-card" : ""}`}
                style={{
                  padding: isArticle ? "16px" : "8px 12px",
                  paddingLeft: isInciso || isLegalParagraph ? "36px" : isAlinea ? "56px" : isArticle ? "16px" : "12px",
                  borderRadius: isArticle ? "var(--notion-radius-lg)" : "var(--notion-radius)",
                  border: isArticle ? "1px solid var(--notion-border)" : "none",
                  backgroundColor: isArticle ? "var(--notion-sidebar-bg)" : "transparent",
                  boxShadow: isArticle ? "var(--notion-shadow)" : "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  marginBottom: isArticle ? "8px" : "2px"
                }}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  {isArticle && (
                    <span
                      style={{
                        backgroundColor: "var(--notion-accent)",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        whiteSpace: "nowrap"
                      }}
                    >
                      Art. {block.content.match(/^Art\.\s*(\d+[^\s]*)/i)?.[1] || "Ativo"}
                    </span>
                  )}
                  
                  <p
                    className={`notion-block notion-block-${block.type} ${block.revoked ? "notion-block-revoked" : ""}`}
                    style={{ 
                      flex: 1, 
                      margin: 0, 
                      fontSize: isArticle ? "1.05rem" : "0.95rem", 
                      fontWeight: isArticle ? 500 : 400,
                      lineHeight: isArticle ? 1.6 : 1.5 
                    }}
                  >
                    {isArticle ? (
                      renderTextWithHighlights(
                        block.id, 
                        block.content.replace(/^Art\.\s*(\d+[^\s]*)\s*[-–]?\s*/i, "")
                      )
                    ) : (
                      renderTextWithHighlights(block.id, block.content)
                    )}
                  </p>

                  {/* Inline visual indicators */}
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {status === "read" && (
                      <CheckCircle size={14} style={{ color: "#2ecc71" }} title="Lido" />
                    )}
                    {status === "review" && (
                      <AlertTriangle size={14} style={{ color: "#f2c94c" }} title="Para revisão" />
                    )}
                  </div>

                  {/* Hover Action Buttons */}
                  <div className="block-hover-actions">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleToggleStatus(block.id, "review"); }} 
                      className="hover-action-btn"
                      title="Marcar para revisar"
                      style={{ color: status === "review" ? "#f5a623" : "inherit" }}
                    >
                      <AlertTriangle size={13} fill={status === "review" ? "#f5a623" : "none"} />
                    </button>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenInlineEditor(block.id); }} 
                      className="hover-action-btn"
                      title="Escrever anotação"
                    >
                      <MessageSquare size={13} />
                    </button>

                    {highlights[block.id] && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleClearHighlights(block.id); }} 
                        className="hover-action-btn"
                        title="Limpar marcações"
                        style={{ color: "#eb5757" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Note Editor */}
                {activeInlineEditorId === block.id && (
                  <div onClick={(e) => e.stopPropagation()} style={{ marginTop: "12px", paddingLeft: "12px" }}>
                    <RichTextEditor
                      key={`inline-edit-${block.id}`}
                      content={inlineNoteText}
                      onChange={setInlineNoteText}
                      onCancel={() => setActiveInlineEditorId(null)}
                      onSave={() => handleSaveInlineNote(block.id)}
                    />
                  </div>
                )}

                {/* Inline Saved Note display */}
                {hasNotes && activeInlineEditorId !== block.id && (
                  <div onClick={(e) => e.stopPropagation()} className="inline-note-card animate-fade-in" style={{ marginTop: "10px", marginLeft: "12px" }}>
                    <div className="inline-note-header">
                      <span>ANOTAÇÃO DE ESTUDOS</span>
                      <div className="inline-note-actions">
                        <button onClick={() => handleOpenInlineEditor(block.id)} className="note-action-btn" title="Editar nota">✏️</button>
                        <button onClick={() => handleDeleteNote(block.id)} className="note-action-btn" title="Excluir nota" style={{ color: "#eb5757" }}><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <div className="ProseMirror rich-editor-display" dangerouslySetInnerHTML={{ __html: comments[block.id] }} />
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>

      {/* Floating Highlight Selector Toolbar */}
      {toolbarPosition.visible && (
        <HighlightingToolbar
          position={toolbarPosition}
          onApplyHighlight={handleApplyHighlight}
          onClose={() => setToolbarPosition((prev) => ({ ...prev, visible: false }))}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { HighlightingToolbar } from "./HighlightingToolbar";
import { MessageSquare, Trash2, Tag, Info, Bookmark, HelpCircle } from "lucide-react";
import lawsData from "../data/lawsDemo.json";

export default function LawReader() {
  const { lawId } = useParams();
  const [searchParams] = useSearchParams();
  const focusBlockId = searchParams.get("focus");
  const bancaFilter = searchParams.get("banca"); // e.g. 'fgv', 'cespe', 'vunesp'

  const [law, setLaw] = useState(null);
  const [highlights, setHighlights] = useState({});
  const [comments, setComments] = useState({});
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");
  
  // Selection toolbar state
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0, visible: false });
  const [currentSelection, setCurrentSelection] = useState(null);

  const articleRefs = useRef({});

  // Mock bank metrics for filter
  const examMetrics = {
    cf88: {
      "cf88-art-1": { banca: "cespe", year: "2025", rate: "Alta incidência" },
      "cf88-art-2": { banca: "vunesp", year: "2024", rate: "Média incidência" },
      "cf88-art-5": { banca: "fgv", year: "2026", rate: "Altíssima incidência" }
    },
    cp40: {
      "cp-art-1": { banca: "fgv", year: "2025", rate: "Alta incidência" },
      "cp-art-2": { banca: "cespe", year: "2026", rate: "Altíssima incidência" }
    }
  };

  // Load law
  useEffect(() => {
    const selectedLaw = lawsData.laws.find((l) => l.id === lawId);
    setLaw(selectedLaw);
  }, [lawId]);

  // Load highlights and comments from localStorage
  useEffect(() => {
    const savedHl = localStorage.getItem(`legis_hl_${lawId}`) || "{}";
    const savedCm = localStorage.getItem(`legis_cm_${lawId}`) || "{}";
    setHighlights(JSON.parse(savedHl));
    setComments(JSON.parse(savedCm));
  }, [lawId]);

  // Focus block if specified in URL query params
  useEffect(() => {
    if (focusBlockId && articleRefs.current[focusBlockId]) {
      setTimeout(() => {
        articleRefs.current[focusBlockId].scrollIntoView({ behavior: "smooth", block: "center" });
        articleRefs.current[focusBlockId].style.backgroundColor = "var(--notion-active)";
        setTimeout(() => {
          if (articleRefs.current[focusBlockId]) {
            articleRefs.current[focusBlockId].style.backgroundColor = "transparent";
          }
        }, 1500);
      }, 300);
    }
  }, [focusBlockId, law]);

  if (!law) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Carregando legislação...
      </div>
    );
  }

  // Handle text selection
  const handleTextSelection = (e, blockId) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Position toolbar above selection
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
    
    // Simple check if this text is already highlighted, if so, update color
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
    
    // Clear selection
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

  // Comments
  const handleSelectBlockForComments = (blockId) => {
    setSelectedBlockId(blockId);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const blockComments = comments[selectedBlockId] || [];
    const newComment = {
      id: Date.now().toString(),
      text: newCommentText,
      author: "Você (Estudante)",
      date: new Date().toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedComments = {
      ...comments,
      [selectedBlockId]: [...blockComments, newComment],
    };

    setComments(updatedComments);
    localStorage.setItem(`legis_cm_${lawId}`, JSON.stringify(updatedComments));
    setNewCommentText("");
  };

  const handleDeleteComment = (blockId, commentId) => {
    const blockComments = comments[blockId] || [];
    const filtered = blockComments.filter((c) => c.id !== commentId);

    const updatedComments = {
      ...comments,
      [blockId]: filtered,
    };
    if (filtered.length === 0) {
      delete updatedComments[blockId];
    }

    setComments(updatedComments);
    localStorage.setItem(`legis_cm_${lawId}`, JSON.stringify(updatedComments));
  };

  // Helper to render text with highlighted ranges
  const renderTextWithHighlights = (blockId, originalText) => {
    const blockHls = highlights[blockId];
    if (!blockHls || blockHls.length === 0) return originalText;

    // To prevent overlapping errors in this client-side demo, we replace keywords sorted by length
    let formattedText = originalText;
    const sortedHls = [...blockHls].sort((a, b) => b.text.length - a.text.length);

    sortedHls.forEach((hl) => {
      // Escape regex chars
      const escapedText = hl.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`(${escapedText})`, "g");
      formattedText = formattedText.replace(
        regex,
        `<span class="hl-${hl.color} font-medium px-0.5 rounded cursor-pointer" title="Remover marcações clicando no botão ao lado">$1</span>`
      );
    });

    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  return (
    <div style={{ display: "flex", flex: 1, position: "relative" }}>
      {/* Law reader pane */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="notion-page-frame animate-fade-in" style={{ paddingBottom: "120px" }}>
          {/* Header emoji and metadata */}
          <div className="notion-page-header-emoji">{law.emoji}</div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "8px" }}>
            {law.title}
          </h1>
          <p style={{ color: "var(--notion-text-secondary)", fontSize: "0.95rem", marginBottom: "32px" }}>
            {law.description}
          </p>

          {/* Alert notification indicating synchrony */}
          <div className="notion-callout" style={{ backgroundColor: "var(--notion-hl-gray)", margin: "24px 0" }}>
            <div className="notion-callout-icon">⚡</div>
            <div className="notion-callout-content" style={{ fontSize: "0.85rem" }}>
              Este documento está <strong>sincronizado automaticamente</strong> com as alterações do Planalto de hoje. 
              Seus grifos e notas estão ancorados de forma segura a cada artigo e não sumirão em futuras atualizações.
            </div>
          </div>

          {/* Render Blocks */}
          <div style={{ position: "relative" }}>
            {law.blocks.map((block) => {
              const isH2 = block.type === "heading-2";
              const isH3 = block.type === "heading-3";
              const isFocused = focusBlockId === block.id;

              const metric = examMetrics[lawId]?.[block.id];
              const displayMetric = metric && (!bancaFilter || metric.banca === bancaFilter);

              const hasComment = (comments[block.id] || []).length > 0;
              const hasHighlight = (highlights[block.id] || []).length > 0;

              return (
                <div
                  key={block.id}
                  ref={(el) => (articleRefs.current[block.id] = el)}
                  onMouseUp={(e) => !isH2 && !isH3 && handleTextSelection(e, block.id)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "4px",
                    borderLeft: isFocused ? "3px solid var(--notion-accent)" : "none",
                    position: "relative",
                    transition: "background-color 0.2s",
                    marginBottom: "4px",
                  }}
                  className="notion-block-container"
                >
                  {/* Block content render based on type */}
                  {isH2 ? (
                    <h2 id={block.id} style={{ margin: "24px 0 12px 0", fontSize: "1.4rem" }}>
                      {block.content}
                    </h2>
                  ) : isH3 ? (
                    <h3 id={block.id} style={{ margin: "16px 0 8px 0", fontSize: "1.15rem" }}>
                      {block.content}
                    </h3>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <p
                        id={block.id}
                        style={{
                          flex: 1,
                          fontSize: "0.95rem",
                          lineHeight: "1.6",
                          color: "var(--notion-text)",
                        }}
                      >
                        {renderTextWithHighlights(block.id, block.content)}
                      </p>

                      {/* Right hover actions for each block */}
                      <div
                        className="block-actions"
                        style={{
                          display: "flex",
                          gap: "4px",
                          opacity: hasComment || hasHighlight ? 1 : 0.2,
                        }}
                      >
                        <button
                          onClick={() => handleSelectBlockForComments(block.id)}
                          className="toolbar-btn"
                          title="Ver anotações / Comentar"
                          style={{
                            color: hasComment ? "var(--notion-accent)" : "inherit",
                          }}
                        >
                          <MessageSquare size={14} />
                          {hasComment && (
                            <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                              {comments[block.id].length}
                            </span>
                          )}
                        </button>
                        {hasHighlight && (
                          <button
                            onClick={() => handleClearHighlights(block.id)}
                            className="toolbar-btn"
                            title="Limpar marcações"
                            style={{ color: "#eb5757" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Exam highlights callout inside article */}
                  {displayMetric && (
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "0.75rem",
                        backgroundColor:
                          metric.banca === "fgv"
                            ? "rgba(170, 59, 255, 0.08)"
                            : "rgba(35, 131, 226, 0.08)",
                        border: "1px solid var(--notion-border)",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        color: "var(--notion-text-secondary)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: 500,
                      }}
                    >
                      <Bookmark size={12} style={{ color: "var(--notion-accent)" }} />
                      <span>
                        Cobrado pela <strong>{metric.banca.toUpperCase()}</strong> ({metric.year}) —{" "}
                        <span style={{ color: "#eb5757", fontWeight: 600 }}>{metric.rate}</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Selection Toolbar */}
      {toolbarPosition.visible && (
        <HighlightingToolbar
          position={toolbarPosition}
          onApplyHighlight={handleApplyHighlight}
          onClose={() => setToolbarPosition((prev) => ({ ...prev, visible: false }))}
        />
      )}

      {/* Comments Drawer (Sidebar on the right) */}
      {selectedBlockId && (
        <div className="comment-sidebar animate-fade-in">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              borderBottom: "1px solid var(--notion-border)",
              paddingBottom: "8px",
            }}
          >
            <strong style={{ fontSize: "0.9rem" }}>Anotações do Bloco</strong>
            <button
              onClick={() => setSelectedBlockId(null)}
              className="toolbar-btn"
              style={{ padding: "2px" }}
            >
              Fechar
            </button>
          </div>

          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--notion-text-secondary)",
              backgroundColor: "var(--notion-sidebar-bg)",
              padding: "8px",
              borderRadius: "4px",
              marginBottom: "16px",
              border: "1px solid var(--notion-border)",
            }}
          >
            As notas adicionadas abaixo ficam vinculadas a este parágrafo específico e estarão salvas mesmo se a lei atualizar.
          </div>

          {/* Comments list */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
            {(comments[selectedBlockId] || []).length > 0 ? (
              comments[selectedBlockId].map((comment) => (
                <div key={comment.id} className="comment-card animate-fade-in">
                  <div className="comment-card-header">
                    <span>{comment.author}</span>
                    <button
                      onClick={() => handleDeleteComment(selectedBlockId, comment.id)}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: "#eb5757",
                      }}
                      title="Deletar anotação"
                    >
                      Excluir
                    </button>
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--notion-text-secondary)", marginBottom: "6px" }}>
                    {comment.date}
                  </div>
                  <div className="comment-card-body">{comment.text}</div>
                </div>
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "var(--notion-text-secondary)",
                  fontSize: "0.85rem",
                }}
              >
                Nenhuma anotação neste bloco. Escreva sua primeira nota abaixo!
              </div>
            )}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="comment-input-area">
            <textarea
              className="comment-textarea"
              placeholder="Adicionar nota pessoal de estudo (ex: súmulas vinculadas, mnemônicos...)"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              required
            />
            <button type="submit" className="notion-btn notion-btn-primary" style={{ width: "100%", padding: "6px" }}>
              Salvar Nota
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

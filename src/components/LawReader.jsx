import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { HighlightingToolbar } from "./HighlightingToolbar";
import { MessageSquare, Trash2, Tag, Info, Bookmark, Plus, Check, X, FileText } from "lucide-react";
import lawsData from "../data/lawsDemo.json";

export default function LawReader() {
  const { lawId } = useParams();
  const [searchParams] = useSearchParams();
  const focusBlockId = searchParams.get("focus");
  const bancaFilter = searchParams.get("banca");

  const [law, setLaw] = useState(null);
  const [highlights, setHighlights] = useState({});
  const [comments, setComments] = useState({});
  
  // Inline Editor State
  const [activeInlineEditorId, setActiveInlineEditorId] = useState(null);
  const [inlineNoteText, setInlineNoteText] = useState("");
  
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

  // Toggle inline editor
  const handleOpenInlineEditor = (blockId, existingText = "") => {
    setActiveInlineEditorId(blockId);
    setInlineNoteText(existingText);
  };

  // Save inline note
  const handleSaveInlineNote = (blockId) => {
    if (!inlineNoteText.trim()) {
      handleDeleteInlineNote(blockId);
      return;
    }

    const updatedComments = {
      ...comments,
      [blockId]: inlineNoteText.trim(),
    };

    setComments(updatedComments);
    localStorage.setItem(`legis_cm_${lawId}`, JSON.stringify(updatedComments));
    setActiveInlineEditorId(null);
    setInlineNoteText("");
  };

  const handleDeleteInlineNote = (blockId) => {
    const updatedComments = { ...comments };
    delete updatedComments[blockId];
    setComments(updatedComments);
    localStorage.setItem(`legis_cm_${lawId}`, JSON.stringify(updatedComments));
    setActiveInlineEditorId(null);
  };

  // Helper to render text with highlighted ranges
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
        `<span class="hl-${hl.color} font-medium px-0.5 rounded cursor-pointer" title="Remover marcando na lixeira ao lado">$1</span>`
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
              Este documento está <strong>sincronizado automaticamente</strong> com as alterações do Planalto. 
              Suas anotações e grifos ficam salvos diretamente sob cada bloco e persistem no seu navegador.
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

              const savedNote = comments[block.id]; // String note text
              const hasNote = !!savedNote;
              const hasHighlight = (highlights[block.id] || []).length > 0;
              const isEditing = activeInlineEditorId === block.id;

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
                    <div>
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
                            margin: 0,
                          }}
                        >
                          {renderTextWithHighlights(block.id, block.content)}
                        </p>

                        {/* Right hover actions for each block */}
                        <div
                          className={`block-actions ${hasNote || hasHighlight || isEditing ? "has-active-content" : ""}`}
                          style={{
                            display: "flex",
                            gap: "4px",
                          }}
                        >
                          <button
                            onClick={() => handleOpenInlineEditor(block.id, savedNote || "")}
                            className="toolbar-btn"
                            title="Adicionar anotação rápida neste artigo"
                            style={{
                              color: hasNote ? "var(--notion-accent)" : "inherit",
                            }}
                          >
                            <MessageSquare size={14} />
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

                      {/* 📝 INLINE ANNOTATION FIELD (NOTION-STYLE EDIT OR VIEW) */}
                      {isEditing && (
                        <div
                          className="animate-fade-in"
                          style={{
                            marginTop: "8px",
                            marginLeft: "20px",
                            padding: "10px",
                            backgroundColor: "var(--notion-sidebar-bg)",
                            border: "1px solid var(--notion-border)",
                            borderRadius: "var(--notion-radius-lg)",
                            boxShadow: "rgba(15, 15, 15, 0.05) 0px 2px 4px",
                          }}
                        >
                          <textarea
                            value={inlineNoteText}
                            onChange={(e) => setInlineNoteText(e.target.value)}
                            placeholder="Escreva sua anotação de estudos (súmulas vinculadas, mnemônicos, pegadinhas de prova...)"
                            style={{
                              width: "100%",
                              minHeight: "60px",
                              border: "none",
                              outline: "none",
                              background: "transparent",
                              fontFamily: "var(--notion-font-sans)",
                              fontSize: "0.85rem",
                              color: "var(--notion-text)",
                              resize: "vertical",
                            }}
                            autoFocus
                          />
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                            <button
                              onClick={() => setActiveInlineEditorId(null)}
                              className="notion-btn"
                              style={{ fontSize: "0.75rem", padding: "3px 8px" }}
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSaveInlineNote(block.id)}
                              className="notion-btn notion-btn-primary"
                              style={{ fontSize: "0.75rem", padding: "3px 8px" }}
                            >
                              <Check size={12} />
                              <span>Salvar Nota</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Display Saved Note Inline under paragraph */}
                      {hasNote && !isEditing && (
                        <div
                          className="animate-fade-in"
                          style={{
                            marginTop: "6px",
                            marginLeft: "20px",
                            padding: "8px 12px",
                            backgroundColor: "var(--notion-hl-yellow)",
                            borderLeft: "3px solid #f2c94c",
                            borderRadius: "0 var(--notion-radius) var(--notion-radius) 0",
                            fontSize: "0.85rem",
                            color: "var(--notion-text)",
                            position: "relative",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                            <div style={{ flex: 1, lineHeight: "1.4" }}>
                              <span style={{ fontSize: "0.75rem", color: "var(--notion-text-secondary)", display: "block", marginBottom: "2px", fontWeight: 600 }}>
                                ANOTAÇÃO DE ESTUDOS
                              </span>
                              {savedNote}
                            </div>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button
                                onClick={() => handleOpenInlineEditor(block.id, savedNote)}
                                className="toolbar-btn"
                                style={{ width: "22px", height: "22px", padding: 0 }}
                                title="Editar anotação"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteInlineNote(block.id)}
                                className="toolbar-btn"
                                style={{ width: "22px", height: "22px", padding: 0, color: "#eb5757" }}
                                title="Deletar anotação"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Exam highlights callout inside article */}
                  {displayMetric && (
                    <div
                      style={{
                        marginTop: "6px",
                        marginLeft: "20px",
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
    </div>
  );
}

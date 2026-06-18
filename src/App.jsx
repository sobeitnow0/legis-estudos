import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Menu, Search, FileText, Calendar, Sparkles } from "lucide-react";
import Sidebar from "./components/Sidebar";
import CommandPalette from "./components/CommandPalette";
import Dashboard from "./components/Dashboard";
import ResenhaDiaria from "./components/ResenhaDiaria";
import LawReader from "./components/LawReader";
import StudyPlans from "./components/StudyPlans";
import LandingPage from "./components/LandingPage";

function AppContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const location = useLocation();

  // Apply dark mode theme class on mount and change
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove("light-theme");
      root.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark-theme");
      root.classList.add("light-theme");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Listen to keyboard shortcuts (Ctrl+K for search, Ctrl+\ for sidebar toggle)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // If the path is /landing, render without sidebar for clean sales layout
  const isLandingPage = location.pathname === "/landing";

  if (isLandingPage) {
    return (
      <>
        <LandingPage />
        {/* Floating home button to return to workspace */}
        <div style={{ position: "fixed", bottom: "24px", left: "24px", zIndex: 100 }}>
          <Link to="/" className="notion-btn notion-btn-primary" style={{ boxShadow: "var(--notion-shadow-popover)" }}>
            <Sparkles size={16} />
            <span>Voltar ao Workspace</span>
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onSearchClick={() => setCommandPaletteOpen(true)}
      />

      {/* Floating menu button to restore sidebar if collapsed */}
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="notion-btn"
          style={{
            position: "fixed",
            top: "8px",
            left: "8px",
            zIndex: 95,
            width: "28px",
            height: "28px",
            padding: 0,
            borderRadius: "var(--notion-radius)",
          }}
          title="Abrir barra lateral (Ctrl+\)"
          id="btn-expand-sidebar"
        >
          <Menu size={16} />
        </button>
      )}

      {/* Main workspace */}
      <div className="notion-main">
        {/* Navbar */}
        <div className="notion-navbar">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--notion-text-secondary)" }}>
            <span>Workspace</span>
            <span>/</span>
            <span style={{ color: "var(--notion-text)", fontWeight: 500 }}>
              {location.pathname === "/" && "✨ Bem-vindo(a)"}
              {location.pathname === "/resenha" && "📰 Resenha Diária"}
              {location.pathname === "/planos" && "🎯 Foco de Banca"}
              {location.pathname.startsWith("/lei/") && "📖 Leitura de Legislação"}
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="toolbar-btn"
              title="Pesquisa Rápida (Ctrl+K)"
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        {/* Content routing */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/resenha" element={<ResenhaDiaria />} />
            <Route path="/lei/:lawId" element={<LawReader />} />
            <Route path="/planos" element={<StudyPlans />} />
          </Routes>
        </div>
      </div>

      {/* Command Palette search modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

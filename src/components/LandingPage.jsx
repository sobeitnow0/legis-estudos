import React, { useState } from "react";
import { ArrowRight, BookOpen, Clock, AlertTriangle, ShieldCheck, Mail, User } from "lucide-react";

export default function LandingPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email) {
      setSubmitted(true);
    }
  };

  return (
    <div style={{ backgroundColor: "var(--notion-bg)", minHeight: "100vh" }}>
      {/* Cover Image Placeholder styled as Notion cover */}
      <div
        style={{
          height: "220px",
          background: "linear-gradient(135deg, #2b3a4a 0%, #0c1520 100%)",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            right: "24px",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            color: "rgba(255,255,255,0.8)",
            fontSize: "0.75rem",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          Visualizador Público 🌐
        </div>
      </div>

      <div className="public-notion-container animate-fade-in">
        {/* Notion icon & title header */}
        <div style={{ position: "relative", marginTop: "-60px" }}>
          <div
            style={{
              fontSize: "4.5rem",
              backgroundColor: "var(--notion-bg)",
              width: "120px",
              height: "120px",
              borderRadius: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--notion-shadow)",
              border: "1px solid var(--notion-border)",
              userSelect: "none",
            }}
          >
            ⚖️
          </div>
        </div>

        <h1 style={{ marginTop: "24px", marginBottom: "8px", fontSize: "2.4rem" }}>
          Por que 78% dos Concurseiros Perdem Pontos na Lei Seca?
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.85rem",
            color: "var(--notion-text-secondary)",
            marginBottom: "32px",
            paddingBottom: "16px",
            borderBottom: "1px solid var(--notion-border)",
          }}
        >
          <span>Compartilhado publicamente</span>
          <span>•</span>
          <span>Tempo de leitura: 4 min</span>
        </div>

        {/* Mariana's Case study - Notion quote */}
        <div className="notion-callout" style={{ borderLeft: "4px solid #eb5757" }}>
          <div className="notion-callout-icon">🚨</div>
          <div className="notion-callout-content">
            <strong>O Caso de Mariana:</strong> Concurseira dedicada há 3 anos, Mariana estudou
            a lei seca por PDFs e Vade Mecums impressos. Gastou mais de <strong>R$ 1.200</strong> em
            livros de doutrina e legislação. No último concurso, ela perdeu a aprovação por 1 única
            questão — ela respondeu corretamente conforme estava grifado em seu material de estudos, mas
            a lei havia sido alterada no site do Planalto há apenas 2 meses, invalidando sua resposta.
          </div>
        </div>

        <h2 style={{ fontSize: "1.5rem", marginTop: "40px" }}>Os Três Grandes Problemas do Estudo Tradicional</h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginTop: "16px" }}>
          <div className="notion-card" style={{ cursor: "default" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <AlertTriangle style={{ color: "#eb5757" }} size={20} />
              <strong style={{ fontSize: "1rem" }}>Vade Mecum Desatualizado</strong>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--notion-text-secondary)" }}>
              Qualquer livro de legislação impresso nasce obsoleto. O congresso nacional edita centenas de emendas, leis e decretos todos os meses.
            </p>
          </div>

          <div className="notion-card" style={{ cursor: "default" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Clock style={{ color: "#f2994a" }} size={20} />
              <strong style={{ fontSize: "1rem" }}>Perda de Grifos e Notas</strong>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--notion-text-secondary)" }}>
              Quando você baixa um novo PDF de lei atualizado, perde todos os grifos e anotações feitas no arquivo antigo. Um retrabalho doloroso.
            </p>
          </div>

          <div className="notion-card" style={{ cursor: "default" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <BookOpen style={{ color: "#2f80ed" }} size={20} />
              <strong style={{ fontSize: "1rem" }}>Tempo caçando atualizações</strong>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--notion-text-secondary)" }}>
              Passar horas comparando o site do Planalto com seus resumos é improdutivo. Você deveria estar estudando, não fazendo trabalho burocrático.
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: "1.5rem", marginTop: "40px" }}>A Solução: LegisEstudos (O Vade Mecum Vivo estilo Notion)</h2>
        <p style={{ color: "var(--notion-text-secondary)", marginBottom: "20px" }}>
          Construímos um ambiente de estudos minimalista, produtivo e sem distrações, exatamente como você gosta no Notion. Mas com inteligência jurídica embutida:
        </p>

        <div className="notion-callout">
          <div className="notion-callout-icon">💡</div>
          <div className="notion-callout-content">
            <strong>Sincronização Estrutural:</strong> O texto do Vade Mecum atualiza em tempo real com o Planalto. Como salvamos suas anotações no nível do artigo (ID estrutural estável), suas marcações e comentários <strong>não desaparecem</strong> quando a lei é alterada.
          </div>
        </div>

        <div className="notion-callout">
          <div className="notion-callout-icon">📰</div>
          <div className="notion-callout-content">
            <strong>Resenha Diária Inteligente:</strong> Acompanhe todas as atualizações publicadas ontem pelo Planalto. O sistema resume e classifica automaticamente por matéria de concurso para você saber exatamente o que mudou na sua grade.
          </div>
        </div>

        <div className="notion-callout">
          <div className="notion-callout-icon">🎯</div>
          <div className="notion-callout-content">
            <strong>Filtro de Foco das Bancas:</strong> Filtre a lei para destacar visualmente apenas os artigos que já foram cobrados em provas da sua banca preferida (FGV, CESPE, VUNESP). Foco absoluto no que cai.
          </div>
        </div>

        {/* Pricing & Free trial form */}
        <h2 style={{ fontSize: "1.5rem", marginTop: "50px", borderBottom: "1px solid var(--notion-border)", paddingBottom: "8px" }}>
          Inicie Seus Estudos de Forma Inteligente
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginTop: "20px", alignItems: "start" }}>
          
          {/* Plan details */}
          <div className="notion-card" style={{ cursor: "default", backgroundColor: "var(--notion-sidebar-bg)" }}>
            <h3 style={{ margin: "0 0 8px 0" }}>Plano Premium Completo</h3>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, margin: "12px 0", color: "var(--notion-accent)" }}>
              R$ 29,90 <span style={{ fontSize: "1rem", fontWeight: 400, color: "var(--notion-text-secondary)" }}>/ mês</span>
            </div>
            <ul style={{ paddingLeft: "16px", margin: "16px 0", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Acesso a todas as Leis Federais estruturadas</li>
              <li>Grifos e anotações ilimitadas em nuvem</li>
              <li>Resenha diária das novidades do Planalto</li>
              <li>Filtros estatísticos de Bancas de Concurso</li>
              <li>Garantia incondicional de 7 dias</li>
            </ul>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--notion-text-secondary)" }}>
              <ShieldCheck size={14} style={{ color: "#27ae60" }} />
              <span>Cancelamento fácil a qualquer momento</span>
            </div>
          </div>

          {/* Form */}
          <div className="notion-card" style={{ cursor: "default" }}>
            <h3 style={{ margin: "0 0 12px 0" }}>Experimente Grátis por 7 Dias</h3>
            
            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: "4px" }}>Nome Completo</label>
                  <div style={{ position: "relative" }}>
                    <User size={14} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--notion-text-secondary)" }} />
                    <input
                      required
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 8px 8px 32px",
                        borderRadius: "var(--notion-radius)",
                        border: "1px solid var(--notion-border)",
                        outline: "none",
                        fontSize: "0.85rem",
                        backgroundColor: "var(--notion-bg)",
                        color: "var(--notion-text)"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: "4px" }}>E-mail de Acesso</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={14} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--notion-text-secondary)" }} />
                    <input
                      required
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 8px 8px 32px",
                        borderRadius: "var(--notion-radius)",
                        border: "1px solid var(--notion-border)",
                        outline: "none",
                        fontSize: "0.85rem",
                        backgroundColor: "var(--notion-bg)",
                        color: "var(--notion-text)"
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="notion-btn notion-btn-primary"
                  style={{ width: "100%", padding: "10px", fontSize: "0.95rem", marginTop: "8px" }}
                >
                  <span>Iniciar Acesso Gratuito</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎉</div>
                <h4 style={{ margin: "0 0 8px 0" }}>Cadastro Realizado!</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--notion-text-secondary)", marginBottom: "16px" }}>
                  Enviamos o convite de ativação para <strong>{email}</strong>. Seu acesso está liberado!
                </p>
                <div style={{ fontSize: "0.75rem", backgroundColor: "var(--notion-hl-green)", padding: "8px", borderRadius: "4px", color: "#196343" }}>
                  Seja bem-vindo(a) ao LegisEstudos!
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "80px",
            borderTop: "1px solid var(--notion-border)",
            padding: "24px 0",
            textAlign: "center",
            fontSize: "0.8rem",
            color: "var(--notion-text-secondary)",
          }}
        >
          © 2026 LegisEstudos — CNPJ: 00.000.000/0001-00. Feito com amor por concurseiros para concurseiros.
        </div>

      </div>
    </div>
  );
}

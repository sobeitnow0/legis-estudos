import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// You will need to install these dependencies if not already present:
// npm install @google/genai rss-parser
import { GoogleGenAI } from '@google/genai';
import Parser from 'rss-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini API
// Make sure to set GEMINI_API_KEY in your GitHub Actions secrets
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const parser = new Parser();

// RSS feed for new legislation (Example: Senado/Câmara or Planalto if available)
// This is an example feed. You can replace it with the specific Planalto/DOU feed or a scraper.
const RSS_FEED_URL = 'https://www12.senado.leg.br/noticias/feed/materias-aprovadas/sancionadas/rss.xml';

const JSON_PATH = path.join(__dirname, '..', 'src', 'data', 'resenhaUpdates.json');

async function analyzeWithGemini(title, summary) {
  try {
    const prompt = `
    Você é um professor especialista em concursos públicos (Direito Constitucional, Administrativo, Civil, etc).
    Foi publicada uma nova lei/decreto.
    
    Título: ${title}
    Ementa original: ${summary}
    
    Responda EXATAMENTE com um objeto JSON no seguinte formato, sem formatação markdown:
    {
      "summary": "Um resumo claro e direto do que essa lei faz, em até 2 frases",
      "analysis": "Uma análise de relevância para concursos públicos e o que o estudante deve focar.",
      "tag": "Uma das seguintes tags: Constitucional, Administrativo, Civil, Penal, Processo Civil, Processo Penal, Tributário, Ambiental, Direitos Humanos, Eleitoral, Trabalho, Outros",
      "color": "Escolha uma cor baseada na tag (purple, blue, green, orange)"
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao analisar com Gemini:", error);
    return null;
  }
}

async function run() {
  console.log("Iniciando sincronização diária...");
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("ERRO: GEMINI_API_KEY não configurada.");
    process.exit(1);
  }

  let currentData = [];
  try {
    const fileContent = await fs.readFile(JSON_PATH, 'utf-8');
    currentData = JSON.parse(fileContent);
  } catch (e) {
    console.log("Arquivo JSON não encontrado, criando um novo array.");
  }

  const existingIds = new Set(currentData.map(item => item.id));

  try {
    const feed = await parser.parseURL(RSS_FEED_URL);
    console.log(`Feed carregado: ${feed.title}`);

    let newItemsAdded = 0;

    // Process only the top 3 newest items to save API costs
    for (const item of feed.items.slice(0, 3)) {
      // Use the URL or guid as a unique ID
      const itemId = item.guid || item.link;
      
      if (!existingIds.has(itemId)) {
        console.log(`Nova legislação encontrada: ${item.title}`);
        
        const analysisData = await analyzeWithGemini(item.title, item.contentSnippet || item.content);
        
        if (analysisData) {
          const newEntry = {
            id: itemId,
            title: item.title,
            type: item.title.toLowerCase().includes('decreto') ? 'decreto' : (item.title.toLowerCase().includes('medida provisória') ? 'mp' : 'lei'),
            summary: analysisData.summary,
            analysis: analysisData.analysis,
            tag: analysisData.tag,
            color: analysisData.color,
            planaltoUrl: item.link,
            date: new Date(item.isoDate || item.pubDate).toISOString().split('T')[0]
          };

          currentData.unshift(newEntry);
          newItemsAdded++;
        }
      }
    }

    if (newItemsAdded > 0) {
      await fs.writeFile(JSON_PATH, JSON.stringify(currentData, null, 2));
      console.log(`${newItemsAdded} novas atualizações salvas com sucesso!`);
    } else {
      console.log("Nenhuma nova atualização encontrada hoje.");
    }

  } catch (error) {
    console.error("Erro ao buscar atualizações:", error);
    process.exit(1);
  }
}

run();

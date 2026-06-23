import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import MentionList from './MentionList';
import lawsData from '../../data/lawsDemo.json';

let cachedArticles = null;

export function invalidateMentionCache() {
  cachedArticles = null;
}

const getDynamicArticles = () => {
  if (cachedArticles) {
    return cachedArticles;
  }

  const articles = [];
  
  // 1. Load from demo data
  lawsData.laws.forEach(law => {
    law.blocks.forEach(block => {
      const cleanContent = block.content.replace(/<[^>]+>/g, '').substring(0, 60);
      articles.push({
        id: block.id,
        label: `${law.id.toUpperCase()} - ${cleanContent}...`,
        lawId: law.id
      });
    });
  });

  // 2. Load from localStorage (user imported laws)
  try {
    const savedUserLaws = localStorage.getItem("legis_user_laws") || "[]";
    const userLawsMeta = JSON.parse(savedUserLaws);
    userLawsMeta.forEach(meta => {
      const savedContent = localStorage.getItem(`legis_law_content_${meta.id}`);
      if (savedContent) {
        const fullLaw = JSON.parse(savedContent);
        if (fullLaw && fullLaw.blocks) {
          fullLaw.blocks.forEach(block => {
            const cleanContent = block.content.replace(/<[^>]+>/g, '').substring(0, 60);
            articles.push({
              id: block.id,
              label: `${meta.id.toUpperCase()} - ${cleanContent}...`,
              lawId: meta.id
            });
          });
        }
      }
    });
  } catch (e) {
    console.error("Erro ao carregar leis locais para menção:", e);
  }

  cachedArticles = articles;
  return articles;
};

export default {
  items: ({ query }) => {
    const allArticles = getDynamicArticles();
    
    // Filter matching articles from our database
    const matched = allArticles
      .filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8); // Top 8 results
      
    // Always allow the user to create a "custom" mention for external laws
    if (query.trim().length > 0) {
      matched.unshift({
        id: `custom-${Date.now()}`,
        label: `Mencionar fora da base: "${query}"`,
        // We will store the actual query as the label they want
        actualLabel: query
      });
    }

    return matched;
  },

  render: () => {
    let component;
    let popup;

    return {
      onStart: props => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props) {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }

        return component.ref?.onKeyDown(props);
      },

      onExit() {
        if (popup && popup[0]) {
          popup[0].destroy();
        }
        if (component) {
          component.destroy();
        }
      },
    };
  },
};

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Mention from '@tiptap/extension-mention';
import suggestion from './suggestion';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Undo, Redo, Scale, Lightbulb, MessageCircleQuestion, AlertCircle
} from 'lucide-react';

export default function RichTextEditor({ content, onChange, onCancel, onSave }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention-chip',
        },
        suggestion,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  // Helper to insert a special "legal block"
  const insertLegalBlock = (type) => {
    let icon = '';
    let bgColor = '';
    let borderColor = '';

    if (type === 'scale') { icon = '⚖️'; bgColor = '#f8f9fa'; borderColor = '#ced4da'; }
    else if (type === 'bulb') { icon = '💡'; bgColor = '#fffcf0'; borderColor = '#ffe066'; }
    else if (type === 'exclamation') { icon = '❗'; bgColor = '#fff5f5'; borderColor = '#ffc9c9'; }
    else if (type === 'question') { icon = '❓'; bgColor = '#f3f0ff'; borderColor = '#d0bfff'; }

    // Using blockquote with inline styles for simplicity since TipTap StarterKit supports blockquote
    editor.chain().focus().setBlockquote().run();
    
    // We can just add text to it. For a real app, a custom TipTap Node is better,
    // but blockquote styled with css works nicely for now.
    editor.commands.insertContent(` ${icon} [Anotação] `);
  };

  return (
    <div className="rich-editor-container animate-fade-in">
      {/* Editor Toolbar */}
      <div className="rich-editor-toolbar">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`} title="Negrito">
          <Bold size={15} />
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`} title="Itálico">
          <Italic size={15} />
        </button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`toolbar-btn ${editor.isActive('underline') ? 'is-active' : ''}`} title="Sublinhado">
          <UnderlineIcon size={15} />
        </button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`} title="Tachado">
          <Strikethrough size={15} />
        </button>
        
        <div className="toolbar-divider" />
        
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`} title="Lista">
          <List size={15} />
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`} title="Lista Numerada">
          <ListOrdered size={15} />
        </button>

        <div className="toolbar-divider" />

        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="toolbar-btn" title="Desfazer">
          <Undo size={15} />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="toolbar-btn" title="Refazer">
          <Redo size={15} />
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="rich-editor-content-wrapper">
        <EditorContent editor={editor} className="rich-editor-content" />
      </div>

      {/* Footer Legal Toolbar & Save Actions */}
      <div className="rich-editor-footer">
        <div className="legal-toolbar">
          <button onClick={() => insertLegalBlock('scale')} className="toolbar-btn legal-btn" title="Jurisprudência / Entendimento">
            <Scale size={16} color="#495057" />
          </button>
          <button onClick={() => insertLegalBlock('bulb')} className="toolbar-btn legal-btn" title="Dica / Macete">
            <Lightbulb size={16} color="#f59f00" />
          </button>
          <button onClick={() => insertLegalBlock('exclamation')} className="toolbar-btn legal-btn" title="Atenção / Pegadinha">
            <AlertCircle size={16} color="#e03131" />
          </button>
          <button onClick={() => insertLegalBlock('question')} className="toolbar-btn legal-btn" title="Dúvida">
            <MessageCircleQuestion size={16} color="#7048e8" />
          </button>
        </div>
        <div className="save-actions">
          {onCancel && (
            <button onClick={onCancel} className="notion-btn btn-cancel">
              Cancelar
            </button>
          )}
          {onSave && (
            <button onClick={onSave} className="notion-btn btn-save notion-btn-primary">
              Salvar Nota
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

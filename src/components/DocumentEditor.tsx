'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { useEffect, useCallback } from 'react'
import { useDocumentStore } from '@/store/documentStore'
import { EditorToolbar } from './editor/EditorToolbar'
import { SlashCommands } from './editor/SlashCommands'

interface DocumentEditorProps {
  documentId: string
  initialContent?: any
}

export default function DocumentEditor({ documentId, initialContent }: DocumentEditorProps) {
  const { updateDocument, currentDocument } = useDocumentStore()

  // Auto-save function
  const handleUpdate = useCallback(
    (content: any) => {
      if (currentDocument) {
        updateDocument(currentDocument.id, { content })
      }
    },
    [currentDocument, updateDocument]
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 underline hover:text-primary-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialContent || {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Welcome to ScribeSpace! Start typing or use "/" for commands.',
            },
          ],
        },
      ],
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none px-8 py-6 min-h-[600px]',
        spellcheck: 'true',
      },
      handleDOMEvents: {
        keydown: (view, event) => {
          // Handle slash commands
          if (event.key === '/' && view.state.selection.empty) {
            // Show slash commands menu
            return false
          }
          return false
        },
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getJSON()
      handleUpdate(content)
    },
    onCreate: ({ editor }) => {
      // Editor is ready
      console.log('Editor created')
    },
    onSelectionUpdate: ({ editor }) => {
      // Selection changed
    },
  })

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!editor) return

    const interval = setInterval(() => {
      const content = editor.getJSON()
      handleUpdate(content)
    }, 5000)

    return () => clearInterval(interval)
  }, [editor, handleUpdate])

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Floating Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor Content */}
      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="min-h-[600px] focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 rounded-lg"
        />
        
        {/* Slash Commands */}
        <SlashCommands editor={editor} />
      </div>

      {/* Word Count & Stats */}
      <div className="flex items-center justify-between px-8 py-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <span>
            {editor.storage.characterCount?.characters() || 0} characters
          </span>
          <span>
            {editor.storage.characterCount?.words() || 0} words
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs">
            Last saved: {new Date().toLocaleTimeString()}
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

// Custom extensions for enhanced functionality
const CustomExtensions = {
  // Add custom block types
  callout: {
    name: 'callout',
    group: 'block',
    content: 'paragraph+',
    defining: true,
    parseHTML() {
      return [
        {
          tag: 'div[data-type="callout"]',
        },
      ]
    },
    renderHTML({ HTMLAttributes }) {
      return [
        'div',
        {
          ...HTMLAttributes,
          'data-type': 'callout',
          class: 'callout bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 my-4',
        },
        0,
      ]
    },
  },

  // Code block with syntax highlighting
  codeBlockHighlight: {
    name: 'codeBlockHighlight',
    group: 'block',
    content: 'text*',
    marks: '',
    code: true,
    defining: true,
    isolating: true,
    parseHTML() {
      return [
        {
          tag: 'pre',
          preserveWhitespace: 'full',
        },
      ]
    },
    renderHTML({ HTMLAttributes }) {
      return [
        'pre',
        {
          ...HTMLAttributes,
          class: 'bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto',
        },
        ['code', 0],
      ]
    },
  },

  // Math equation support
  mathInline: {
    name: 'mathInline',
    group: 'inline',
    inline: true,
    atom: true,
    parseHTML() {
      return [
        {
          tag: 'span[data-type="math-inline"]',
        },
      ]
    },
    renderHTML({ HTMLAttributes }) {
      return [
        'span',
        {
          ...HTMLAttributes,
          'data-type': 'math-inline',
          class: 'math-inline bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-sm',
        },
        0,
      ]
    },
  },
}
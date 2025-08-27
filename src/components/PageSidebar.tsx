'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { 
  FileText, 
  Image, 
  Trash2, 
  GripVertical, 
  Plus,
  Eye,
  EyeOff
} from 'lucide-react'
import { useDocumentStore } from '@/store/documentStore'
import type { Page } from '@/store/documentStore'

export function PageSidebar() {
  const { 
    currentDocument, 
    deletePage, 
    reorderPages, 
    addBlankPage 
  } = useDocumentStore()
  
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)

  if (!currentDocument) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No document loaded
      </div>
    )
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const pages = Array.from(currentDocument.pages)
    const [reorderedPage] = pages.splice(result.source.index, 1)
    pages.splice(result.destination.index, 0, reorderedPage)

    const pageIds = pages.map(page => page.id)
    reorderPages(pageIds)
  }

  const handleDeletePage = (pageId: string) => {
    if (currentDocument.pages.length <= 1) {
      alert('Cannot delete the last page')
      return
    }
    
    if (confirm('Are you sure you want to delete this page?')) {
      deletePage(pageId)
    }
  }

  const scrollToPage = (pageId: string) => {
    const element = document.getElementById(`page-${pageId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setSelectedPageId(pageId)
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Pages ({currentDocument.pages.length})
          </h3>
          <button
            onClick={addBlankPage}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Add new page"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-2">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="pages">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {currentDocument.pages
                  .sort((a, b) => a.order - b.order)
                  .map((page, index) => (
                    <Draggable key={page.id} draggableId={page.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`
                            group relative bg-gray-50 dark:bg-gray-700 rounded-lg border-2 transition-all duration-200
                            ${selectedPageId === page.id 
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                            }
                            ${snapshot.isDragging ? 'shadow-lg scale-105' : ''}
                          `}
                        >
                          {/* Page Preview */}
                          <div 
                            className="p-3 cursor-pointer"
                            onClick={() => scrollToPage(page.id)}
                          >
                            <div className="flex items-start space-x-3">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                <GripVertical size={14} />
                              </div>

                              {/* Page Icon */}
                              <div className="flex-shrink-0 mt-0.5">
                                {page.type === 'pdf' ? (
                                  <Image size={16} className="text-red-500" />
                                ) : (
                                  <FileText size={16} className="text-blue-500" />
                                )}
                              </div>

                              {/* Page Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                    Page {index + 1}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {page.type.toUpperCase()}
                                  </span>
                                </div>
                                
                                {/* Page Preview Content */}
                                <div className="mt-1">
                                  {page.type === 'pdf' ? (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {page.metadata?.pdfSource && (
                                        <span>PDF Page {page.metadata.pageNumber}</span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                      {getPagePreviewText(page)}
                                    </div>
                                  )}
                                </div>

                                {/* Page Thumbnail */}
                                <div className="mt-2 h-16 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                                  {page.type === 'pdf' ? (
                                    <Image size={20} className="text-gray-400" />
                                  ) : (
                                    <div className="text-xs text-gray-400 text-center px-2">
                                      {getPagePreviewText(page) || 'Empty page'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Page Actions */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Toggle page visibility
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                title="Toggle visibility"
                              >
                                <Eye size={12} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeletePage(page.id)
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                                title="Delete page"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>Document: {currentDocument.title}</div>
          <div>
            Size: {currentDocument.settings.pageSize} - {currentDocument.settings.orientation}
          </div>
          <div>
            Updated: {new Date(currentDocument.metadata.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
}

function getPagePreviewText(page: Page): string {
  try {
    if (page.content?.content) {
      const firstParagraph = page.content.content.find((node: any) => 
        node.type === 'paragraph' && node.content && node.content.length > 0
      )
      
      if (firstParagraph && firstParagraph.content) {
        const text = firstParagraph.content
          .filter((node: any) => node.type === 'text')
          .map((node: any) => node.text)
          .join('')
        
        return text.length > 50 ? text.substring(0, 50) + '...' : text
      }
    }
  } catch (error) {
    console.error('Error getting page preview:', error)
  }
  
  return 'Empty page'
}
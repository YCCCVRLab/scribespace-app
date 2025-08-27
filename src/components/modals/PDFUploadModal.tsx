'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload, FileText, Check } from 'lucide-react'
import { useDocumentStore } from '@/store/documentStore'

interface PDFUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PDFUploadModal({ isOpen, onClose }: PDFUploadModalProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [pdfPages, setPdfPages] = useState<any[]>([])
  
  const { addPdfPage } = useDocumentStore()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setIsProcessing(true)
      
      try {
        // Here you would process the PDF and extract pages
        // For now, we'll simulate this
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock PDF pages
        const mockPages = Array.from({ length: 5 }, (_, i) => ({
          pageNumber: i + 1,
          thumbnail: null, // Would be actual thumbnail
          text: `Page ${i + 1} content preview...`
        }))
        
        setPdfPages(mockPages)
        setSelectedPages([1]) // Select first page by default
      } catch (error) {
        console.error('Error processing PDF:', error)
      } finally {
        setIsProcessing(false)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  const handlePageToggle = (pageNumber: number) => {
    setSelectedPages(prev => 
      prev.includes(pageNumber)
        ? prev.filter(p => p !== pageNumber)
        : [...prev, pageNumber]
    )
  }

  const handleInsertPages = () => {
    if (pdfFile && selectedPages.length > 0) {
      selectedPages.forEach(pageNumber => {
        const pageData = {
          file: pdfFile,
          pageNumber,
          // Add more PDF data as needed
        }
        addPdfPage(pageData, pageNumber)
      })
      
      onClose()
      setPdfFile(null)
      setSelectedPages([])
      setPdfPages([])
    }
  }

  const handleClose = () => {
    onClose()
    setPdfFile(null)
    setSelectedPages([])
    setPdfPages([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Insert PDF Pages
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!pdfFile ? (
            /* Upload Area */
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {isDragActive ? 'Drop your PDF here' : 'Upload PDF Document'}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Drag and drop a PDF file here, or click to browse
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Supports PDF files up to 50MB
              </p>
            </div>
          ) : (
            /* PDF Pages Selection */
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FileText size={24} className="text-red-500" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {pdfFile.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB • {pdfPages.length} pages
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPdfFile(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Choose different file
                </button>
              </div>

              {isProcessing ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Processing PDF...
                  </span>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Select pages to insert ({selectedPages.length} selected):
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedPages(pdfPages.map(p => p.pageNumber))}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300">•</span>
                      <button
                        onClick={() => setSelectedPages([])}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    {pdfPages.map((page) => (
                      <div
                        key={page.pageNumber}
                        className={`
                          relative border-2 rounded-lg p-3 cursor-pointer transition-all
                          ${selectedPages.includes(page.pageNumber)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }
                        `}
                        onClick={() => handlePageToggle(page.pageNumber)}
                      >
                        {/* Page Thumbnail */}
                        <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded mb-2 flex items-center justify-center">
                          <FileText size={32} className="text-gray-400" />
                        </div>
                        
                        {/* Page Info */}
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Page {page.pageNumber}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {page.text}
                          </p>
                        </div>

                        {/* Selection Indicator */}
                        {selectedPages.includes(page.pageNumber) && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {pdfFile && !isProcessing && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInsertPages}
              disabled={selectedPages.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 rounded-md transition-colors"
            >
              Insert {selectedPages.length} Page{selectedPages.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
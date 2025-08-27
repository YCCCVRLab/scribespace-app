'use client'

import { useDocumentStore } from '@/store/documentStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '../ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { 
  FileText, 
  Upload, 
  Template, 
  Zap,
  Users,
  Download,
  Palette
} from 'lucide-react'

export const WelcomeScreen = () => {
  const { createDocument, templates } = useDocumentStore()
  const { openModal } = useUIStore()

  const handleCreateDocument = async () => {
    try {
      await createDocument('Untitled Document')
    } catch (error) {
      console.error('Failed to create document:', error)
    }
  }

  const features = [
    {
      icon: FileText,
      title: 'Rich Text Editor',
      description: 'Notion-style block editor with inline tools and slash commands'
    },
    {
      icon: Upload,
      title: 'PDF Integration',
      description: 'Import PDF pages with OCR text extraction for searchability'
    },
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description: 'Work together with live cursors, comments, and suggestions'
    },
    {
      icon: Download,
      title: 'Multi-format Export',
      description: 'Export to PDF, ePub, HTML, Markdown, and Word formats'
    },
    {
      icon: Template,
      title: 'Templates',
      description: 'Start with pre-built templates for various document types'
    },
    {
      icon: Zap,
      title: 'Auto-save',
      description: 'Never lose your work with automatic saving every 2 seconds'
    }
  ]

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto p-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to ScribeSpace
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            The all-in-one document creation platform that bridges the gap between note-taking and professional publishing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleCreateDocument}>
              <FileText className="mr-2 h-5 w-5" />
              Create New Document
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => openModal('templateGallery')}
            >
              <Template className="mr-2 h-5 w-5" />
              Browse Templates
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => openModal('pdfImport')}
            >
              <Upload className="mr-2 h-5 w-5" />
              Import PDF
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Start Templates */}
        {templates.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Quick Start Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.slice(0, 8).map((template) => (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={async () => {
                    try {
                      await createDocument(template.name, template.id)
                    } catch (error) {
                      console.error('Failed to create document from template:', error)
                    }
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Template className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm font-medium truncate">
                        {template.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs line-clamp-2">
                      {template.description}
                    </CardDescription>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {template.category}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Getting Started */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to get started?</CardTitle>
            <CardDescription className="text-blue-100">
              Create your first document or explore our templates to see what ScribeSpace can do.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="secondary" 
                onClick={handleCreateDocument}
              >
                <FileText className="mr-2 h-4 w-4" />
                Start Writing
              </Button>
              <Button 
                variant="outline" 
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => openModal('templateGallery')}
              >
                <Template className="mr-2 h-4 w-4" />
                Explore Templates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Blog } from '@/lib/types'
import { slugify } from '@/lib/slugify'
import { BlogEditor } from '@/components/admin/BlogEditor'
import { sanitizeEditorHtml } from '@/lib/sanitizeHtml'
import { uploadBlogImage } from '@/lib/helper'

interface BlogModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (blog: Blog) => void
  blog?: Blog
}

export function BlogModal({ isOpen, onClose, onSave, blog }: BlogModalProps) {
  const [formData, setFormData] = useState<Partial<Blog>>(
    blog || {
      title: '',
      slug: { current: '' },
      mainImage: '',
      blogcategories: [{ title: '' }],
      publishedAt: new Date().toISOString().split('T')[0],
      author: { name: '' },
      body: '',
    }
  )

  if (!isOpen) return null

  const isBodyEmpty = (html: string) =>
    !html || html.replace(/<[^>]*>/g, '').trim().length === 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isBodyEmpty(formData.body || '')) {
      alert('Blog content is required')
      return
    }

    const newBlog: Blog = {
      _id: formData._id || `blog-${Date.now()}`,
      title: formData.title || '',
      slug: {
        current:
          formData.slug?.current ||
          slugify(formData.title || ''),
      },
      mainImage: formData.mainImage || '',
      blogcategories: formData.blogcategories || [{ title: 'Uncategorized' }],
      publishedAt: formData.publishedAt || new Date().toISOString(),
      author: formData.author || { name: 'Anonymous' },
      body: sanitizeEditorHtml(formData.body || ''),
    }
    onSave(newBlog)
  }

  // Uploads inserted/pasted/dragged images to Firebase Storage and returns
  // the permanent public URL, so blog content images persist across
  // sessions and are visible to every visitor, not just this browser tab.
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      return await uploadBlogImage(file)
    } catch (error) {
      alert('Image upload failed. Please try again.')
      throw error
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-900">
            {blog ? 'Edit Blog' : 'Add Blog'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Blog Title *
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter blog title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Author Name *
              </label>
              <input
                type="text"
                value={formData.author?.name || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    author: { name: e.target.value },
                  })
                }
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter author name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Published Date *
              </label>
              <input
                type="date"
                value={formData.publishedAt?.split('T')[0] || ''}
                onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Main Image URL
            </label>
            <input
              type="text"
              value={formData.mainImage || ''}
              onChange={(e) => setFormData({ ...formData, mainImage: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Category *
            </label>
            <input
              type="text"
              value={formData.blogcategories?.[0]?.title || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  blogcategories: [{ title: e.target.value }],
                })
              }
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Skincare Tips, Routine"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Blog Content *
            </label>
            <BlogEditor
              value={formData.body || ''}
              onChange={(html) => setFormData({ ...formData, body: html })}
              onImageUpload={handleImageUpload}
              placeholder="Write your blog content here..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
            >
              {blog ? 'Update' : 'Create'} Blog
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
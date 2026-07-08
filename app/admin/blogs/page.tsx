'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { DataTable } from '@/components/admin/DataTable'
import { Blog } from '@/lib/types'
import { blogs as mockBlogs } from '@/lib/mockData'
import { BlogModal } from '@/components/admin/BlogModal'

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>(mockBlogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)

  const filteredBlogs = blogs.filter((b) =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog)
    setIsModalOpen(true)
  }

  const handleDelete = (blog: Blog) => {
    if (confirm(`Delete "${blog.title}"?`)) {
      setBlogs(blogs.filter((b) => b._id !== blog._id))
      alert('Blog deleted')
    }
  }

  const handleSaveBlog = (blog: Blog) => {
    if (selectedBlog) {
      setBlogs(blogs.map((b) => (b._id === blog._id ? blog : b)))
      alert('Blog updated')
    } else {
      setBlogs([...blogs, blog])
      alert('Blog added')
    }
    setIsModalOpen(false)
    setSelectedBlog(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Blogs</h1>
          <p className="text-slate-600 mt-1">Manage blog posts</p>
        </div>
        <button
          onClick={() => {
            setSelectedBlog(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
        >
          <Plus size={20} />
          New Blog
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <DataTable
        data={filteredBlogs}
        columns={[
          {
            key: 'title',
            label: 'Blog Title',
            render: (_, item) => (
              <div className="flex items-center gap-3">
                <img
                  src={item.mainImage}
                  alt={item.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.slug.current}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'author',
            label: 'Author',
            render: (value) => value.name,
          },
          {
            key: 'publishedAt',
            label: 'Published',
            render: (value) => new Date(value).toLocaleDateString(),
          },
          {
            key: 'blogcategories',
            label: 'Category',
            render: (value) => (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                {value[0]?.title || 'Uncategorized'}
              </span>
            ),
          },
        ]}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <BlogModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedBlog(null)
        }}
        onSave={handleSaveBlog}
        blog={selectedBlog || undefined}
      />
    </div>
  )
}

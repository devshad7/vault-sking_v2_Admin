'use client'

import { useState } from 'react'
import { Save, X } from 'lucide-react'
import { Announcement } from '@/lib/types'
import { announcement as mockAnnouncement } from '@/lib/mockData'

export default function AnnouncementsPage() {
  const [announcement, setAnnouncement] = useState<Announcement>(mockAnnouncement)
  const [isEditing, setIsEditing] = useState(false)
  const [tempAnnouncement, setTempAnnouncement] = useState<Announcement>(mockAnnouncement)

  const handleEdit = () => {
    setTempAnnouncement(announcement)
    setIsEditing(true)
  }

  const handleSave = () => {
    setAnnouncement(tempAnnouncement)
    setIsEditing(false)
    alert('Announcement updated successfully')
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const emojis = ['✨', '🎉', '⭐', '🔥', '💎', '🚀', '💥', '🌟', '📢', '📣']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Announcements</h1>
        <p className="text-slate-600 mt-1">
          Manage site-wide announcements and promotions
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-8 max-w-2xl">
        {!isEditing ? (
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-6">
              <p className="text-center text-lg font-medium text-slate-900">
                <span className="text-2xl mr-2">{announcement.emoji}</span>
                {announcement.text}
              </p>
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Announcement Text</p>
                <p className="text-slate-900 font-medium mt-1">{announcement.text}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Emoji</p>
                <p className="text-3xl mt-1">{announcement.emoji}</p>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={handleEdit}
              className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
            >
              Edit Announcement
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Form */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Announcement Text *
              </label>
              <textarea
                value={tempAnnouncement.text}
                onChange={(e) =>
                  setTempAnnouncement({ ...tempAnnouncement, text: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your announcement message"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">
                Select Emoji
              </label>
              <div className="grid grid-cols-5 gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() =>
                      setTempAnnouncement({ ...tempAnnouncement, emoji })
                    }
                    className={`p-4 text-2xl border-2 rounded-lg transition-all ${
                      tempAnnouncement.emoji === emoji
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-6">
              <p className="text-center text-lg font-medium text-slate-900">
                <span className="text-2xl mr-2">{tempAnnouncement.emoji}</span>
                {tempAnnouncement.text || 'Your announcement preview'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
              >
                <Save size={18} />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl">
        <h3 className="font-semibold text-blue-900 mb-2">💡 About Announcements</h3>
        <p className="text-sm text-blue-800">
          Announcements appear at the top of your store and are visible to all customers.
          Use them to highlight promotions, important updates, or special offers.
        </p>
      </div>
    </div>
  )
}

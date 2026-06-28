'use client'

import React, { useState, useRef } from 'react'
import { UploadCloud, Loader2, Image as ImageIcon, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface FileUploadProps {
  value: string
  onChange: (url: string) => void
  bucket?: string
}

export function FileUpload({ value, onChange, bucket = 'menu-items' }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      onChange(publicUrlData.publicUrl)
    } catch (error: any) {
      alert('Error uploading file: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0])
    }
  }

  return (
    <div className="w-full">
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50 flex items-center justify-center">
          {value.match(/\.(mp4|webm|ogg)$/i) ? (
            <video src={value} controls className="w-full h-full object-cover" />
          ) : (
            <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
          )}
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            dragActive ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-300 hover:border-emerald-400 bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*"
            onChange={handleChange}
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-sm text-gray-500 font-medium">Uploading...</p>
              </>
            ) : (
              <>
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <UploadCloud className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG, GIF or MP4 (max. 10MB)</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

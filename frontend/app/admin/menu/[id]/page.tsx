'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageLoader, TeaSteamLoader } from '@/components/ui/Loading'
import { api } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { FileUpload } from '@/components/ui/FileUpload'

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const language = useAppStore((s) => s.language)
  const resolvedParams = use(params)
  const isNew = resolvedParams.id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    nameUz: '', nameRu: '', nameEn: '',
    descriptionUz: '', descriptionRu: '', descriptionEn: '',
    ingredientsUz: '', ingredientsRu: '', ingredientsEn: '',
    price: 0, weight: '', calories: 0, cookingTime: 0,
    imageUrl: '', categoryId: '',
    isAvailable: true, isVegetarian: false, isSpicy: false, isPopular: false, isChefPick: false, isSpecial: false
  })

  useEffect(() => {
    api.getCategories(language).then(setCategories).catch(console.error)
    if (!isNew) {
      api.getProduct(resolvedParams.id, language) // wait, getProduct gets by slug, not id! Oh, we have getProduct by ID too: /api/products/id/:id
        .then(() => fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/products/id/${resolvedParams.id}?lang=${language}`).then(r => r.json()))
        .then((data) => {
          if (data && !data.error) {
            setFormData({ ...formData, ...data })
          }
        })
        .finally(() => setLoading(false))
    }
  }, [resolvedParams.id, isNew, language])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        calories: Number(formData.calories),
        cookingTime: Number(formData.cookingTime),
        slug: formData.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4)
      }
      if (isNew) {
        await api.createProduct(payload)
      } else {
        await api.updateProduct(resolvedParams.id, payload)
      }
      router.push('/admin')
    } catch (err) {
      console.error(err)
      alert('Error saving product')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <main className="min-h-screen px-4 pt-6 pb-20 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-text-muted mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Admin
      </button>

      <h1 className="font-serif text-3xl mb-6">{isNew ? 'New Product' : 'Edit Product'}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-card rounded-[20px] p-4 shadow-soft space-y-3">
          <h2 className="font-semibold">General</h2>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Category</label>
            <select
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 bg-cream rounded-xl outline-none"
              required
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Image / Video</label>
            <FileUpload 
              value={formData.imageUrl} 
              onChange={(url) => setFormData({ ...formData, imageUrl: url })} 
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Price (UZS)</label>
              <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full px-3 py-2 bg-cream rounded-xl outline-none" required />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Cooking Time (min)</label>
              <input type="number" value={formData.cookingTime} onChange={e => setFormData({ ...formData, cookingTime: Number(e.target.value) })} className="w-full px-3 py-2 bg-cream rounded-xl outline-none" required />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-[20px] p-4 shadow-soft space-y-3">
          <h2 className="font-semibold">Names</h2>
          <input placeholder="Name (Uzbek)" value={formData.nameUz} onChange={e => setFormData({ ...formData, nameUz: e.target.value })} className="w-full px-3 py-2 bg-cream rounded-xl outline-none" required />
          <input placeholder="Name (Russian)" value={formData.nameRu} onChange={e => setFormData({ ...formData, nameRu: e.target.value })} className="w-full px-3 py-2 bg-cream rounded-xl outline-none" required />
          <input placeholder="Name (English)" value={formData.nameEn} onChange={e => setFormData({ ...formData, nameEn: e.target.value })} className="w-full px-3 py-2 bg-cream rounded-xl outline-none" required />
        </div>

        <div className="bg-card rounded-[20px] p-4 shadow-soft space-y-3">
          <h2 className="font-semibold">Descriptions</h2>
          <textarea placeholder="Desc (Uzbek)" value={formData.descriptionUz} onChange={e => setFormData({ ...formData, descriptionUz: e.target.value })} className="w-full px-3 py-2 bg-cream rounded-xl outline-none" />
          <textarea placeholder="Desc (Russian)" value={formData.descriptionRu} onChange={e => setFormData({ ...formData, descriptionRu: e.target.value })} className="w-full px-3 py-2 bg-cream rounded-xl outline-none" />
          <textarea placeholder="Desc (English)" value={formData.descriptionEn} onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })} className="w-full px-3 py-2 bg-cream rounded-xl outline-none" />
        </div>

        <div className="bg-card rounded-[20px] p-4 shadow-soft space-y-2">
          <h2 className="font-semibold mb-2">Flags</h2>
          {['isAvailable', 'isPopular', 'isChefPick', 'isVegetarian', 'isSpicy'].map((flag) => (
            <label key={flag} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={(formData as any)[flag]} onChange={e => setFormData({ ...formData, [flag]: e.target.checked })} className="accent-walnut" />
              {flag}
            </label>
          ))}
        </div>

        <Button variant="emerald" fullWidth size="lg" type="submit" disabled={submitting}>
          {submitting ? <TeaSteamLoader size="sm" /> : 'Save Product'}
        </Button>
      </form>
    </main>
  )
}

'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Users, Upload, X } from 'lucide-react'

type ProfileForm = {
  full_name: string
  department: string
  project: string
  role: string
  location: string
  acknowledger_name: string
  approval_name: string
  signature_url: string
}

const emptyForm: ProfileForm = {
  full_name: '',
  department: '',
  project: '',
  role: '',
  location: '',
  acknowledger_name: '',
  approval_name: '',
  signature_url: '',
}

export default function ProfileSetupPage() {
  const [form, setForm] = useState<ProfileForm>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingSignature, setUploadingSignature] = useState(false)
  const signatureInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (data) setForm({
        full_name:        data.full_name || '',
        department:       data.department || '',
        project:          data.project || '',
        role:             data.role || '',
        location:         data.location || '',
        acknowledger_name: data.acknowledger_name || '',
        approval_name:    data.approval_name || '',
        signature_url:    data.signature_url || '',
      })
    }
    loadProfile()
  }, [])

  function handleChange(field: keyof ProfileForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

async function handleSignatureUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0]
  if (!file) return

  // Validasi ukuran file maks 2MB
  if (file.size > 2 * 1024 * 1024) {
    alert('Ukuran file maksimal 2MB')
    return
  }

  setUploadingSignature(true)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    setUploadingSignature(false)
    return
  }

  const ext = file.name.split('.').pop()
  const filePath = `signatures/${user.id}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('timelab-assets')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    alert(`Gagal upload: ${uploadError.message}`)
    setUploadingSignature(false)
    return
  }

  const { data: urlData } = supabase.storage
    .from('timelab-assets')
    .getPublicUrl(filePath)

  // Tambahkan cache buster agar gambar langsung refresh
  const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`

  setForm(prev => ({ ...prev, signature_url: publicUrl }))
  setUploadingSignature(false)

  // Reset input agar file yang sama bisa diupload ulang
  e.target.value = ''
}

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    setLoading(false)
    return
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(
      { id: user.id, ...form },
      { onConflict: 'id' }
    )

  if (error) {
    console.error('Save error:', error)
    alert(`Gagal menyimpan: ${error.message}`)
    setLoading(false)
    return
  }

  setLoading(false)
  setSaved(true)
  setTimeout(() => router.push('/dashboard'), 1000)
}

  const profileFields: { key: keyof ProfileForm; label: string; placeholder: string }[] = [
    { key: 'full_name',  label: 'Full Name',       placeholder: 'Nama lengkap' },
    { key: 'department', label: 'Department',       placeholder: 'e.g. Engineering' },
    { key: 'project',    label: 'Project',          placeholder: 'e.g. TimeLab v1' },
    { key: 'role',       label: 'Role / Position',  placeholder: 'e.g. Frontend Developer' },
    { key: 'location',   label: 'Location',         placeholder: 'e.g. Jakarta' },
  ]

  const approverFields: { key: keyof ProfileForm; label: string; placeholder: string }[] = [
    { key: 'acknowledger_name', label: 'Acknowledger Name', placeholder: 'Nama team leader' },
    { key: 'approval_name',     label: 'Approval Name',     placeholder: 'Nama yang menyetujui' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Profile Setup</h1>
        <p className="text-sm text-gray-500 mt-1">
          Data ini akan ditampilkan di header timesheet saat export PDF.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Section 1: Profile ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
              <User size={14} className="text-blue-600" />
            </div>
            <h2 className="text-sm font-semibold text-gray-800">Informasi Profil</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profileFields.map(({ key, label, placeholder }) => (
              <div key={key} className={key === 'full_name' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {label}
                  {key === 'full_name' && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={e => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  required={key === 'full_name'}
                  className="w-full border border-gray-200 text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            ))}
          </div>

          {/* Upload Signature */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Signature
            </label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="w-40 h-20 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                {form.signature_url ? (
                  <img
                    src={form.signature_url}
                    alt="Signature"
                    className="max-w-full max-h-full object-contain p-1"
                  />
                ) : (
                  <span className="text-xs text-gray-500 text-center px-2">
                    Belum ada tanda tangan
                  </span>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => signatureInputRef.current?.click()}
                  disabled={uploadingSignature}
                  className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  <Upload size={12} />
                  {uploadingSignature ? 'Mengupload...' : 'Upload Gambar'}
                </button>
                {form.signature_url && (
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, signature_url: '' }))}
                    className="flex items-center gap-2 border border-red-100 rounded-lg px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition"
                  >
                    <X size={12} />
                    Hapus
                  </button>
                )}
                <p className="text-xs text-gray-400">PNG/JPG, maks 2MB</p>
              </div>
            </div>
            <input
              ref={signatureInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleSignatureUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* ── Section 2: Approver ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users size={14} className="text-purple-600" />
            </div>
            <h2 className="text-sm font-semibold text-gray-800">Informasi Approver</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {approverFields.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={e => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-lg px-3 text-gray-500 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tombol aksi */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Kembali
          </button>
          <button
            type="submit"
            disabled={loading || saved}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saved ? '✓ Tersimpan!' : loading ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </div>
      </form>
    </div>
  )
}
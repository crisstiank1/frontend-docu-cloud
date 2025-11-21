<template>
  <section class="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-transparent">
    <div class="container mx-auto py-12 px-6 md:px-8">
      <!-- Header -->
      <div class="mb-12">
        <span class="inline-block text-primary font-semibold text-sm tracking-widest uppercase mb-4">Demo en vivo</span>
        <h1 class="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Prueba DocuCloud</h1>
        <p class="text-foreground/60 mt-4 text-lg max-w-2xl">Sube documentos, añade metadatos, filtra por criterios y comparte con contraseña. Todo se guarda localmente para esta demostración.</p>
      </div>

      <!-- Upload Section -->
      <div class="rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-8 mb-12 cursor-pointer transition-all hover:border-primary/60 hover:bg-primary/10" @drop.prevent="onDrop" @dragover.prevent @dragenter.prevent>
        <input type="file" ref="fileInput" multiple @change="onUpload" class="hidden" />
        <div class="flex flex-col items-center justify-center gap-4 text-center" @click="fileInput?.click()">
          <div class="rounded-full bg-gradient-to-br from-primary/20 to-accent/20 p-4">
            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p class="text-lg font-semibold">Arrastra archivos aquí</p>
            <p class="text-sm text-foreground/60 mt-1">o haz clic para seleccionar (máx. 2MB por archivo)</p>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-2xl border border-primary/10 shadow-sm mb-8 overflow-hidden">
        <div class="p-6 border-b border-primary/10">
          <h2 class="text-lg font-bold flex items-center gap-2">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filtros
          </h2>
        </div>
        <div class="p-6 grid gap-4 md:grid-cols-5">
          <div class="md:col-span-2">
            <label class="text-sm font-semibold text-foreground mb-2 block">Búsqueda</label>
            <input v-model="q" placeholder="Por nombre o etiqueta..." class="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div>
            <label class="text-sm font-semibold text-foreground mb-2 block">Categoría</label>
            <input v-model="categoria" placeholder="Ej: Facturas" class="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div>
            <label class="text-sm font-semibold text-foreground mb-2 block">Cliente</label>
            <input v-model="cliente" placeholder="Nombre del cliente" class="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-sm font-semibold text-foreground mb-2 block">Desde</label>
              <input type="date" v-model="fechaDesde" class="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground mb-2 block">Hasta</label>
              <input type="date" v-model="fechaHasta" class="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
          </div>
        </div>
      </div>

      <!-- Documents List -->
      <div v-if="filtered.length > 0" class="grid gap-6">
        <div v-for="d in filtered" :key="d.id" class="group rounded-2xl border border-primary/10 bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all overflow-hidden">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-start gap-4 flex-1">
                <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary flex-shrink-0 font-bold text-sm">
                  {{ d.type ? d.type.split('/')[1].substring(0, 3).toUpperCase() : 'DOC' }}
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-lg">{{ d.name }}</p>
                  <p class="text-xs text-foreground/60 mt-1">{{ d.type || 'Documento' }} · {{ bytes(d.size) }} · {{ new Date(d.createdAt).toLocaleDateString('es-ES') }}</p>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-4 mb-4">
              <div class="grid gap-3 md:grid-cols-4">
                <div>
                  <label class="text-xs font-semibold text-foreground/60 uppercase block mb-1">Categoría</label>
                  <input v-model="d.meta.categoria" placeholder="Ej: Factura" class="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-foreground/60 uppercase block mb-1">Cliente</label>
                  <input v-model="d.meta.cliente" placeholder="Nombre" class="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-foreground/60 uppercase block mb-1">Etiquetas</label>
                  <input :value="(d.meta.etiquetas||[]).join(', ')" @input="e=>setTags(d, (e.target as HTMLInputElement).value)" placeholder="Separadas por coma" class="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-foreground/60 uppercase block mb-1">Fecha</label>
                  <input type="date" v-model="d.meta.fecha" class="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all" />
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 mb-4">
              <span v-for="tag in (d.meta.etiquetas||[])" :key="tag" class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary/20 to-accent/20 text-primary">
                <span>#</span><span>{{ tag }}</span>
              </span>
            </div>

            <div class="flex flex-wrap gap-2">
              <a v-if="d.dataUrl" :download="d.name" :href="d.dataUrl" class="inline-flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-semibold text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Descargar
              </a>
              <button @click="openShare(d)" class="inline-flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:shadow-primary/25 transition-all font-semibold text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4.243 4.242a4 4 0 105.656 5.656l4.243-4.242m0-5.656a4 4 0 015.656 0l4.243 4.242a4 4 0 01-5.656 5.656l-4.243-4.242" /></svg>
                Compartir
              </button>
              <button @click="removeDoc(d.id)" class="inline-flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors font-semibold text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="rounded-full bg-gradient-to-br from-primary/20 to-accent/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
        <p class="text-xl font-semibold text-foreground">No hay documentos</p>
        <p class="text-foreground/60 mt-2">Sube tu primer documento usando el área de carga arriba</p>
      </div>
    </div>

    <!-- Share Modal -->
    <div v-if="share.open" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl border border-primary/10 w-full max-w-md shadow-2xl overflow-hidden">
        <div class="p-6 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-accent/5">
          <h3 class="text-xl font-bold">Compartir con contraseña</h3>
          <p class="text-sm text-foreground/60 mt-1">Genera un enlace único protegido para compartir este documento</p>
        </div>
        <div class="p-6 grid gap-4">
          <div>
            <label class="text-sm font-semibold mb-2 block">Contraseña</label>
            <input type="password" v-model="share.password" placeholder="Ingresa una contraseña" class="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <button @click="generate()" class="inline-flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4.243 4.242a4 4 0 105.656 5.656l4.243-4.242m0-5.656a4 4 0 015.656 0l4.243 4.242a4 4 0 01-5.656 5.656l-4.243-4.242" /></svg>
            Generar enlace
          </button>
          <div v-if="share.link" class="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p class="text-xs font-semibold text-foreground/60 uppercase mb-2">Enlace generado</p>
            <!-- Use computed property to avoid TypeScript error -->
            <router-link :to="getSharePath" class="text-primary font-mono text-xs underline break-all">{{ share.link }}</router-link>
            <p class="text-xs text-foreground/60 mt-3">📌 Demo local. El enlace funcionará en este dispositivo.</p>
          </div>
        </div>
        <div class="p-4 border-t border-primary/10 bg-primary/5 flex justify-end gap-2">
          <button @click="share.open = false" class="inline-flex items-center justify-center rounded-lg h-10 px-6 border border-input bg-background hover:bg-accent text-foreground font-semibold transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { sha256 } from '../utils/crypto'

interface DocMeta { categoria?: string; cliente?: string; etiquetas?: string[]; fecha?: string }
interface StoredDoc { id: string; name: string; size: number; type: string; createdAt: number; meta: DocMeta; dataUrl?: string }

const STORAGE_KEY = 'docucloud_docs_v1'
const docs = ref<StoredDoc[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

try {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) docs.value = JSON.parse(raw)
} catch {}

watch(docs, (v) => localStorage.setItem(STORAGE_KEY, JSON.stringify(v)), { deep: true })

const q = ref('')
const categoria = ref('')
const cliente = ref('')
const fechaDesde = ref('')
const fechaHasta = ref('')

function bytes(n: number) {
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0, v = n
  while (v > 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(1)} ${units[i]}`
}

function setTags(d: StoredDoc, str: string) {
  d.meta.etiquetas = str.split(',').map((s) => s.trim()).filter(Boolean)
}

const filtered = computed(() =>
  docs.value.filter((d) => {
    const qok =
      !q.value ||
      d.name.toLowerCase().includes(q.value.toLowerCase()) ||
      (d.meta.etiquetas || []).some((e) => e.toLowerCase().includes(q.value.toLowerCase()))
    const cok = !categoria.value || d.meta.categoria === categoria.value
    const clok = !cliente.value || (d.meta.cliente || '').toLowerCase().includes(cliente.value.toLowerCase())
    const date = new Date(d.meta.fecha || d.createdAt).getTime()
    const dok = !fechaDesde.value || date >= new Date(fechaDesde.value).getTime()
    const hok = !fechaHasta.value || date <= new Date(fechaHasta.value).getTime()
    return qok && cok && clok && dok && hok
  })
)

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

async function onUpload(ev: Event) {
  const input = ev.target as HTMLInputElement
  const files = input.files
  if (!files) return
  const list: StoredDoc[] = []
  for (const file of Array.from(files)) {
    if (file.size > 2 * 1024 * 1024) continue
    const dataUrl = await fileToDataUrl(file)
    list.push({ id: crypto.randomUUID(), name: file.name, size: file.size, type: file.type, createdAt: Date.now(), meta: {}, dataUrl })
  }
  docs.value = [...list, ...docs.value]
  input.value = ''
}

async function onDrop(ev: DragEvent) {
  const files = ev.dataTransfer?.files
  if (!files) return
  const input = document.createElement('input')
  input.type = 'file'
  Object.defineProperty(input, 'files', { value: files })
  await onUpload({ target: input } as any)
}

const share = reactive({ open: false, password: '', link: '' as string | null, doc: null as null | StoredDoc })
function openShare(d: StoredDoc) {
  share.doc = d
  share.password = ''
  share.link = null
  share.open = true
}
async function generate() {
  if (!share.doc || !share.password) return
  const token = await sha256(share.password + ':' + share.doc.id)
  const url = new URL(window.location.origin + '/share/' + encodeURIComponent(share.doc.id))
  url.searchParams.set('token', token)
  share.link = url.toString()
}
function removeDoc(id: string) {
  docs.value = docs.value.filter((d) => d.id !== id)
}

// Computed property to get route path avoiding TypeScript error with window in template
const getSharePath = computed(() => {
  if (!share.link) return '/'
  try {
    const url = new URL(share.link)
    return url.pathname + url.search
  } catch {
    return '/'
  }
})
</script>

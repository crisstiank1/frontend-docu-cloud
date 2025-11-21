<template>
  <section class="container mx-auto py-10 px-6 md:px-8">
    <div v-if="!doc" class="rounded-lg border max-w-xl mx-auto">
      <div class="p-6 border-b">
        <h1 class="text-xl font-semibold">Documento no disponible</h1>
        <p class="text-sm text-muted-foreground">Esta es una demostración local. El enlace sólo funciona en el dispositivo donde se generó.</p>
      </div>
      <div class="p-6">
        <router-link to="/demo" class="text-primary underline">Volver a la demo</router-link>
      </div>
    </div>

    <div v-else>
      <div v-if="!granted" class="rounded-lg border max-w-md mx-auto">
        <div class="p-6 border-b">
          <h1 class="text-xl font-semibold">Acceso al documento</h1>
          <p class="text-sm text-muted-foreground">Ingresa la contraseña para ver y descargar el documento compartido.</p>
        </div>
        <div class="p-6 grid gap-3">
          <input type="password" v-model="password" placeholder="Contraseña" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
          <button class="inline-flex items-center justify-center rounded-md h-10 px-4 bg-primary text-primary-foreground" @click="submit">Acceder</button>
        </div>
      </div>

      <div v-else class="rounded-lg border max-w-2xl mx-auto">
        <div class="p-6 border-b">
          <h1 class="text-xl font-semibold">{{ doc.name }}</h1>
          <p class="text-sm text-muted-foreground">{{ doc.type || 'Documento' }} · {{ bytes(doc.size) }}</p>
        </div>
        <div class="p-6 grid gap-3 text-sm">
          <div class="grid md:grid-cols-4 gap-3">
            <p><span class="text-muted-foreground">Categoría:</span> {{ doc.meta.categoria || '—' }}</p>
            <p><span class="text-muted-foreground">Cliente:</span> {{ doc.meta.cliente || '—' }}</p>
            <p><span class="text-muted-foreground">Fecha:</span> {{ doc.meta.fecha || '—' }}</p>
            <p class="col-span-1 md:col-span-1"><span class="text-muted-foreground">Etiquetas:</span> {{ (doc.meta.etiquetas||[]).join(', ') || '—' }}</p>
          </div>
          <a v-if="doc.dataUrl" :download="doc.name" :href="doc.dataUrl" class="inline-flex items-center justify-center rounded-md h-10 px-4 bg-secondary">Descargar</a>
          <router-link to="/demo" class="text-primary underline">Volver a la demo</router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { sha256 } from '../utils/crypto'

interface DocMeta { categoria?: string; cliente?: string; etiquetas?: string[]; fecha?: string }
interface StoredDoc { id: string; name: string; size: number; type: string; createdAt: number; meta: DocMeta; dataUrl?: string }

const STORAGE_KEY = 'docucloud_docs_v1'
function bytes(n: number) { const units = ['B','KB','MB','GB']; let i=0,v=n; while(v>1024&&i<units.length-1){v/=1024;i++;} return `${v.toFixed(1)} ${units[i]}` }

const route = useRoute()
const id = route.params.id as string
const token = (route.query.token as string) || ''

const doc = computed<StoredDoc | undefined>(() => {
  try { const raw = localStorage.getItem(STORAGE_KEY); const arr: StoredDoc[] = raw ? JSON.parse(raw) : []; return arr.find(d=>d.id===id) } catch { return undefined }
})

const password = ref('')
const granted = ref(false)
const error = ref<string | null>(null)

async function submit() {
  error.value = null
  const t = await sha256(password.value + ':' + id)
  if (t === token) granted.value = true
  else error.value = 'Contraseña incorrecta'
}
</script>

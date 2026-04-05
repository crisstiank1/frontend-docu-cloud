<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    @click.self="handleClose"
  >
    <div
      class="w-full max-w-lg rounded-2xl border bg-background p-6 shadow-2xl"
      @click.stop
    >
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-xl font-bold">Subir Archivos</h2>
        <button
          :disabled="isUploading"
          class="rounded-lg p-2 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          @click="handleClose"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div
        class="relative cursor-pointer rounded-xl border-2 border-dashed border-primary/30 p-12 text-center transition-all hover:border-primary/60"
        :class="[
          isDragging ? 'border-primary bg-primary/5' : '',
          isUploading ? 'pointer-events-none opacity-70' : '',
        ]"
        @click="!isUploading && fileInput?.click()"
        @drop.prevent="onDrop"
        @dragover.prevent
        @dragenter="onDragEnter"
        @dragleave="onDragLeave"
      >
        <div class="mb-4 text-5xl">📁</div>
        <p class="mb-2 text-lg font-semibold">Arrastra archivos aquí</p>
        <p class="mb-4 text-sm text-muted-foreground">o haz clic para seleccionar</p>
        <p class="text-xs text-muted-foreground">
          Máximo {{ MAX_SIZE_MB }} MB por archivo
        </p>

        <input
          ref="fileInput"
          type="file"
          multiple
          class="hidden"
          @change="onFileChange"
        />
      </div>

      <div v-if="sizeErrors.length > 0" class="mt-3 space-y-1">
        <div
          v-for="err in sizeErrors"
          :key="err"
          class="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          <svg class="mt-0.5 h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
          <span>{{ err }} supera el límite de {{ MAX_SIZE_MB }} MB y fue omitido</span>
        </div>
      </div>

      <div v-if="isUploading || uploadProgress > 0" class="mt-6">
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium">
            {{ isUploading ? "Subiendo..." : "Completado" }}
          </span>
          <span class="text-sm font-semibold text-primary">{{ uploadProgress }}%</span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            class="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            :style="{ width: `${uploadProgress}%` }"
          />
        </div>
      </div>

      <div
        v-if="uploadedFiles.length > 0"
        class="mt-6 max-h-48 space-y-2 overflow-y-auto"
      >
        <div
          v-for="(file, index) in uploadedFiles"
          :key="getFileKey(file)"
          class="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
        >
          <img
            v-if="previewUrls.get(getFileKey(file))"
            :src="previewUrls.get(getFileKey(file))"
            :alt="file.name"
            class="h-10 w-10 flex-shrink-0 rounded object-cover"
          />

          <img
            v-else-if="getFileIconUrl(file.type)"
            :src="getFileIconUrl(file.type)!"
            :alt="file.type"
            class="h-10 w-10 flex-shrink-0 rounded object-contain"
          />

          <div
            v-else
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-muted text-xl"
          >
            📎
          </div>

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ file.name }}</p>
            <p class="text-xs text-muted-foreground">{{ formatFileSize(file.size) }}</p>
          </div>

          <button
            :disabled="isUploading"
            class="flex-shrink-0 rounded p-1 text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
            @click="removeFile(index)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="mt-6 flex gap-3">
        <button
          :disabled="isUploading"
          class="h-11 flex-1 rounded-lg border font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          @click="handleClose"
        >
          Cancelar
        </button>

        <button
          v-if="uploadedFiles.length > 0"
          :disabled="isUploading"
          class="h-11 flex-1 rounded-lg bg-primary font-medium text-primary-foreground transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          @click="confirmUpload"
        >
          {{ isUploading ? "Subiendo..." : `Subir ${uploadedFiles.length} archivo${uploadedFiles.length !== 1 ? 's' : ''}` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";

interface BatchUploadResult {
  successCount: number;
  failedCount: number;
  uploadedIds: number[];
}

interface Props {
  modelValue: boolean;
  currentFolderId?: string | null;
  uploadBatchFn?: (
    files: File[],
    folderId?: string | null,
    onProgress?: (completed: number, total: number) => void,
  ) => Promise<BatchUploadResult>;
  uploadFn?: (file: File, folderId?: string | null) => Promise<unknown>;
}

const props = withDefaults(defineProps<Props>(), {
  currentFolderId: null,
  uploadBatchFn: undefined,
  uploadFn: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  uploaded: [];
}>();

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const fileInput = ref<HTMLInputElement | null>(null);
const uploadedFiles = ref<File[]>([]);
const uploadProgress = ref(0);
const isUploading = ref(false);
const isDragging = ref(false);
const previewUrls = ref<Map<string, string>>(new Map());
const sizeErrors = ref<string[]>([]);

const FILE_ICON = {
  pdf: "/icons/pdf.png",
  word: "/icons/word.png",
  excel: "/icons/excel.png",
  powerpoint: "/icons/powerpoint.png",
};

function getFileIconUrl(type: string): string | null {
  if (type.includes("pdf")) return FILE_ICON.pdf;
  if (type.includes("word") || type.includes("wordprocessingml")) return FILE_ICON.word;
  if (type.includes("excel") || type.includes("spreadsheet")) return FILE_ICON.excel;
  if (type.includes("powerpoint") || type.includes("presentation")) return FILE_ICON.powerpoint;
  return null;
}

function getFileKey(file: File): string {
  return `${file.name}__${file.size}__${file.lastModified}`;
}

function createPreview(file: File) {
  if (!file.type.startsWith("image/")) return;
  const key = getFileKey(file);
  if (previewUrls.value.has(key)) return;

  const objectUrl = URL.createObjectURL(file);
  previewUrls.value = new Map(previewUrls.value).set(key, objectUrl);
}

function revokePreview(file: File) {
  const key = getFileKey(file);
  const url = previewUrls.value.get(key);
  if (url) {
    URL.revokeObjectURL(url);
    const next = new Map(previewUrls.value);
    next.delete(key);
    previewUrls.value = next;
  }
}

function validateAndAdd(files: File[]) {
  sizeErrors.value = [];

  const valid: File[] = [];
  const oversized: string[] = [];
  const existing = new Set(uploadedFiles.value.map(getFileKey));

  for (const file of files) {
    const key = getFileKey(file);

    if (file.size > MAX_SIZE_BYTES) {
      oversized.push(`"${file.name}" (${formatFileSize(file.size)})`);
      continue;
    }

    if (existing.has(key)) {
      continue;
    }

    existing.add(key);
    valid.push(file);
    createPreview(file);
  }

  if (oversized.length > 0) {
    sizeErrors.value = oversized;
  }

  uploadedFiles.value.push(...valid);
}

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (!files) return;

  validateAndAdd(Array.from(files));

  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

function onDrop(e: DragEvent) {
  if (isUploading.value) return;
  isDragging.value = false;

  if (!e.dataTransfer?.files) return;
  validateAndAdd(Array.from(e.dataTransfer.files));
}

function onDragEnter() {
  if (isUploading.value) return;
  isDragging.value = true;
}

function onDragLeave() {
  isDragging.value = false;
}

function removeFile(index: number) {
  if (isUploading.value) return;

  const file = uploadedFiles.value[index];
  if (!file) return;

  revokePreview(file);
  uploadedFiles.value.splice(index, 1);
}

async function uploadSequentialFallback() {
  let successCount = 0;
  const total = uploadedFiles.value.length;

  for (let i = 0; i < total; i++) {
    const file = uploadedFiles.value[i];
    const result = await props.uploadFn?.(file, props.currentFolderId);

    if (result) {
      successCount++;
    }

    uploadProgress.value = Math.round(((i + 1) / total) * 100);
  }

  return {
    successCount,
    failedCount: total - successCount,
    uploadedIds: [],
  };
}

async function confirmUpload() {
  if (!uploadedFiles.value.length || isUploading.value) return;

  isUploading.value = true;
  uploadProgress.value = 0;
  sizeErrors.value = [];

  try {
    let result: BatchUploadResult | null = null;

    if (props.uploadBatchFn) {
      uploadProgress.value = 5;

      result = await props.uploadBatchFn(
        uploadedFiles.value,
        props.currentFolderId,
        (completed, total) => {
          if (total <= 0) {
            uploadProgress.value = 0;
            return;
          }

          uploadProgress.value = Math.max(
            uploadProgress.value,
            Math.round((completed / total) * 100),
          );
        },
      );
    } else if (props.uploadFn) {
      result = await uploadSequentialFallback();
    }

    uploadProgress.value = 100;

    if (result && result.successCount > 0) {
      emit("uploaded");
      setTimeout(() => resetModal(), 400);
    }
  } catch (err) {
    console.error("Error al subir archivos:", err);
  } finally {
    isUploading.value = false;
  }
}

function clearAllPreviews() {
  for (const url of previewUrls.value.values()) {
    URL.revokeObjectURL(url);
  }
  previewUrls.value = new Map();
}

function resetModal() {
  clearAllPreviews();
  uploadedFiles.value = [];
  uploadProgress.value = 0;
  sizeErrors.value = [];
  isDragging.value = false;

  if (fileInput.value) {
    fileInput.value.value = "";
  }

  emit("update:modelValue", false);
}

function handleClose() {
  if (isUploading.value) return;
  resetModal();
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

onBeforeUnmount(() => {
  clearAllPreviews();
});
</script>
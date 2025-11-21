<template>
  <div>
    <!-- Hero -->
    <section id="inicio" class="relative overflow-hidden">
      <div aria-hidden class="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/5" />
      <div aria-hidden class="pointer-events-none absolute top-0 right-0 w-96 h-96 bg-accent/30 rounded-full blur-3xl opacity-50" />
      <div aria-hidden class="pointer-events-none absolute bottom-0 left-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl opacity-50" />

      <div class="container mx-auto grid lg:grid-cols-2 gap-12 py-20 md:py-32 px-6 md:px-8 relative z-10">
        <div class="flex flex-col justify-center">
          <span class="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-xs font-semibold text-primary bg-primary/5 backdrop-blur w-fit">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" clip-rule="evenodd" /></svg>
            PWA · Monolito-modular · Medellín
          </span>
          <h1 class="mt-6 text-5xl md:text-7xl font-black tracking-tight leading-tight bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">DocuCloud</h1>
          <p class="text-2xl md:text-3xl font-bold text-foreground mt-2">Gestión documental segura para PYMES</p>
          <p class="mt-6 text-foreground/70 text-lg leading-relaxed">Plataforma web para almacenamiento, clasificación, búsqueda avanzada y transferencia segura de documentos en la nube. Arquitectura lista para escalar con experiencia PWA fluida.</p>
          <div class="mt-8 flex flex-wrap gap-4">
            <router-link to="/demo" class="inline-flex items-center justify-center gap-2 rounded-lg h-12 px-8 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 transform hover:-translate-y-0.5">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Prueba Ahora
            </router-link>
            <a href="#caracteristicas" class="inline-flex items-center justify-center gap-2 rounded-lg h-12 px-8 border-2 border-primary/30 bg-primary/5 text-foreground font-semibold hover:border-primary/60 hover:bg-primary/10 transition-all duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              Ver características
            </a>
          </div>
          <div class="mt-10 grid gap-3 text-sm font-medium">
            <div class="flex items-center gap-3"><div class="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent" /><span>✓ Autenticación JWT</span></div>
            <div class="flex items-center gap-3"><div class="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent" /><span>✓ Carga a AWS S3</span></div>
            <div class="flex items-center gap-3"><div class="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent" /><span>✓ Búsqueda avanzada</span></div>
            <div class="flex items-center gap-3"><div class="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent" /><span>✓ Colaboración segura</span></div>
          </div>
        </div>
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-8 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-3xl blur-3xl opacity-60" aria-hidden />
          <div class="relative w-full aspect-square max-w-sm rounded-3xl border-2 border-primary/20 shadow-2xl overflow-hidden bg-white/80 backdrop-blur p-4">
            <img src="/Logo2.png" alt="Vista previa de DocuCloud" class="w-full h-full object-contain" />
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="caracteristicas" class="relative py-20 md:py-32 px-6 md:px-8">
      <div aria-hidden class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 to-accent/5" />
      <div class="container mx-auto relative z-10">
        <div class="text-center mb-16">
          <span class="inline-block text-primary font-semibold text-sm tracking-widest uppercase mb-4">Características</span>
          <h2 class="text-4xl md:text-5xl font-black tracking-tight">Todo lo que necesitas para tus documentos</h2>
          <p class="mt-4 text-foreground/60 text-lg max-w-2xl mx-auto">El MVP valida la viabilidad técnica para optimizar procesos, mitigar riesgos y mejorar la productividad</p>
        </div>

        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div v-for="(f, i) in features" :key="f.t" class="group relative rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-accent/5 p-8 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-1">
            <div class="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
              <component :is="`svg`" v-if="i === 0" class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></component>
              <component :is="`svg`" v-else-if="i === 1" class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></component>
              <component :is="`svg`" v-else-if="i === 2" class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></component>
              <component :is="`svg`" v-else class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4.243 4.242a4 4 0 105.656 5.656l4.243-4.242m0-5.656a4 4 0 015.656 0l4.243 4.242a4 4 0 01-5.656 5.656l-4.243-4.242" /></component>
            </div>
            <h3 class="text-lg font-bold text-foreground">{{ f.t }}</h3>
            <p class="text-sm text-foreground/60 mt-3">{{ f.d }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Architecture + CTA -->
    <section class="relative overflow-hidden py-20 md:py-32 px-6 md:px-8">
      <div aria-hidden class="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
      <div aria-hidden class="pointer-events-none absolute top-1/2 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-40 -translate-y-1/2" />

      <div class="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <span class="inline-block text-primary font-semibold text-sm tracking-widest uppercase mb-4">Arquitectura</span>
          <h3 class="text-4xl md:text-5xl font-black tracking-tight">Monolito-modular<br />lista para escalar</h3>
          <p class="text-foreground/60 mt-4 text-lg">Código limpio y mantenible con módulos desacoplados para autenticación, almacenamiento y búsqueda. Preparado para microservicios cuando sea necesario.</p>
          <ul class="mt-8 grid gap-4 text-sm font-medium">
            <li class="flex items-start gap-3">
              <svg class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              <span>API modular lista para expandir</span>
            </li>
            <li class="flex items-start gap-3">
              <svg class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              <span>Vue 3 + TailwindCSS 3 + TypeScript</span>
            </li>
            <li class="flex items-start gap-3">
              <svg class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              <span>PWA con soporte offline básico</span>
            </li>
          </ul>
          <div class="mt-8">
            <router-link to="/demo" class="inline-flex items-center justify-center gap-2 rounded-lg h-12 px-8 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 transform hover:-translate-y-0.5">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1m2-1v2.5M2 7l2-1m-2 1l2 1m-2-1v2.5" /></svg>
              Ir a Prueba Ahora
            </router-link>
          </div>
        </div>
        <div class="relative">
          <div class="absolute -inset-10 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl opacity-60" aria-hidden />
          <div class="relative z-10 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-8 backdrop-blur">
            <div class="grid gap-4">
              <div class="group rounded-xl bg-white/50 p-4 hover:bg-white/80 transition-all cursor-pointer">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">🔐</div>
                    <div>
                      <p class="font-semibold text-sm">JWT</p>
                      <p class="text-xs text-foreground/60">Seguridad</p>
                    </div>
                  </div>
                  <svg class="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
              <div class="group rounded-xl bg-white/50 p-4 hover:bg-white/80 transition-all cursor-pointer">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">☁️</div>
                    <div>
                      <p class="font-semibold text-sm">S3</p>
                      <p class="text-xs text-foreground/60">Escalabilidad</p>
                    </div>
                  </div>
                  <svg class="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
              <div class="group rounded-xl bg-white/50 p-4 hover:bg-white/80 transition-all cursor-pointer">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">🔍</div>
                    <div>
                      <p class="font-semibold text-sm">Search</p>
                      <p class="text-xs text-foreground/60">Productividad</p>
                    </div>
                  </div>
                  <svg class="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
              <div class="group rounded-xl bg-white/50 p-4 hover:bg-white/80 transition-all cursor-pointer">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">🔗</div>
                    <div>
                      <p class="font-semibold text-sm">Share</p>
                      <p class="text-xs text-foreground/60">Colaboración</p>
                    </div>
                  </div>
                  <svg class="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const features = [
  { t: 'Autenticación JWT', d: 'Sesiones seguras, simples y escalables' },
  { t: 'Carga a AWS S3', d: 'Almacenamiento robusto y confiable' },
  { t: 'Búsqueda avanzada', d: 'Filtros por metadatos y texto' },
  { t: 'Compartir con contraseña', d: 'Enlaces únicos protegidos' },
]
</script>

<template>
  <div>
    <!-- ══════════════════════════════════════════
         Sección Hero
    ══════════════════════════════════════════ -->
    <section id="inicio" class="relative overflow-hidden">
      <!-- Fondos decorativos -->
      <div aria-hidden class="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/5" />
      <div aria-hidden class="pointer-events-none absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-accent/30 rounded-full blur-3xl opacity-50" />
      <div aria-hidden class="pointer-events-none absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-primary/30 rounded-full blur-3xl opacity-50" />

      <div class="container mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 py-16 md:py-24 lg:py-32 px-4 sm:px-6 md:px-8 relative z-10">

        <!-- Columna izquierda: texto principal -->
        <div class="flex flex-col justify-center order-2 lg:order-1">
          <!-- Badge -->
          <span class="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-xs font-semibold text-primary bg-primary/5 backdrop-blur w-fit">
            Plataforma web de gestión de archivos · Medellín 🇨🇴
          </span>

          <!-- CORREGIDO: tamaños mobile-first, sin desbordamiento en 375px -->
          <h1 class="mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-tight bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            DocuCloud
          </h1>
          <p class="text-lg sm:text-xl md:text-2xl font-bold text-foreground mt-2">
            Organiza, accede y comparte archivos.
          </p>
          <p class="mt-4 text-foreground/70 text-base md:text-lg leading-relaxed max-w-prose">
            Plataforma web para almacenar, clasificar y compartir archivos de forma
            segura en la nube. Diseñada para que los equipos de trabajo dejen atrás el
            desorden, la duplicidad de archivos y los riesgos que genera trabajar sin un
            sistema centralizado.
          </p>

          <!-- Botones de acción -->
          <div class="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a
              href="#caracteristicas"
              class="inline-flex items-center justify-center gap-2 rounded-lg h-12 px-6 md:px-8 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 text-sm md:text-base"
            >
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Ver características
            </a>
            <router-link
              to="/auth/login"
              class="inline-flex items-center justify-center gap-2 rounded-lg h-12 px-6 md:px-8 border-2 border-primary/30 bg-primary/5 text-foreground font-semibold hover:border-primary/60 hover:bg-primary/10 transition-all duration-200 text-sm md:text-base"
            >
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h12.5M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
              Iniciar sesión
            </router-link>
          </div>

          <!-- Beneficios clave -->
          <div class="mt-8 grid gap-2.5 text-sm font-medium">
            <div v-for="benefit in benefits" :key="benefit" class="flex items-center gap-3">
              <div class="w-2 h-2 shrink-0 rounded-full bg-gradient-to-r from-primary to-accent" />
              <span>✓ {{ benefit }}</span>
            </div>
          </div>
        </div>

        <!-- Columna derecha: logo — va arriba en móvil -->
        <div class="relative flex items-center justify-center order-1 lg:order-2">
          <div class="absolute -inset-8 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-3xl blur-3xl opacity-60" aria-hidden />
          <!-- CORREGIDO: max-w adaptable, no fijo a sm -->
          <div class="relative w-full aspect-square max-w-[260px] sm:max-w-xs md:max-w-sm rounded-3xl border-2 border-primary/20 shadow-2xl overflow-hidden bg-background/80 backdrop-blur p-4">
            <img :src="logoImg" alt="Logo de DocuCloud" class="w-full h-full object-contain" />
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         Sección Características
    ══════════════════════════════════════════ -->
    <section id="caracteristicas" class="relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 md:px-8">
      <div aria-hidden class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 to-accent/5" />

      <div class="container mx-auto relative z-10">
        <div class="text-center mb-10 md:mb-16">
          <span class="inline-block text-primary font-semibold text-sm tracking-widest uppercase mb-4">Características</span>
          <!-- CORREGIDO: text-2xl base → escala hacia arriba -->
          <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
            Todo lo que necesitas para gestionar tus archivos
          </h2>
          <p class="mt-4 text-foreground/60 text-base md:text-lg max-w-2xl mx-auto">
            Cada módulo fue diseñado para resolver un problema real: desorden, inseguridad, pérdida de tiempo y archivos duplicados
          </p>
        </div>

        <!-- CORREGIDO: 1 col → 2 col → 4 col. El ícono viene del dato, no del índice -->
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="group relative rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-accent/5 p-6 md:p-8 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="mb-4 inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
              <!-- CORREGIDO: SVG como componente funcional desde los datos -->
              <svg class="w-6 h-6 md:w-7 md:h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="feature.iconPath" />
              </svg>
            </div>
            <h3 class="text-base md:text-lg font-bold text-foreground">{{ feature.title }}</h3>
            <p class="text-sm text-foreground/60 mt-2 md:mt-3">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         Sección ¿Por qué DocuCloud? + CTA
    ══════════════════════════════════════════ -->
    <section class="relative overflow-hidden py-16 md:py-24 lg:py-32 px-4 sm:px-6 md:px-8">
      <div aria-hidden class="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
      <div aria-hidden class="pointer-events-none absolute top-1/2 right-0 w-64 md:w-96 h-64 md:h-96 bg-accent/20 rounded-full blur-3xl opacity-40 -translate-y-1/2" />

      <div class="container mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">

        <!-- Columna izquierda: texto + CTA -->
        <div>
          <span class="inline-block text-primary font-semibold text-sm tracking-widest uppercase mb-4">¿Por qué DocuCloud?</span>
          <!-- CORREGIDO: text-2xl base -->
          <h3 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
            Deja atrás el caos de archivos en tu empresa
          </h3>
          <p class="text-foreground/60 mt-4 text-base md:text-lg max-w-prose">
            Muchos equipos gestionan sus archivos con herramientas dispersas: correos sin control, límites de tamaño, archivos duplicados y cero trazabilidad. DocuCloud unifica todo en un sistema seguro, ordenado y listo para crecer contigo.
          </p>

          <ul class="mt-6 md:mt-8 grid gap-3 md:gap-4 text-sm font-medium">
            <li v-for="point in keyPoints" :key="point" class="flex items-start gap-3">
              <svg class="w-5 h-5 text-primary shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>{{ point }}</span>
            </li>
          </ul>

          <div class="mt-8">
            <router-link
              to="/auth/login"
              class="inline-flex items-center justify-center gap-2 rounded-lg h-12 px-8 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 text-sm md:text-base"
            >
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h12.5M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
              Comenzar Ahora
            </router-link>
          </div>
        </div>

        <!-- Columna derecha: tarjetas de módulos -->
        <div class="relative mt-8 lg:mt-0">
          <div class="absolute -inset-6 md:-inset-10 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl opacity-60" aria-hidden />
          <div class="relative z-10 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-5 md:p-8 backdrop-blur">
            <div class="grid gap-3 md:gap-4">
              <!-- CORREGIDO: bg-background/50 en lugar de bg-white/50 (respeta modo oscuro) -->
              <div
                v-for="module in moduleCards"
                :key="module.title"
                class="group rounded-xl bg-background/50 p-3 md:p-4 hover:bg-background/80 transition-all cursor-pointer"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {{ module.emoji }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-sm truncate">{{ module.title }}</p>
                      <p class="text-xs text-foreground/60 truncate">{{ module.subtitle }}</p>
                    </div>
                  </div>
                  <svg class="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
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
import logoImg from '../assets/Logo2.png'

// ─── Datos del componente ────────────────────────────────────────────────────

// CORREGIDO: beneficios como array de strings (sin repetir estructura en template)
const benefits = [
  'Acceso seguro con roles diferenciados para cada miembro del equipo',
  'Tus archivos organizados automáticamente desde el primer día',
  'Encuentra cualquier archivo en menos de 2 segundos',
  'Comparte con enlaces protegidos por contraseña y fecha de vencimiento',
]

// CORREGIDO: ícono movido a los datos (iconPath = SVG path string)
// Ahora el template es genérico: solo itera y pinta, sin v-if por índice
const features = [
  {
    title: 'Acceso con roles',
    description: 'Administrador o usuario estándar — cada persona ve y hace solo lo que le corresponde, sin riesgo de accesos indebidos',
    iconPath: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  {
    title: 'Almacenamiento en la nube',
    description: 'Sube archivos PDF, Word, imágenes y más hasta 50 MB. Todo queda en la nube, respaldado y vinculado a tu cuenta',
    iconPath: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
  },
  {
    title: 'Clasificación automática',
    description: 'El sistema lee el nombre y los metadatos de cada archivo y le asigna una categoría al instante — sin que tengas que hacer nada',
    iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  {
    title: 'Compartir sin perder el control',
    description: 'Genera enlaces únicos con contraseña y fecha de caducidad. Tú decides quién accede y por cuánto tiempo',
    iconPath: 'M13.828 10.172a4 4 0 00-5.656 0l-4.243 4.242a4 4 0 105.656 5.656l4.243-4.242m0-5.656a4 4 0 015.656 0l4.243 4.242a4 4 0 01-5.656 5.656l-4.243-4.242',
  },
]

// CORREGIDO: puntos clave como array de strings
const keyPoints = [
  'Soporta más de 1.000 usuarios simultáneos y escala sin que tengas que cambiar de herramienta',
  'Funciona desde cualquier dispositivo sin instalar nada — celular, tablet o computador',
  'Consulta tus archivos aunque no tengas señal — se sincroniza automáticamente al reconectarte',
]

// CORREGIDO: tarjetas de módulos como datos estructurados
const moduleCards = [
  { emoji: '☁️', title: '99.9% disponibilidad',    subtitle: 'Acceso garantizado 24/7' },
  { emoji: '⚡', title: 'Búsqueda en 2 segundos', subtitle: 'Encuentra todo al instante' },
  { emoji: '🔗', title: 'Comparte seguro',         subtitle: 'Tú decides quién accede' },
]
</script>
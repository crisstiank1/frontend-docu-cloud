module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{vue,ts}"],
  theme: {
    extend: {
      // ─── Colores del sistema de diseño (CSS variables) ──────────────────────
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      // ─── Radios de borde ─────────────────────────────────────────────────────
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // ─── Sistema de z-index ───────────────────────────────────────────────────
      // Escala semántica para DocuCloud. Cada capa tiene un nombre claro.
      // Uso: class="z-overlay", class="z-sidebar", class="z-header", etc.
      //
      // REGLA: nunca uses z-10, z-20, z-50 sueltos en el código.
      //        Siempre usa estos nombres para que sea predecible y fácil de mantener.
      //
      //  Capa              Valor    Quién la usa
      //  ────────────────  ───────  ──────────────────────────────────────────────
      //  base              0        Contenido normal de página
      //  overlay           20       Fondo oscuro semitransparente del sidebar móvil
      //  sidebar           30       Panel lateral (Sidebar.vue)
      //  header            40       Header sticky (App.vue) — debe tapar el overlay
      //  dropdown          9999     Dropdowns con Teleport (SearchBar, selects, etc.)
      //  modal             10000    Modales (DocumentViewerModal, UploadModal, etc.)
      //  toast             10001    Notificaciones (Toaster de vue-sonner)
      zIndex: {
        base: "0",
        overlay: "20",
        sidebar: "30",
        header: "40",
        dropdown: "9999",
        modal: "10000",
        toast: "10001",
      },
    },
  },
  plugins: [],
};

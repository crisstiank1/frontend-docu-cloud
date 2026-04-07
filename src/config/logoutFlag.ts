// Archivo independiente y sin dependencias — rompe el ciclo circular entre
// api.ts y useAuth.ts al centralizar la bandera en un módulo neutro.
import { ref } from "vue";

export const isLoggingOut = ref(false);

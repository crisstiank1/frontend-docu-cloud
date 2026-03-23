import { ref, watch, onMounted } from "vue";

const isDark = ref(false);

export function useTheme() {
  function applyTheme(dark: boolean) {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }

  function toggleTheme() {
    isDark.value = !isDark.value;
    applyTheme(isDark.value);
  }

  function initTheme() {
    const saved = localStorage.getItem("theme");
    // ✅ Si no hay preferencia guardada → modo claro por defecto
    isDark.value = saved === "dark";
    applyTheme(isDark.value);
  }

  watch(isDark, applyTheme);

  return { isDark, toggleTheme, initTheme };
}

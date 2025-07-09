// Gestión de temas y estilos

// Las funciones básicas de tema ya están en utils.js
// Este archivo puede usarse para funcionalidad adicional de temas

// ==========================================
// FUNCIONES ADICIONALES DE TEMA
// ==========================================

// Función para obtener el tema actual
function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

// Función para aplicar tema específico
function applyTheme(themeName) {
  if (themeName === 'light' || themeName === 'dark') {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
  }
}

// Función para alternar entre temas
function cycleThemes() {
  const current = getCurrentTheme();
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
}

// Detectar preferencia del sistema
function detectSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

// Auto-aplicar tema del sistema si no hay preferencia guardada
function autoApplySystemTheme() {
  if (!localStorage.getItem('theme')) {
    const systemTheme = detectSystemTheme();
    applyTheme(systemTheme);
  }
}

// Escuchar cambios en la preferencia del sistema
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}
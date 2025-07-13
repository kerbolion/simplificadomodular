// ==========================================
// EVENTOS E INICIALIZACIÓN ACTUALIZADA
// ==========================================

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  // Cargar funciones y proyectos
  functions.load();
  functions.init();
  projects.init();
  
  // Inicializar ordenamiento global automáticamente (SIEMPRE ACTIVO)
  initializeGlobalOrdering();
  
  // Renderizar todo
  renderAll();
  
  // Después de un breve delay, inicializar UI del ordenamiento global
  setTimeout(() => {
    renderGlobalOrderTab(); // Mostrar pestaña de orden siempre
    updatePrompt();
  }, 100);
  
  // Agregar listener para auto-guardar cuando se cambie el nombre
  const projectNameInput = document.getElementById('project-name');
  if (projectNameInput) {
    projectNameInput.addEventListener('blur', () => {
      scheduleAutoSave();
    });
  }
});

// ==========================================
// ATAJOS DE TECLADO
// ==========================================
document.addEventListener('keydown', function(e) {
  // Ctrl/Cmd + S para guardar proyecto
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    projects.saveProject();
  }
  
  // Ctrl/Cmd + Shift + C para copiar prompt
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    copyPrompt();
  }
  
  // Ctrl/Cmd + Shift + D para cambiar tema
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
    e.preventDefault();
    toggleTheme();
  }
  
  // Ctrl/Cmd + Shift + O para ir a la pestaña de orden
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'O') {
    e.preventDefault();
    showTab('ordering');
  }
});

// Programar auto-guardado cuando hay cambios
document.addEventListener('input', () => {
  updatePrompt();
  scheduleAutoSave();
});

document.addEventListener('change', () => {
  updatePrompt();
  scheduleAutoSave();
});
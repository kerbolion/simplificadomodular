// Eventos y inicialización de la aplicación

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  functions.load();
  functions.init();
  projects.init();
  renderAll();
  updatePrompt();
  
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
});

// Auto-guardar también cuando se pierda el foco del nombre del proyecto
document.addEventListener('DOMContentLoaded', function() {
  // Agregar listener para auto-guardar cuando se cambie el nombre
  const projectNameInput = document.getElementById('project-name');
  if (projectNameInput) {
    projectNameInput.addEventListener('blur', () => {
      scheduleAutoSave();
    });
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
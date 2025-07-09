// Funciones auxiliares y utilidades

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================
function renderAll() {
  renderFAQs();
  renderFlows();
  renderSteps();
  renderSections();
  renderSectionContent();
}

function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function copyPrompt(event) {
  // Para copiar, obtenemos solo el texto sin HTML
  const outputElement = document.getElementById('output');
  const text = outputElement.textContent || outputElement.innerText;
  
  navigator.clipboard.writeText(text).then(() => {
    const btn = event ? event.target.closest('.copy-btn') : document.querySelector('.copy-btn');
    const originalHTML = btn.innerHTML;
    
    btn.innerHTML = '<span>✅</span><span>¡Copiado!</span>';
    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = 'linear-gradient(135deg, var(--success), #059669)';
    }, 2000);
  }).catch(err => {
    console.error('Error al copiar:', err);
    alert('Error al copiar al portapapeles');
  });
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// ==========================================
// INICIALIZACIÓN DEL TEMA
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Cargar tema al iniciar
initTheme();

// ==========================================
// AUTO-GUARDADO SILENCIOSO
// ==========================================
let autoSaveTimeout;

function scheduleAutoSave() {
  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    const projectName = document.getElementById('project-name').value.trim();
    if (projectName) {
      console.log('Auto-guardando proyecto...');
      const success = projects.saveProject(true); // true = modo silencioso
      if (success) {
        // Opcional: mostrar indicador visual sutil de guardado
        showAutoSaveIndicator();
      }
    }
  }, 5000); // Auto-guardar cada 5 segundos después de cambios
}

// Función opcional para mostrar indicador visual sutil
function showAutoSaveIndicator() {
  // Buscar el botón de guardar para mostrar feedback visual
  const saveBtn = document.querySelector('button[onclick="projects.saveProject()"]');
  if (saveBtn) {
    const originalText = saveBtn.innerHTML;
    const originalBackground = saveBtn.style.background;
    const originalColor = saveBtn.style.color;

    // Cambiar a estilo de "guardado" temporalmente
    saveBtn.innerHTML = '✅ Guardado';
    saveBtn.style.background = 'linear-gradient(90deg, #10b981, #059669)';
    saveBtn.style.color = '#fff';

    // Restaurar estilo original después de 2 segundos
    setTimeout(() => {
      saveBtn.innerHTML = originalText;
      saveBtn.style.background = originalBackground;
      saveBtn.style.color = originalColor;
    }, 2000);
  }
}




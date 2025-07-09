// ==========================================
// GESTIÓN DE EVENTOS Y AUTO-GUARDADO
// ==========================================

const events = {
  autoSaveTimeout: null,

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
  
  // Inicializar todos los eventos
  init() {
    this.initializeDOM();
    this.setupEventListeners();
    this.setupAutoSave();
    this.loadInitialData();
  },

  // Inicializar elementos del DOM
  initializeDOM() {
    functions.load();
    functions.init();
    projects.init();
    ui.render.all();
    prompt.update();
  },

  // Configurar event listeners
  setupEventListeners() {
    // Eventos de input para auto-guardado
    document.addEventListener('input', () => {
      prompt.update();
      this.scheduleAutoSave();
    });

    // Eventos de change para auto-guardado
    document.addEventListener('change', () => {
      prompt.update();
      this.scheduleAutoSave();
    });

    // Auto-guardar cuando se pierde el foco del nombre del proyecto
    const projectNameInput = utils.getElement('project-name');
    if (projectNameInput) {
      projectNameInput.addEventListener('blur', () => {
        this.scheduleAutoSave();
      });
    }

    // Evento para inicialización del tema
    this.initTheme();
  },

  // Cargar datos iniciales
  loadInitialData() {
    // Los proyectos ya se cargan en projects.init()
    // Solo necesitamos asegurar que todo esté renderizado
    setTimeout(() => {
      ui.render.all();
      prompt.update();
    }, 100);
  },

  // ==========================================
  // AUTO-GUARDADO
  // ==========================================
  
  // Configurar sistema de auto-guardado
  setupAutoSave() {
    // El auto-guardado se activa con scheduleAutoSave()
    utils.log('Sistema de auto-guardado configurado');
  },

  // Programar auto-guardado
  scheduleAutoSave() {
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      const projectName = utils.getInputValue('project-name');
      if (projectName) {
        utils.log('Ejecutando auto-guardado...');
        const success = projects.saveProject(true); // modo silencioso
        if (success) {
          this.showAutoSaveIndicator();
        }
      }
    }, 5000); // Auto-guardar después de 5 segundos de inactividad
  },

  // Mostrar indicador visual de auto-guardado
  showAutoSaveIndicator() {
    const saveBtn = document.querySelector('button[onclick="projects.saveProject()"]');
    if (!saveBtn) return;

    const originalText = saveBtn.innerHTML;
    
    saveBtn.innerHTML = '✅ Guardado';
    saveBtn.style.background = 'linear-gradient(90deg, #10b981, #059669)';
    
    setTimeout(() => {
      saveBtn.innerHTML = originalText;
      saveBtn.style.background = '';
    }, 2000);
  },

  // ==========================================
  // TEMAS
  // ==========================================
  
  // Inicializar tema
  initTheme() {
    const savedTheme = utils.loadFromStorage('theme', 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
  },

  // ==========================================
  // ATAJOS DE TECLADO
  // ==========================================
  
  // Configurar atajos de teclado
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + S para guardar proyecto
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        projects.saveProject();
      }
      
      // Ctrl/Cmd + Shift + C para copiar prompt
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        utils.copyPrompt();
      }
      
      // Ctrl/Cmd + Shift + D para cambiar tema
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        ui.themes.toggle();
      }

      // Escape para cerrar modales/cancelar acciones
      if (e.key === 'Escape') {
        // Implementar lógica de escape si es necesario
      }

      // Enter en campos específicos
      if (e.key === 'Enter' && !e.shiftKey) {
        this.handleEnterKey(e);
      }
    });
  },

  // Manejar tecla Enter en diferentes contextos
  handleEnterKey(e) {
    const target = e.target;
    
    // Si es un textarea, permitir nueva línea con Shift+Enter
    if (target.tagName === 'TEXTAREA') {
      return; // Comportamiento normal
    }
    
    // Si es el nombre del proyecto, intentar guardar
    if (target.id === 'project-name') {
      e.preventDefault();
      const projectName = utils.cleanText(target.value);
      if (projectName) {
        projects.saveProject();
      }
    }
    
    // Si es un input en una lista, agregar nuevo elemento
    if (target.classList.contains('list-item-input')) {
      e.preventDefault();
      // Lógica para agregar nuevo elemento
    }
  },

  // ==========================================
  // MANEJO DE ERRORES
  // ==========================================
  
  // Configurar manejo global de errores
  setupErrorHandling() {
    window.addEventListener('error', (e) => {
      utils.error('Error global capturado:', e.error);
      this.showErrorMessage('Ha ocurrido un error. Por favor, recarga la página.');
    });

    window.addEventListener('unhandledrejection', (e) => {
      utils.error('Promise rechazada no manejada:', e.reason);
      this.showErrorMessage('Error de conexión. Verifica tu conexión a internet.');
    });
  },

  // Mostrar mensaje de error al usuario
  showErrorMessage(message) {
    // Crear un toast o modal simple
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast';
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--danger);
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      z-index: 9999;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  },

  // ==========================================
  // VALIDACIONES EN TIEMPO REAL
  // ==========================================
  
  // Validar formulario en tiempo real
  setupRealTimeValidation() {
    // Validación del nombre del proyecto
    const projectNameInput = utils.getElement('project-name');
    if (projectNameInput) {
      projectNameInput.addEventListener('input', (e) => {
        const value = utils.cleanText(e.target.value);
        const isValid = value.length >= 2 && value.length <= 50;
        
        e.target.classList.toggle('invalid', !isValid && value.length > 0);
        e.target.classList.toggle('valid', isValid);
      });
    }

    // Validación del nombre del negocio
    const businessNameInput = utils.getElement('business-name');
    if (businessNameInput) {
      businessNameInput.addEventListener('input', (e) => {
        const value = utils.cleanText(e.target.value);
        const isValid = value.length >= 2;
        
        e.target.classList.toggle('invalid', !isValid && value.length > 0);
        e.target.classList.toggle('valid', isValid);
      });
    }
  },

  // ==========================================
  // CONFIRMACIONES DE SALIDA
  // ==========================================
  
  // Configurar confirmación antes de salir
  setupBeforeUnload() {
    window.addEventListener('beforeunload', (e) => {
      const hasUnsavedChanges = this.hasUnsavedChanges();
      
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Podrías perder cambios no guardados.';
        return e.returnValue;
      }
    });
  },

  // Verificar si hay cambios sin guardar
  hasUnsavedChanges() {
    // Implementar lógica para detectar cambios no guardados
    // Por ejemplo, comparar estado actual con último guardado
    return false; // Por ahora, siempre false porque tenemos auto-guardado
  }
};

// ==========================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  utils.log('Inicializando aplicación...');
  
  try {
    events.init();
    events.setupKeyboardShortcuts();
    events.setupErrorHandling();
    events.setupRealTimeValidation();
    events.setupBeforeUnload();
    
    utils.log('Aplicación inicializada correctamente');
  } catch (error) {
    utils.error('Error durante la inicialización:', error);
    events.showErrorMessage('Error al inicializar la aplicación. Por favor, recarga la página.');
  }
});
// ==========================================
// MÓDULO DE ATAJOS DE TECLADO
// ==========================================

ui.keyboard = {
  // Registro de atajos activos
  shortcuts: new Map(),
  
  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
  
  // Inicializar atajos de teclado
  init() {
    this.setupDefaultShortcuts();
    this.setupEventListeners();
    this.loadCustomShortcuts();
  },

  // Configurar atajos por defecto
  setupDefaultShortcuts() {
    // Atajos principales
    this.register('Ctrl+S', () => {
      projects.saveProject();
    }, 'Guardar proyecto');

    this.register('Ctrl+Shift+C', () => {
      utils.copyPrompt();
    }, 'Copiar prompt');

    this.register('Ctrl+Shift+D', () => {
      ui.themes.toggle();
    }, 'Cambiar tema');

    this.register('Ctrl+Shift+N', () => {
      projects.loadProject('');
    }, 'Nuevo proyecto');

    this.register('Ctrl+Shift+E', () => {
      projects.exportProject();
    }, 'Exportar proyecto');

    this.register('Ctrl+Shift+I', () => {
      projects.importProject();
    }, 'Importar proyecto');

    // Navegación entre pestañas
    this.register('Ctrl+1', () => {
      ui.render.showTab(0);
    }, 'Ir a Configuración');

    this.register('Ctrl+2', () => {
      ui.render.showTab(1);
    }, 'Ir a Flujos');

    this.register('Ctrl+3', () => {
      ui.render.showTab(2);
    }, 'Ir a FAQ');

    this.register('Ctrl+4', () => {
      ui.render.showTab(3);
    }, 'Ir a Funciones');

    // Atajos específicos por sección
    this.register('Alt+S', () => {
      if (state.currentTab === 0) sections.add();
    }, 'Agregar sección');

    this.register('Alt+F', () => {
      if (state.currentTab === 1) flows.add();
    }, 'Agregar flujo');

    this.register('Alt+Q', () => {
      if (state.currentTab === 2) faqs.add();
    }, 'Agregar FAQ');

    this.register('Alt+N', () => {
      if (state.currentTab === 3) functions.add();
    }, 'Agregar función');

    // Atajos de utilidad
    this.register('Escape', () => {
      this.handleEscape();
    }, 'Cancelar/Cerrar');

    this.register('F1', () => {
      this.showHelp();
    }, 'Mostrar ayuda');

    this.register('Ctrl+/', () => {
      this.showShortcutsList();
    }, 'Mostrar atajos');
  },

  // ==========================================
  // GESTIÓN DE ATAJOS
  // ==========================================
  
  // Registrar nuevo atajo
  register(combination, callback, description = '') {
    const normalizedCombo = this.normalizeShortcut(combination);
    
    this.shortcuts.set(normalizedCombo, {
      callback,
      description,
      original: combination
    });
  },

  // Eliminar atajo
  unregister(combination) {
    const normalizedCombo = this.normalizeShortcut(combination);
    return this.shortcuts.delete(normalizedCombo);
  },

  // Normalizar combinación de teclas
  normalizeShortcut(combination) {
    return combination
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/cmd/g, 'ctrl') // Mac compatibility
      .split('+')
      .sort()
      .join('+');
  },

  // ==========================================
  // EVENT LISTENERS
  // ==========================================
  
  // Configurar listeners de eventos
  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      this.handleKeyDown(e);
    });

    document.addEventListener('keyup', (e) => {
      this.handleKeyUp(e);
    });

    // Prevenir atajos del navegador en ciertos contextos
    document.addEventListener('keydown', (e) => {
      this.preventBrowserShortcuts(e);
    });
  },

  // Manejar tecla presionada
  handleKeyDown(e) {
    const combination = this.buildCombination(e);
    const shortcut = this.shortcuts.get(combination);
    
    if (shortcut) {
      // Verificar si estamos en un contexto donde se pueden usar atajos
      if (this.canUseShortcuts(e.target)) {
        e.preventDefault();
        
        try {
          shortcut.callback(e);
          this.showShortcutFeedback(shortcut.original);
        } catch (error) {
          utils.error('Error ejecutando atajo:', error);
        }
      }
    }
  },

  // Manejar tecla liberada
  handleKeyUp(e) {
    // Limpiar estados si es necesario
  },

  // Construir combinación de teclas desde evento
  buildCombination(e) {
    const parts = [];
    
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey) parts.push('shift');
    
    // Agregar la tecla principal
    const key = e.key.toLowerCase();
    
    // Mapear teclas especiales
    const keyMap = {
      ' ': 'space',
      'escape': 'escape',
      'enter': 'enter',
      'tab': 'tab',
      'arrowup': 'up',
      'arrowdown': 'down',
      'arrowleft': 'left',
      'arrowright': 'right',
      'delete': 'delete',
      'backspace': 'backspace'
    };
    
    const normalizedKey = keyMap[key] || key;
    parts.push(normalizedKey);
    
    return parts.sort().join('+');
  },

  // ==========================================
  // VALIDACIONES Y CONTEXTO
  // ==========================================
  
  // Verificar si se pueden usar atajos en el contexto actual
  canUseShortcuts(target) {
    // No usar atajos si estamos escribiendo en un input/textarea
    const editableElements = ['input', 'textarea', 'select'];
    const isEditable = editableElements.includes(target.tagName.toLowerCase()) ||
                      target.contentEditable === 'true';
    
    // Permitir algunos atajos incluso en elementos editables
    const allowedInEditable = ['escape', 'f1', 'ctrl+/', 'ctrl+s'];
    
    return !isEditable || allowedInEditable.some(combo => 
      this.shortcuts.has(this.normalizeShortcut(combo))
    );
  },

  // Prevenir atajos del navegador que puedan interferir
  preventBrowserShortcuts(e) {
    const blockedCombinations = [
      'ctrl+s', // Guardar página
      'ctrl+shift+i', // DevTools
      'ctrl+shift+c', // Inspeccionar elemento
      'ctrl+r', // Recargar (solo en ciertos contextos)
    ];
    
    const combination = this.buildCombination(e);
    
    if (blockedCombinations.includes(combination)) {
      // Solo prevenir si tenemos un atajo personalizado registrado
      if (this.shortcuts.has(this.normalizeShortcut(combination))) {
        e.preventDefault();
      }
    }
  },

  // ==========================================
  // ACCIONES ESPECIALES
  // ==========================================
  
  // Manejar tecla Escape
  handleEscape() {
    // Cerrar modales abiertos
    const modals = document.querySelectorAll('.modal-overlay');
    if (modals.length > 0) {
      modals[modals.length - 1].remove();
      return;
    }
    
    // Limpiar selecciones
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
    
    // Enfocar elemento principal
    const mainElement = document.querySelector('main') || document.body;
    mainElement.focus();
  },

  // Mostrar ayuda general
  showHelp() {
    const helpContent = `
      <h4>Atajos de Teclado Disponibles:</h4>
      <div style="max-height: 400px; overflow-y: auto;">
        ${Array.from(this.shortcuts.entries())
          .map(([combo, shortcut]) => `
            <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 4px;">
              <code style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 3px;">${shortcut.original}</code>
              <span>${shortcut.description}</span>
            </div>
          `).join('')}
      </div>
    `;
    
    ui.render.createModal('Ayuda - Atajos de Teclado', helpContent, [
      { text: 'Cerrar', onclick: 'ui.render.closeModal(arguments[0])' }
    ]);
  },

  // Mostrar lista de atajos
  showShortcutsList() {
    this.showHelp(); // Por ahora, es lo mismo que la ayuda
  },

  // ==========================================
  // FEEDBACK VISUAL
  // ==========================================
  
  // Mostrar feedback visual cuando se usa un atajo
  showShortcutFeedback(combination) {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 50px;
      right: 20px;
      background: var(--text-accent);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      z-index: 9999;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease;
    `;
    
    feedback.textContent = combination;
    document.body.appendChild(feedback);
    
    // Animar entrada
    setTimeout(() => {
      feedback.style.opacity = '1';
      feedback.style.transform = 'translateY(0)';
    }, 10);
    
    // Eliminar después de un tiempo
    setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 300);
    }, 1500);
  },

  // ==========================================
  // PERSONALIZACIÓN
  // ==========================================
  
  // Cargar atajos personalizados
  loadCustomShortcuts() {
    const customShortcuts = utils.loadFromStorage('customShortcuts', {});
    
    Object.entries(customShortcuts).forEach(([combo, config]) => {
      if (config.action && this[config.action]) {
        this.register(combo, () => {
          this[config.action](config.params);
        }, config.description);
      }
    });
  },

  // Guardar atajos personalizados
  saveCustomShortcuts() {
    const customShortcuts = {};
    
    this.shortcuts.forEach((shortcut, combo) => {
      if (shortcut.custom) {
        customShortcuts[combo] = {
          action: shortcut.action,
          params: shortcut.params,
          description: shortcut.description,
          custom: true
        };
      }
    });
    
    utils.saveToStorage('customShortcuts', customShortcuts);
  },

  // ==========================================
  // ACCIONES PROGRAMÁTICAS
  // ==========================================
  
  // Simular atajo de teclado
  triggerShortcut(combination) {
    const normalizedCombo = this.normalizeShortcut(combination);
    const shortcut = this.shortcuts.get(normalizedCombo);
    
    if (shortcut) {
      try {
        shortcut.callback();
        this.showShortcutFeedback(shortcut.original);
        return true;
      } catch (error) {
        utils.error('Error ejecutando atajo programático:', error);
        return false;
      }
    }
    
    return false;
  },

  // ==========================================
  // UTILIDADES
  // ==========================================
  
  // Obtener información de atajos
  getShortcutsInfo() {
    return Array.from(this.shortcuts.entries()).map(([combo, shortcut]) => ({
      combination: combo,
      original: shortcut.original,
      description: shortcut.description
    }));
  },

  // Verificar si existe un atajo
  hasShortcut(combination) {
    const normalizedCombo = this.normalizeShortcut(combination);
    return this.shortcuts.has(normalizedCombo);
  },

  // Deshabilitar todos los atajos temporalmente
  disable() {
    this.disabled = true;
  },

  // Habilitar todos los atajos
  enable() {
    this.disabled = false;
  }
};
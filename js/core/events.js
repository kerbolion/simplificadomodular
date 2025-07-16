// ==========================================
// EVENTOS E INICIALIZACIÓN CORREGIDA
// ==========================================

class EventManager {
  constructor() {
    this.listeners = new Map();
    this.keyboardShortcuts = new Map();
  }

  // Agregar listener de eventos
  addEventListener(element, event, handler, options = {}) {
    const key = `${element.id || 'unknown'}_${event}`;
    
    if (this.listeners.has(key)) {
      const oldHandler = this.listeners.get(key);
      element.removeEventListener(event, oldHandler);
    }
    
    const wrappedHandler = options.debounce 
      ? TimingUtils.throttle(handler, options.debounce)
      : handler;
    
    element.addEventListener(event, wrappedHandler);
    this.listeners.set(key, wrappedHandler);
  }

  // Agregar atajo de teclado
  addKeyboardShortcut(keys, callback, description = '') {
    this.keyboardShortcuts.set(keys, { callback, description });
  }

  // Manejar eventos de teclado
  handleKeydown(e) {
    const key = this.getKeyString(e);
    const shortcut = this.keyboardShortcuts.get(key);
    
    if (shortcut) {
      e.preventDefault();
      shortcut.callback(e);
    }
  }

  // Generar string de tecla
  getKeyString(e) {
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    parts.push(e.key);
    return parts.join('+');
  }

  // Inicializar eventos globales
  init() {
    // Eventos de teclado
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // Eventos de cambio para auto-guardado
    document.addEventListener('input', () => {
      this.updatePromptDebounced();
      AutoSaveUtils.schedule();
    });

    document.addEventListener('change', () => {
      this.updatePromptDebounced();
      AutoSaveUtils.schedule();
    });

    // Auto-guardado cuando se cambia el nombre del proyecto
    const projectNameInput = document.getElementById('project-name');
    if (projectNameInput) {
      projectNameInput.addEventListener('blur', () => {
        AutoSaveUtils.schedule();
      });
    }
  }

  // Actualizar prompt con debounce
  updatePromptDebounced() {
    TimingUtils.debounce('updatePrompt', () => {
      if (window.updatePrompt) {
        window.updatePrompt();
      }
    }, 150);
  }

  // Configurar atajos de teclado
  setupKeyboardShortcuts() {
    // Guardar proyecto
    this.addKeyboardShortcut('Ctrl+s', () => {
      if (window.projects) {
        window.projects.saveProject();
      }
    }, 'Guardar proyecto');

    // Copiar prompt
    this.addKeyboardShortcut('Ctrl+Shift+C', () => {
      CopyUtils.copyPrompt();
    }, 'Copiar prompt');

    // Cambiar tema
    this.addKeyboardShortcut('Ctrl+Shift+D', () => {
      ThemeUtils.toggleTheme();
    }, 'Cambiar tema');

    // Ir a pestaña de orden
    this.addKeyboardShortcut('Ctrl+Shift+O', () => {
      if (window.showTab) {
        window.showTab('ordering');
      }
    }, 'Ir a pestaña de orden');

    // Navegación entre pestañas
    for (let i = 1; i <= 4; i++) {
      this.addKeyboardShortcut(`Ctrl+${i}`, () => {
        if (window.showTab) {
          window.showTab(i - 1);
        }
      }, `Ir a pestaña ${i}`);
    }
  }
}

// Instancia global del gestor de eventos
const eventManager = new EventManager();

// ==========================================
// INICIALIZACIÓN PRINCIPAL CORREGIDA
// ==========================================

class AppInitializer {
  constructor() {
    this.initPromise = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.performInit();
    return this.initPromise;
  }

  async performInit() {
    try {
      console.log('Inicializando aplicación...');

      // 1. Cargar módulos principales primero
      await this.loadCoreModules();

      // 2. Configurar referencias de renderizado
      this.setupRenderReferences();

      // 3. Inicializar ordenamiento global
      this.initializeGlobalOrdering();

      // 4. Configurar eventos
      eventManager.init();
      eventManager.setupKeyboardShortcuts();

      // 5. Renderizar interfaz inicial
      this.renderInitialUI();

      // 6. Inicializar UI avanzada con delay
      setTimeout(() => {
        this.initializeAdvancedUI();
      }, 100);

      this.isInitialized = true;
      console.log('Aplicación inicializada correctamente');
    } catch (error) {
      console.error('Error durante la inicialización:', error);
      throw error;
    }
  }

  async loadCoreModules() {
    // Cargar funciones y proyectos
    if (window.functions) {
      window.functions.load();
      window.functions.init();
    }

    if (window.projects) {
      window.projects.init();
    }
  }

  setupRenderReferences() {
    // Configurar referencias de renderizado en RenderUtils
    if (window.RenderUtils) {
      if (window.faqManager) {
        RenderUtils.renderFAQs = () => window.faqManager.renderFAQs();
      }
      if (window.flowManager) {
        RenderUtils.renderFlows = () => window.flowManager.renderFlows();
        RenderUtils.renderSteps = () => window.flowManager.renderSteps();
      }
      if (window.sectionManager) {
        RenderUtils.renderSections = () => window.sectionManager.renderSections();
        RenderUtils.renderSectionContent = () => window.sectionManager.renderSectionContent();
      }
      if (window.globalOrderingUI) {
        RenderUtils.renderGlobalOrder = () => window.globalOrderingUI.renderOrder();
      }
    }
  }

  initializeGlobalOrdering() {
    // Inicializar ordenamiento global (siempre activo)
    if (window.globalOrderingManager) {
      window.globalOrderingManager.init();
    }
  }

  renderInitialUI() {
    // Renderizar componentes principales de forma segura
    try {
      if (window.faqManager && window.faqManager.renderFAQs) {
        window.faqManager.renderFAQs();
      }
      if (window.flowManager) {
        if (window.flowManager.renderFlows) window.flowManager.renderFlows();
        if (window.flowManager.renderSteps) window.flowManager.renderSteps();
      }
      if (window.sectionManager) {
        if (window.sectionManager.renderSections) window.sectionManager.renderSections();
        if (window.sectionManager.renderSectionContent) window.sectionManager.renderSectionContent();
      }
      
      // Actualizar prompt inicial
      if (window.updatePrompt) {
        window.updatePrompt();
      }
    } catch (error) {
      console.warn('Error en renderizado inicial:', error);
    }
  }

  initializeAdvancedUI() {
    try {
      // Renderizar pestaña de orden global
      if (window.globalOrderingUI && window.globalOrderingUI.renderTab) {
        window.globalOrderingUI.renderTab();
      }

      // Aplicar mejoras visuales
      this.applyUIEnhancements();
    } catch (error) {
      console.warn('Error en UI avanzada:', error);
    }
  }

  applyUIEnhancements() {
    // Agregar clases CSS para animaciones
    document.querySelectorAll('.step, .section, .global-order-item').forEach(element => {
      element.classList.add('fade-in');
    });

    // Inicializar tooltips si es necesario
    this.initializeTooltips();
  }

  initializeTooltips() {
    // Configurar tooltips básicos para botones con title
    document.querySelectorAll('button[title]').forEach(button => {
      button.addEventListener('mouseenter', function() {
        this.style.position = 'relative';
      });
    });
  }
}

// Instancia global del inicializador
const appInitializer = new AppInitializer();

// ==========================================
// FUNCIONES DE PESTAÑAS CORREGIDAS
// ==========================================

function showTab(index) {
  if (index === 'ordering') {
    // Manejar pestaña de ordenamiento
    document.querySelectorAll('.tab').forEach((tab) => {
      tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach((content) => {
      content.classList.remove('active');
    });
    
    const orderingTab = document.querySelector('.tab[data-tab="ordering"]');
    const orderingContent = document.getElementById('tab-ordering');
    
    if (orderingTab) orderingTab.classList.add('active');
    if (orderingContent) orderingContent.classList.add('active');
    
    state.currentTab = 'ordering';
  } else {
    // Pestañas numéricas normales
    document.querySelectorAll('.tab').forEach((tab, i) => {
      tab.classList.toggle('active', i === index);
    });
    document.querySelectorAll('.tab-content').forEach((content, i) => {
      content.classList.toggle('active', i === index);
    });
    state.currentTab = index;
  }
}

// ==========================================
// INICIALIZACIÓN AL CARGAR EL DOM
// ==========================================

document.addEventListener('DOMContentLoaded', async function() {
  try {
    await appInitializer.init();
  } catch (error) {
    console.error('Error fatal durante la inicialización:', error);
    // Mostrar mensaje de error al usuario
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #ef4444;">
        <h2>Error de Inicialización</h2>
        <p>Ha ocurrido un error al cargar la aplicación. Por favor, recarga la página.</p>
        <button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px;">
          Recargar
        </button>
      </div>
    `;
  }
});

// Exportar instancias globales
window.eventManager = eventManager;
window.appInitializer = appInitializer;
window.showTab = showTab;
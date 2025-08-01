// ==========================================
// SISTEMA DE AUTO-RESIZE MEJORADO - CARGA INMEDIATA
// ==========================================

class AutoResizeSystem {
  constructor() {
    this.initialized = false;
    this.observer = null;
    this.resizeQueue = new Set();
    this.styles = `
      /* Estilos para textareas auto-redimensionables */
      .autoresize {
        overflow: hidden;
        resize: none;
        min-height: 60px;
        transition: height 0.15s ease;
        line-height: 1.4;
        box-sizing: border-box;
      }

      .autoresize.max-height {
        max-height: 300px;
        overflow-y: auto;
        resize: vertical;
      }

      /* Prevenir flash de contenido sin estilo */
      .autoresize:not(.sized) {
        height: auto;
      }
    `;
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  init() {
    if (this.initialized) return;
    
    console.log('Inicializando sistema de auto-resize mejorado...');
    
    this.addStyles();
    this.setupGlobalListeners();
    this.setupMutationObserver();
    this.processExistingTextareas();
    
    this.initialized = true;
    console.log('Sistema de auto-resize inicializado correctamente');
  }

  addStyles() {
    if (document.getElementById('autoresize-styles')) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'autoresize-styles';
    styleSheet.textContent = this.styles;
    document.head.appendChild(styleSheet);
  }

  setupGlobalListeners() {
    // Listener para input events
    document.addEventListener('input', (e) => {
      if (e.target.matches('textarea.autoresize')) {
        this.resizeTextarea(e.target);
      }
    }, true);

    // Listener para cuando se cambian las pestañas
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab')) {
        // Pequeño delay para que el contenido se renderice
        setTimeout(() => this.resizeAllVisible(), 100);
      }
    });

    // Listener para cambios de ventana
    window.addEventListener('resize', () => {
      this.debounce('windowResize', () => this.resizeAllVisible(), 150);
    });
  }

  setupMutationObserver() {
    this.observer = new MutationObserver((mutations) => {
      let needsResize = false;
      
      mutations.forEach((mutation) => {
        // Verificar nodos agregados
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'TEXTAREA') {
              this.processTextarea(node);
              needsResize = true;
            } else if (node.querySelector) {
              const textareas = node.querySelectorAll('textarea');
              textareas.forEach(textarea => {
                this.processTextarea(textarea);
                needsResize = true;
              });
            }
          }
        });

        // Verificar cambios de atributos que puedan afectar el tamaño
        if (mutation.type === 'attributes' && 
            mutation.target.tagName === 'TEXTAREA' &&
            (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
          this.scheduleResize(mutation.target);
          needsResize = true;
        }
      });

      if (needsResize) {
        // Procesar en el siguiente tick para asegurar que el DOM esté listo
        setTimeout(() => this.processResizeQueue(), 0);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  // ==========================================
  // PROCESAMIENTO DE TEXTAREAS
  // ==========================================

  processTextarea(textarea) {
    if (!textarea.classList.contains('autoresize')) {
      textarea.classList.add('autoresize');
      
      // Agregar max-height por defecto
      if (!textarea.classList.contains('max-height')) {
        textarea.classList.add('max-height');
      }
    }
    
    this.scheduleResize(textarea);
  }

  processExistingTextareas() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      this.processTextarea(textarea);
    });
    
    // Procesar inmediatamente
    this.processResizeQueue();
  }

  scheduleResize(textarea) {
    this.resizeQueue.add(textarea);
  }

  processResizeQueue() {
    this.resizeQueue.forEach(textarea => {
      if (textarea.isConnected) { // Solo si el elemento sigue en el DOM
        this.resizeTextarea(textarea);
      }
    });
    this.resizeQueue.clear();
  }

  // ==========================================
  // REDIMENSIONAMIENTO
  // ==========================================

  resizeTextarea(textarea) {
    if (!textarea || !textarea.isConnected) return;
    
    // Verificar si el textarea es visible
    if (!this.isVisible(textarea)) {
      // Si no es visible, programar para más tarde
      setTimeout(() => this.scheduleResize(textarea), 50);
      return;
    }

    // Guardar el scroll position si es necesario
    const scrollTop = textarea.scrollTop;
    
    // Reset height para calcular correctamente
    const originalHeight = textarea.style.height;
    textarea.style.height = 'auto';
    
    // Calcular nueva altura
    const newHeight = Math.max(60, textarea.scrollHeight);
    
    // Aplicar límites si tiene max-height
    const finalHeight = textarea.classList.contains('max-height') 
      ? Math.min(newHeight, 300) 
      : newHeight;
    
    // Aplicar nueva altura
    textarea.style.height = finalHeight + 'px';
    
    // Marcar como redimensionado
    textarea.classList.add('sized');
    
    // Restaurar scroll si era necesario
    if (scrollTop > 0) {
      textarea.scrollTop = scrollTop;
    }
  }

  resizeAllVisible() {
    const textareas = document.querySelectorAll('textarea.autoresize');
    textareas.forEach(textarea => {
      if (this.isVisible(textarea)) {
        this.resizeTextarea(textarea);
      }
    });
  }

  resizeAll() {
    const textareas = document.querySelectorAll('textarea.autoresize');
    textareas.forEach(textarea => this.resizeTextarea(textarea));
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  isVisible(element) {
    if (!element || !element.isConnected) return false;
    
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return (
      rect.width > 0 && 
      rect.height > 0 && 
      style.display !== 'none' && 
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }

  debounce(key, func, delay) {
    if (!this.debounceTimers) this.debounceTimers = {};
    
    clearTimeout(this.debounceTimers[key]);
    this.debounceTimers[key] = setTimeout(func, delay);
  }

  // ==========================================
  // API PÚBLICA
  // ==========================================

  // Forzar redimensionamiento de un textarea específico
  forceResize(selector) {
    const textarea = typeof selector === 'string' 
      ? document.querySelector(selector) 
      : selector;
    
    if (textarea) {
      this.resizeTextarea(textarea);
    }
  }

  // Redimensionar textareas en un contenedor específico
  resizeInContainer(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (container) {
      const textareas = container.querySelectorAll('textarea.autoresize');
      textareas.forEach(textarea => this.resizeTextarea(textarea));
    }
  }

  // Desactivar auto-resize para un textarea
  disable(textarea) {
    textarea.classList.remove('autoresize');
    textarea.style.resize = 'vertical';
    textarea.style.overflow = 'auto';
  }

  // Reactivar auto-resize para un textarea
  enable(textarea) {
    textarea.classList.add('autoresize');
    textarea.style.resize = 'none';
    textarea.style.overflow = 'hidden';
    this.resizeTextarea(textarea);
  }

  // Limpiar el sistema
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    this.resizeQueue.clear();
    this.initialized = false;
  }
}

// ==========================================
// INTEGRACIÓN CON RENDERIZADORES EXISTENTES
// ==========================================

class AutoResizeIntegration {
  constructor(autoResizeSystem) {
    this.system = autoResizeSystem;
  }

  // Integrar con el sistema de renderizado
  integrateWithRenderers() {
    // Integrar con RenderUtils
    if (window.RenderUtils) {
      const originalRenderAll = window.RenderUtils.renderAll.bind(window.RenderUtils);
      window.RenderUtils.renderAll = () => {
        originalRenderAll();
        setTimeout(() => this.system.resizeAllVisible(), 50);
      };
    }

    // Integrar con sectionManager
    if (window.sectionManager) {
      const originalRenderSectionContent = window.sectionManager.renderSectionContent.bind(window.sectionManager);
      window.sectionManager.renderSectionContent = () => {
        originalRenderSectionContent();
        setTimeout(() => this.system.resizeAllVisible(), 50);
      };
    }

    // Integrar con flowManager
    if (window.flowManager) {
      const originalRenderSteps = window.flowManager.renderSteps.bind(window.flowManager);
      window.flowManager.renderSteps = () => {
        originalRenderSteps();
        setTimeout(() => this.system.resizeAllVisible(), 50);
      };
    }

    // Integrar con faqManager
    if (window.faqManager) {
      const originalRenderFAQs = window.faqManager.renderFAQs.bind(window.faqManager);
      window.faqManager.renderFAQs = () => {
        originalRenderFAQs();
        setTimeout(() => this.system.resizeAllVisible(), 50);
      };
    }

    // Integrar con functions
    if (window.functions) {
      const originalRender = window.functions.render.bind(window.functions);
      window.functions.render = () => {
        originalRender();
        setTimeout(() => this.system.resizeAllVisible(), 50);
      };
    }
  }

  // Integrar con el sistema de pestañas
  integrateWithTabs() {
    // Override de showTab para redimensionar después de cambiar pestaña
    if (window.showTab) {
      const originalShowTab = window.showTab;
      window.showTab = (index) => {
        originalShowTab(index);
        
        // Redimensionar después de un pequeño delay para asegurar que el contenido esté visible
        setTimeout(() => {
          this.system.resizeAllVisible();
        }, 100);
      };
    }
  }

  // Integrar con el sistema de proyectos
  integrateWithProjects() {
    if (window.projects) {
      const originalLoadProject = window.projects.loadProject.bind(window.projects);
      window.projects.loadProject = (name) => {
        originalLoadProject(name);
        setTimeout(() => this.system.resizeAllVisible(), 200);
      };
    }
  }
}

// ==========================================
// INICIALIZACIÓN Y EXPORTACIÓN
// ==========================================

// Crear instancia global del sistema
const autoResizeSystem = new AutoResizeSystem();
const autoResizeIntegration = new AutoResizeIntegration(autoResizeSystem);

// Función de inicialización principal
function initAutoResizeSystem() {
  // Inicializar el sistema base
  autoResizeSystem.init();
  
  // Integrar con otros sistemas
  autoResizeIntegration.integrateWithRenderers();
  autoResizeIntegration.integrateWithTabs();
  autoResizeIntegration.integrateWithProjects();
  
  console.log('Sistema de auto-resize completamente integrado');
}

// Exportar API global
window.autoResizeSystem = {
  init: initAutoResizeSystem,
  resize: (textarea) => autoResizeSystem.resizeTextarea(textarea),
  resizeAll: () => autoResizeSystem.resizeAll(),
  resizeAllVisible: () => autoResizeSystem.resizeAllVisible(),
  forceResize: (selector) => autoResizeSystem.forceResize(selector),
  resizeInContainer: (containerSelector) => autoResizeSystem.resizeInContainer(containerSelector),
  disable: (textarea) => autoResizeSystem.disable(textarea),
  enable: (textarea) => autoResizeSystem.enable(textarea),
  destroy: () => autoResizeSystem.destroy(),
  
  // Acceso directo al sistema interno para debugging
  _system: autoResizeSystem
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAutoResizeSystem);
} else {
  // DOM ya está listo
  setTimeout(initAutoResizeSystem, 0);
}

// También exportar las clases para uso avanzado
window.AutoResizeSystem = AutoResizeSystem;
window.AutoResizeIntegration = AutoResizeIntegration;
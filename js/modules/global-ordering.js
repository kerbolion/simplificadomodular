// ==========================================
// SISTEMA DE ORDENAMIENTO GLOBAL CORREGIDO
// ==========================================

class GlobalOrderingManager {
  constructor() {
    this.isInitialized = false;
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  init() {
    if (this.isInitialized) return;

    this.addStyles();
    this.ensureGlobalOrderExists();
    this.validateAndRepair();
    this.setupHooks();
    
    this.isInitialized = true;
    console.log('Sistema de ordenamiento global inicializado');
  }

  ensureGlobalOrderExists() {
    if (!state.globalOrder || state.globalOrder.length === 0) {
      state.globalOrder = this.generateDetailedOrder();
    }
    
    state.orderingEnabled = true;
    
    // Asegurar que todos los elementos tengan propiedad visible
    state.globalOrder.forEach(item => {
      if (item.visible === undefined) {
        item.visible = true;
      }
    });
  }

  validateAndRepair() {
    setTimeout(() => {
      const validation = this.validateGlobalOrder();
      if (!validation.valid) {
        console.warn('Orden global inválido, reparando...', validation.errors);
        this.repairGlobalOrder();
      }
    }, 200);
  }

  // ==========================================
  // OPERACIONES DE REORDENAMIENTO
  // ==========================================

  moveElement(fromIndex, toIndex) {
    if (fromIndex === toIndex || !state.globalOrder) return;
    
    const order = state.globalOrder;
    if (fromIndex < 0 || fromIndex >= order.length || toIndex < 0 || toIndex >= order.length) {
      return;
    }
    
    const [movedElement] = order.splice(fromIndex, 1);
    order.splice(toIndex, 0, movedElement);
    
    this.updateUI();
  }

  moveElementUp(index) {
    if (index > 0) {
      this.moveElement(index, index - 1);
    }
  }

  moveElementDown(index) {
    if (index < state.globalOrder.length - 1) {
      this.moveElement(index, index + 1);
    }
  }

  // ==========================================
  // GESTIÓN DE ELEMENTOS
  // ==========================================

  addElement(type, id, name, position = -1, visible = true) {
    if (!state.globalOrder) {
      state.globalOrder = [];
    }
    
    const element = { type, id, name, visible };
    
    if (position === -1) {
      state.globalOrder.push(element);
    } else {
      state.globalOrder.splice(position, 0, element);
    }
    
    this.updateUI();
  }

  removeElement(index) {
    if (!state.globalOrder || index < 0 || index >= state.globalOrder.length) {
      return;
    }
    
    state.globalOrder.splice(index, 1);
    this.updateUI();
  }

  updateElement(index, newName) {
    if (!state.globalOrder || index < 0 || index >= state.globalOrder.length) {
      return;
    }
    
    state.globalOrder[index].name = newName;
    this.updateUI();
  }

  // ==========================================
  // GESTIÓN DE VISIBILIDAD
  // ==========================================

  toggleElementVisibility(index) {
    if (!state.globalOrder || index < 0 || index >= state.globalOrder.length) return;
    
    const item = state.globalOrder[index];
    item.visible = item.visible !== false ? false : true;
    
    this.updateUI();
  }

  toggleAllElementsVisibility() {
    if (!state.globalOrder) return;
    
    const hasHiddenElements = state.globalOrder.some(item => item.visible === false);
    
    if (hasHiddenElements) {
      state.globalOrder.forEach(item => {
        item.visible = true;
      });
    } else {
      state.globalOrder.forEach((item, index) => {
        item.visible = index === 0;
      });
    }
    
    this.updateUI();
  }

  isElementVisible(type, id) {
    if (!state.globalOrder) return true;
    
    const item = state.globalOrder.find(item => 
      item.type === type && item.id === id
    );
    
    return item ? (item.visible !== false) : true;
  }

  getVisibilityStats() {
    if (!state.globalOrder) return { total: 0, visible: 0, hidden: 0 };
    
    const total = state.globalOrder.length;
    const visible = state.globalOrder.filter(item => item.visible !== false).length;
    const hidden = total - visible;
    
    return { total, visible, hidden };
  }

  // ==========================================
  // SINCRONIZACIÓN AUTOMÁTICA (CORREGIDA)
  // ==========================================

  syncElementChanges() {
    if (!state.globalOrder) return;
    
    console.log('Sincronizando cambios en elementos...');
    
    const currentOrder = [...state.globalOrder];
    let hasChanges = false;
    
    // Verificar secciones existentes y nuevas
    state.sections.forEach((section, index) => {
      const exists = currentOrder.some(item => item.type === 'section' && item.id === index);
      if (!exists) {
        console.log(`Agregando nueva sección: ${section.name}`);
        this.addElement('section', index, section.name);
        hasChanges = true;
      } else {
        // Verificar si cambió el nombre
        const existingItem = state.globalOrder.find(item => item.type === 'section' && item.id === index);
        if (existingItem && existingItem.name !== section.name) {
          console.log(`Actualizando nombre de sección: ${section.name}`);
          existingItem.name = section.name;
          hasChanges = true;
        }
      }
    });
    
    // Verificar flujos existentes y nuevos
    state.flows.forEach((flow, index) => {
      const exists = currentOrder.some(item => item.type === 'flow' && item.id === index);
      if (!exists) {
        console.log(`Agregando nuevo flujo: ${flow.name}`);
        this.addElement('flow', index, flow.name);
        hasChanges = true;
      } else {
        // Verificar si cambió el nombre
        const existingItem = state.globalOrder.find(item => item.type === 'flow' && item.id === index);
        if (existingItem && existingItem.name !== flow.name) {
          console.log(`Actualizando nombre de flujo: ${flow.name}`);
          existingItem.name = flow.name;
          hasChanges = true;
        }
      }
    });
    
    // Verificar FAQs
    if (state.faqs && state.faqs.length > 0) {
      const exists = currentOrder.some(item => item.type === 'faqs');
      if (!exists) {
        console.log('Agregando FAQs al orden global');
        this.addElement('faqs', 'all', 'Preguntas Frecuentes');
        hasChanges = true;
      }
    } else {
      const faqIndex = state.globalOrder.findIndex(item => item.type === 'faqs');
      if (faqIndex !== -1) {
        console.log('Removiendo FAQs del orden global');
        this.removeElement(faqIndex);
        hasChanges = true;
      }
    }
    
    // Limpiar elementos huérfanos
    const orphanChanges = this.cleanOrphanElements();
    hasChanges = hasChanges || orphanChanges;
    
    if (hasChanges) {
      console.log('Se detectaron cambios, actualizando UI...');
      this.updateUI();
    }
  }

  cleanOrphanElements() {
    const elementsToRemove = [];
    let hasChanges = false;
    
    state.globalOrder.forEach((item, index) => {
      let elementExists = false;
      
      switch (item.type) {
        case 'section':
          elementExists = state.sections[item.id] !== undefined;
          break;
        case 'flow':
          elementExists = state.flows[item.id] !== undefined;
          break;
        case 'faqs':
          elementExists = state.faqs && state.faqs.length > 0;
          break;
      }
      
      if (!elementExists) {
        console.log(`Elemento huérfano detectado: ${item.name} (${item.type})`);
        elementsToRemove.push(index);
        hasChanges = true;
      }
    });
    
    // Remover elementos huérfanos (en orden inverso para no afectar índices)
    elementsToRemove.reverse().forEach(index => {
      state.globalOrder.splice(index, 1);
    });
    
    return hasChanges;
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  generateDetailedOrder() {
    const order = [];
    
    state.sections.forEach((section, index) => {
      order.push({ type: 'section', id: index, name: section.name, visible: true });
    });
    
    state.flows.forEach((flow, index) => {
      order.push({ type: 'flow', id: index, name: flow.name, visible: true });
    });
    
    if (state.faqs && state.faqs.length > 0) {
      order.push({ type: 'faqs', id: 'all', name: 'Preguntas Frecuentes', visible: true });
    }
    
    return order;
  }

  resetOrder() {
    if (confirm('¿Restablecer el orden a la configuración por defecto?')) {
      state.globalOrder = this.generateDetailedOrder();
      this.updateUI();
    }
  }

  getElementByTypeAndId(type, id) {
    switch (type) {
      case 'section':
        return state.sections[id];
      case 'flow':
        return state.flows[id];
      case 'faqs':
        return { name: 'Preguntas Frecuentes', items: state.faqs };
      default:
        return null;
    }
  }

  // ==========================================
  // VALIDACIÓN
  // ==========================================

  validateGlobalOrder() {
    if (!state.globalOrder || !Array.isArray(state.globalOrder)) {
      return { valid: false, errors: ['El orden global no es válido'] };
    }
    
    const errors = [];
    const duplicates = {};
    
    state.globalOrder.forEach((item, index) => {
      if (!item.type || !item.hasOwnProperty('id') || !item.name) {
        errors.push(`Elemento ${index + 1}: estructura inválida`);
        return;
      }
      
      if (!['section', 'flow', 'faqs'].includes(item.type)) {
        errors.push(`Elemento ${index + 1}: tipo "${item.type}" no válido`);
        return;
      }
      
      const key = `${item.type}-${item.id}`;
      if (duplicates[key]) {
        errors.push(`Elemento ${index + 1}: duplicado de "${item.name}"`);
      } else {
        duplicates[key] = true;
      }
      
      const element = this.getElementByTypeAndId(item.type, item.id);
      if (!element && item.type !== 'faqs') {
        errors.push(`Elemento ${index + 1}: "${item.name}" no existe`);
      }
      
      if (item.visible === undefined) {
        item.visible = true;
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  repairGlobalOrder() {
    console.log('Reparando orden global...');
    
    const validation = this.validateGlobalOrder();
    if (validation.valid) {
      console.log('El orden global es válido');
      return true;
    }
    
    console.log('Errores encontrados:', validation.errors);
    
    state.globalOrder = this.generateDetailedOrder();
    
    console.log('Orden global reparado');
    this.updateUI();
    
    return true;
  }

  // ==========================================
  // HOOKS DEL SISTEMA (CORREGIDOS)
  // ==========================================

  setupHooks() {
    // Hook para secciones - CORREGIDO
    this.hookSectionOperations();
    
    // Hook para flujos - CORREGIDO  
    this.hookFlowOperations();
    
    // Hook para FAQs
    this.hookFAQOperations();

    // Hook global que se ejecuta después de cualquier cambio
    this.setupGlobalChangeDetection();
  }

  hookSectionOperations() {
    // Interceptar cuando sectionManager hace cambios
    if (window.sectionManager) {
      const originalAddSection = window.sectionManager.addSection.bind(window.sectionManager);
      window.sectionManager.addSection = () => {
        originalAddSection();
        // Sincronizar después de agregar
        setTimeout(() => this.syncElementChanges(), 100);
      };

      const originalDuplicateSection = window.sectionManager.duplicateSection.bind(window.sectionManager);
      window.sectionManager.duplicateSection = () => {
        originalDuplicateSection();
        // Sincronizar después de duplicar
        setTimeout(() => this.syncElementChanges(), 100);
      };

      const originalRenameSection = window.sectionManager.renameSection.bind(window.sectionManager);
      window.sectionManager.renameSection = () => {
        originalRenameSection();
        // Sincronizar después de renombrar
        setTimeout(() => this.syncElementChanges(), 100);
      };
    }
  }

  hookFlowOperations() {
    // Interceptar cuando flowManager hace cambios
    if (window.flowManager) {
      const originalAddFlow = window.flowManager.addFlow.bind(window.flowManager);
      window.flowManager.addFlow = () => {
        originalAddFlow();
        // Sincronizar después de agregar
        setTimeout(() => this.syncElementChanges(), 100);
      };

      const originalDuplicateFlow = window.flowManager.duplicateFlow.bind(window.flowManager);
      window.flowManager.duplicateFlow = () => {
        originalDuplicateFlow();
        // Sincronizar después de duplicar
        setTimeout(() => this.syncElementChanges(), 100);
      };

      const originalRenameFlow = window.flowManager.renameFlow.bind(window.flowManager);
      window.flowManager.renameFlow = () => {
        originalRenameFlow();
        // Sincronizar después de renombrar
        setTimeout(() => this.syncElementChanges(), 100);
      };
    }
  }

  hookFAQOperations() {
    // Interceptar cuando faqManager hace cambios
    if (window.faqManager) {
      const originalAddFAQ = window.faqManager.addFAQ.bind(window.faqManager);
      window.faqManager.addFAQ = () => {
        const wasEmpty = state.faqs.length === 0;
        originalAddFAQ();
        
        if (wasEmpty && state.faqs.length > 0) {
          setTimeout(() => this.syncElementChanges(), 100);
        }
      };

      const originalRemoveFAQ = window.faqManager.removeFAQ.bind(window.faqManager);
      window.faqManager.removeFAQ = (index) => {
        originalRemoveFAQ(index);
        
        if (state.faqs.length === 0) {
          setTimeout(() => this.syncElementChanges(), 100);
        }
      };
    }
  }

  setupGlobalChangeDetection() {
    // Observar cambios en el estado usando un interval muy ligero
    setInterval(() => {
      if (this.isInitialized) {
        this.syncElementChanges();
      }
    }, 2000); // Verificar cada 2 segundos
  }

  // ==========================================
  // SINCRONIZACIÓN DE CAMBIOS ESPECÍFICOS
  // ==========================================

  syncSectionChange(action, sectionIndex, sectionName) {
    if (!state.globalOrder) return;
    
    switch (action) {
      case 'add':
        this.addElement('section', sectionIndex, sectionName);
        break;
        
      case 'remove':
        const indexToRemove = state.globalOrder.findIndex(
          item => item.type === 'section' && item.id === sectionIndex
        );
        if (indexToRemove !== -1) {
          this.removeElement(indexToRemove);
        }
        // Actualizar IDs de secciones posteriores
        state.globalOrder.forEach(item => {
          if (item.type === 'section' && item.id > sectionIndex) {
            item.id--;
          }
        });
        break;
        
      case 'rename':
        const indexToUpdate = state.globalOrder.findIndex(
          item => item.type === 'section' && item.id === sectionIndex
        );
        if (indexToUpdate !== -1) {
          this.updateElement(indexToUpdate, sectionName);
        }
        break;
    }
  }

  syncFlowChange(action, flowIndex, flowName) {
    if (!state.globalOrder) return;
    
    switch (action) {
      case 'add':
        this.addElement('flow', flowIndex, flowName);
        break;
        
      case 'remove':
        const indexToRemove = state.globalOrder.findIndex(
          item => item.type === 'flow' && item.id === flowIndex
        );
        if (indexToRemove !== -1) {
          this.removeElement(indexToRemove);
        }
        // Actualizar IDs de flujos posteriores
        state.globalOrder.forEach(item => {
          if (item.type === 'flow' && item.id > flowIndex) {
            item.id--;
          }
        });
        break;
        
      case 'rename':
        const indexToUpdate = state.globalOrder.findIndex(
          item => item.type === 'flow' && item.id === flowIndex
        );
        if (indexToUpdate !== -1) {
          this.updateElement(indexToUpdate, flowName);
        }
        break;
    }
  }

  // ==========================================
  // ESTILOS Y UI
  // ==========================================

  addStyles() {
    if (document.getElementById('global-ordering-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'global-ordering-styles';
    styles.textContent = `
      .global-order-item {
        transition: all 0.2s ease;
        position: relative;
      }
      
      .global-order-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px var(--shadow-light);
        border-color: var(--text-accent) !important;
      }
      
      .global-order-item[draggable="true"] {
        cursor: grab;
      }
      
      .global-order-item[draggable="true"]:active {
        cursor: grabbing;
      }
      
      .global-order-item.dragging {
        opacity: 0.5;
        transform: scale(0.95);
        z-index: 1000;
      }
      
      .global-order-item.drag-over {
        border-color: var(--text-accent) !important;
        background: var(--text-accent)10 !important;
      }
      
      .global-order-item.hidden-element {
        background: var(--bg-tertiary) !important;
        border-style: dashed !important;
        border-color: var(--text-secondary) !important;
      }
      
      .global-order-item.hidden-element:hover {
        opacity: 0.8;
      }
      
      .drag-handle {
        opacity: 0.4;
        transition: opacity 0.2s ease;
      }
      
      .global-order-item:hover .drag-handle {
        opacity: 0.8;
      }
      
      .global-order-item-enter {
        animation: slideInUp 0.3s ease-out;
      }
      
      .global-order-item-exit {
        animation: slideOutDown 0.3s ease-in;
      }
      
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideOutDown {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(20px);
        }
      }
      
      .tab[data-tab="ordering"] {
        background: linear-gradient(90deg, var(--text-accent)20, var(--text-accent)10);
        color: var(--text-accent);
        font-weight: 600;
      }
      
      .tab[data-tab="ordering"].active {
        background: var(--bg-secondary);
        color: var(--text-accent);
        border-bottom: 3px solid var(--text-accent);
      }
      
      .step-btn[title*="Ocultar"], .step-btn[title*="Mostrar"] {
        transition: all 0.2s ease;
      }
      
      .step-btn[title*="Ocultar"]:hover {
        background: #dc2626 !important;
      }
      
      .step-btn[title*="Mostrar"]:hover {
        background: #059669 !important;
      }
      
      @media (max-width: 768px) {
        .global-order-item {
          padding: 12px;
        }
        
        .global-order-item .step-controls {
          position: static;
          margin-left: 0;
          margin-top: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .drag-handle {
          display: none;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }

  updateUI() {
    if (window.globalOrderingUI && window.globalOrderingUI.renderOrder) {
      window.globalOrderingUI.renderOrder();
    }
    this.updatePrompt();
    this.scheduleAutoSave();
  }

  updatePrompt() {
    if (window.updatePrompt) {
      window.updatePrompt();
    }
  }

  scheduleAutoSave() {
    if (window.scheduleAutoSave) {
      window.scheduleAutoSave();
    }
  }

  // ==========================================
  // IMPORTACIÓN/EXPORTACIÓN
  // ==========================================

  exportData() {
    return {
      orderingEnabled: true,
      globalOrder: state.globalOrder || []
    };
  }

  importData(data) {
    state.orderingEnabled = true;
    
    if (data.globalOrder && Array.isArray(data.globalOrder)) {
      state.globalOrder = data.globalOrder;
      state.globalOrder.forEach(item => {
        if (item.visible === undefined) {
          item.visible = true;
        }
      });
    } else {
      state.globalOrder = this.generateDetailedOrder();
    }
    
    this.syncElementChanges();
  }
}

// Instancia global
const globalOrderingManager = new GlobalOrderingManager();

// Exportar globalmente
window.globalOrderingManager = globalOrderingManager;

// Funciones legacy para compatibilidad
window.initializeGlobalOrdering = () => globalOrderingManager.init();
window.moveGlobalElement = (fromIndex, toIndex) => globalOrderingManager.moveElement(fromIndex, toIndex);
window.moveGlobalElementUp = (index) => globalOrderingManager.moveElementUp(index);
window.moveGlobalElementDown = (index) => globalOrderingManager.moveElementDown(index);
window.addElementToGlobalOrder = (type, id, name, position, visible) => globalOrderingManager.addElement(type, id, name, position, visible);
window.removeElementFromGlobalOrder = (index) => globalOrderingManager.removeElement(index);
window.updateElementInGlobalOrder = (index, newName) => globalOrderingManager.updateElement(index, newName);
window.toggleElementVisibility = (index) => globalOrderingManager.toggleElementVisibility(index);
window.toggleAllElementsVisibility = () => globalOrderingManager.toggleAllElementsVisibility();
window.isElementVisible = (type, id) => globalOrderingManager.isElementVisible(type, id);
window.getVisibilityStats = () => globalOrderingManager.getVisibilityStats();
window.syncElementChanges = () => globalOrderingManager.syncElementChanges();
window.resetGlobalOrder = () => globalOrderingManager.resetOrder();
window.getElementByTypeAndId = (type, id) => globalOrderingManager.getElementByTypeAndId(type, id);
window.validateGlobalOrder = () => globalOrderingManager.validateGlobalOrder();
window.repairGlobalOrder = () => globalOrderingManager.repairGlobalOrder();
window.generateDetailedOrder = () => globalOrderingManager.generateDetailedOrder();
window.exportGlobalOrderData = () => globalOrderingManager.exportData();
window.importGlobalOrderData = (data) => globalOrderingManager.importData(data);
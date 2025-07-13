// ==========================================
// SISTEMA DE ORDENAMIENTO GLOBAL CON VISIBILIDAD
// ==========================================

// Función de inicialización principal (SIMPLIFICADA)
function initializeGlobalOrdering() {
  // Agregar estilos
  addGlobalOrderingStyles();
  
  // Si no hay orden global, crearlo
  if (!state.globalOrder || state.globalOrder.length === 0) {
    state.globalOrder = generateDetailedOrder();
  }
  
  // Asegurar que esté siempre habilitado
  state.orderingEnabled = true;
  
  // Asegurar que todos los elementos tengan propiedad visible
  state.globalOrder.forEach(item => {
    if (item.visible === undefined) {
      item.visible = true; // Por defecto visible
    }
  });
  
  // Validar y reparar si es necesario
  setTimeout(() => {
    const validation = validateGlobalOrder();
    if (!validation.valid) {
      console.warn('Orden global inválido, reparando...', validation.errors);
      repairGlobalOrder();
    }
  }, 200);
}

// Verificar si el orden global está habilitado (SIEMPRE TRUE)
function isGlobalOrderingEnabled() {
  return true; // Siempre activo
}

// Generar orden detallado basado en estado actual (con visibilidad)
function generateDetailedOrder() {
  const order = [];
  
  // Agregar todas las secciones
  state.sections.forEach((section, index) => {
    order.push({ type: 'section', id: index, name: section.name, visible: true });
  });
  
  // Agregar todos los flujos
  state.flows.forEach((flow, index) => {
    order.push({ type: 'flow', id: index, name: flow.name, visible: true });
  });
  
  // Agregar FAQs como un bloque
  if (state.faqs && state.faqs.length > 0) {
    order.push({ type: 'faqs', id: 'all', name: 'Preguntas Frecuentes', visible: true });
  }
  
  return order;
}

// ==========================================
// FUNCIONES DE REORDENAMIENTO GLOBAL
// ==========================================

function moveGlobalElement(fromIndex, toIndex) {
  if (fromIndex === toIndex || !state.globalOrder) return;
  
  const order = state.globalOrder;
  if (fromIndex < 0 || fromIndex >= order.length || toIndex < 0 || toIndex >= order.length) {
    return;
  }
  
  // Mover elemento
  const [movedElement] = order.splice(fromIndex, 1);
  order.splice(toIndex, 0, movedElement);
  
  // Actualizar prompt y guardar
  updatePrompt();
  scheduleAutoSave();
  renderGlobalOrder();
}

function moveGlobalElementUp(index) {
  if (index > 0) {
    moveGlobalElement(index, index - 1);
  }
}

function moveGlobalElementDown(index) {
  if (index < state.globalOrder.length - 1) {
    moveGlobalElement(index, index + 1);
  }
}

// ==========================================
// FUNCIONES DE GESTIÓN DE ELEMENTOS CON VISIBILIDAD
// ==========================================

function addElementToGlobalOrder(type, id, name, position = -1) {
  if (!state.globalOrder) {
    state.globalOrder = [];
  }
  
  const element = { type, id, name, visible: true }; // Por defecto visible
  
  if (position === -1) {
    state.globalOrder.push(element);
  } else {
    state.globalOrder.splice(position, 0, element);
  }
  
  renderGlobalOrder();
  updatePrompt();
  scheduleAutoSave();
}

function removeElementFromGlobalOrder(index) {
  if (!state.globalOrder || index < 0 || index >= state.globalOrder.length) {
    return;
  }
  
  state.globalOrder.splice(index, 1);
  renderGlobalOrder();
  updatePrompt();
  scheduleAutoSave();
}

function updateElementInGlobalOrder(index, newName) {
  if (!state.globalOrder || index < 0 || index >= state.globalOrder.length) {
    return;
  }
  
  state.globalOrder[index].name = newName;
  renderGlobalOrder();
  updatePrompt();
  scheduleAutoSave();
}

// ==========================================
// FUNCIONES DE VISIBILIDAD
// ==========================================

// Alternar visibilidad de un elemento específico
function toggleElementVisibility(index) {
  if (!state.globalOrder || index < 0 || index >= state.globalOrder.length) return;
  
  const item = state.globalOrder[index];
  item.visible = item.visible !== false ? false : true; // Toggle visibility
  
  // Actualizar UI y prompt
  renderGlobalOrder();
  updatePrompt();
  scheduleAutoSave();
}

// Alternar visibilidad de todos los elementos
function toggleAllElementsVisibility() {
  if (!state.globalOrder) return;
  
  // Verificar si hay elementos ocultos
  const hasHiddenElements = state.globalOrder.some(item => item.visible === false);
  
  if (hasHiddenElements) {
    // Si hay elementos ocultos, mostrar todos
    state.globalOrder.forEach(item => {
      item.visible = true;
    });
  } else {
    // Si todos están visibles, ocultar todos excepto el primero
    state.globalOrder.forEach((item, index) => {
      item.visible = index === 0; // Solo el primer elemento visible
    });
  }
  
  // Actualizar UI y prompt
  renderGlobalOrder();
  updatePrompt();
  scheduleAutoSave();
}

// Verificar si un elemento está visible
function isElementVisible(type, id) {
  if (!state.globalOrder) return true;
  
  const item = state.globalOrder.find(item => 
    item.type === type && item.id === id
  );
  
  return item ? (item.visible !== false) : true;
}

// Obtener estadísticas de visibilidad
function getVisibilityStats() {
  if (!state.globalOrder) return { total: 0, visible: 0, hidden: 0 };
  
  const total = state.globalOrder.length;
  const visible = state.globalOrder.filter(item => item.visible !== false).length;
  const hidden = total - visible;
  
  return { total, visible, hidden };
}

// ==========================================
// SINCRONIZACIÓN CON ELEMENTOS EXISTENTES
// ==========================================

// Sincronizar cuando se agregan/eliminan/renombran secciones
function syncSectionWithGlobalOrder(action, sectionIndex, sectionName) {
  if (!state.globalOrder) return;
  
  switch (action) {
    case 'add':
      addElementToGlobalOrder('section', sectionIndex, sectionName);
      break;
      
    case 'remove':
      // Encontrar y eliminar la sección del orden global
      const indexToRemove = state.globalOrder.findIndex(
        item => item.type === 'section' && item.id === sectionIndex
      );
      if (indexToRemove !== -1) {
        removeElementFromGlobalOrder(indexToRemove);
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
        updateElementInGlobalOrder(indexToUpdate, sectionName);
      }
      break;
  }
}

// Sincronizar cuando se agregan/eliminan/renombran flujos
function syncFlowWithGlobalOrder(action, flowIndex, flowName) {
  if (!state.globalOrder) return;
  
  switch (action) {
    case 'add':
      addElementToGlobalOrder('flow', flowIndex, flowName);
      break;
      
    case 'remove':
      const indexToRemove = state.globalOrder.findIndex(
        item => item.type === 'flow' && item.id === flowIndex
      );
      if (indexToRemove !== -1) {
        removeElementFromGlobalOrder(indexToRemove);
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
        updateElementInGlobalOrder(indexToUpdate, flowName);
      }
      break;
  }
}

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

function resetGlobalOrder() {
  if (confirm('¿Restablecer el orden a la configuración por defecto?')) {
    state.globalOrder = generateDetailedOrder();
    renderGlobalOrder();
    updatePrompt();
    scheduleAutoSave();
  }
}

// Obtener elemento por tipo e ID
function getElementByTypeAndId(type, id) {
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
// FUNCIONES DE VALIDACIÓN Y UTILIDAD
// ==========================================

// Validar la integridad del orden global
function validateGlobalOrder() {
  if (!state.globalOrder || !Array.isArray(state.globalOrder)) {
    return { valid: false, errors: ['El orden global no es válido'] };
  }
  
  const errors = [];
  const duplicates = {};
  
  state.globalOrder.forEach((item, index) => {
    // Validar estructura del elemento
    if (!item.type || !item.hasOwnProperty('id') || !item.name) {
      errors.push(`Elemento ${index + 1}: estructura inválida`);
      return;
    }
    
    // Validar tipos permitidos
    if (!['section', 'flow', 'faqs'].includes(item.type)) {
      errors.push(`Elemento ${index + 1}: tipo "${item.type}" no válido`);
      return;
    }
    
    // Verificar duplicados
    const key = `${item.type}-${item.id}`;
    if (duplicates[key]) {
      errors.push(`Elemento ${index + 1}: duplicado de "${item.name}"`);
    } else {
      duplicates[key] = true;
    }
    
    // Validar que el elemento existe
    const element = getElementByTypeAndId(item.type, item.id);
    if (!element && item.type !== 'faqs') {
      errors.push(`Elemento ${index + 1}: "${item.name}" no existe`);
    }
    
    // Asegurar que tenga propiedad visible
    if (item.visible === undefined) {
      item.visible = true;
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Reparar orden global automáticamente
function repairGlobalOrder() {
  console.log('Reparando orden global...');
  
  const validation = validateGlobalOrder();
  if (validation.valid) {
    console.log('El orden global es válido');
    return true;
  }
  
  console.log('Errores encontrados:', validation.errors);
  
  // Regenerar orden basado en elementos existentes
  state.globalOrder = generateDetailedOrder();
  
  console.log('Orden global reparado');
  renderGlobalOrder();
  updatePrompt();
  scheduleAutoSave();
  
  return true;
}

// ==========================================
// SINCRONIZACIÓN AUTOMÁTICA
// ==========================================

// Hook para sincronizar cuando se modifican elementos
function syncElementChanges() {
  // Verificar si hay elementos nuevos que no están en el orden global
  const currentOrder = state.globalOrder || [];
  
  // Verificar secciones
  state.sections.forEach((section, index) => {
    const exists = currentOrder.some(item => item.type === 'section' && item.id === index);
    if (!exists) {
      addElementToGlobalOrder('section', index, section.name);
    }
  });
  
  // Verificar flujos
  state.flows.forEach((flow, index) => {
    const exists = currentOrder.some(item => item.type === 'flow' && item.id === index);
    if (!exists) {
      addElementToGlobalOrder('flow', index, flow.name);
    }
  });
  
  // Verificar FAQs
  if (state.faqs && state.faqs.length > 0) {
    const exists = currentOrder.some(item => item.type === 'faqs');
    if (!exists) {
      addElementToGlobalOrder('faqs', 'all', 'Preguntas Frecuentes');
    }
  } else {
    // Remover FAQs del orden si no hay preguntas
    const faqIndex = currentOrder.findIndex(item => item.type === 'faqs');
    if (faqIndex !== -1) {
      removeElementFromGlobalOrder(faqIndex);
    }
  }
  
  // Limpiar elementos huérfanos (elementos que ya no existen)
  const elementsToRemove = [];
  currentOrder.forEach((item, index) => {
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
      elementsToRemove.push(index);
    }
  });
  
  // Remover elementos huérfanos (en orden inverso para no afectar índices)
  elementsToRemove.reverse().forEach(index => {
    removeElementFromGlobalOrder(index);
  });
}

// ==========================================
// ESTILOS CSS (AGREGAR DINÁMICAMENTE)
// ==========================================

function addGlobalOrderingStyles() {
  // Verificar si ya se agregaron los estilos
  if (document.getElementById('global-ordering-styles')) return;
  
  const styles = document.createElement('style');
  styles.id = 'global-ordering-styles';
  styles.textContent = `
    /* Estilos para el sistema de ordenamiento global con visibilidad */
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
    
    /* Estilos para elementos ocultos */
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
    
    /* Animaciones para los elementos */
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
    
    /* Mejoras para la pestaña de ordenamiento */
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
    
    /* Botones de visibilidad */
    .step-btn[title*="Ocultar"], .step-btn[title*="Mostrar"] {
      transition: all 0.2s ease;
    }
    
    .step-btn[title*="Ocultar"]:hover {
      background: #dc2626 !important;
    }
    
    .step-btn[title*="Mostrar"]:hover {
      background: #059669 !important;
    }
    
    /* Responsive para dispositivos móviles */
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

// ==========================================
// HOOKS DE INTEGRACIÓN CON SISTEMA EXISTENTE
// ==========================================

// Hooks para las funciones existentes de secciones
const originalAddSection = window.addSection;
window.addSection = function() {
  const initialLength = state.sections.length;
  originalAddSection();
  
  // Si se agregó una nueva sección, sincronizar con orden global
  if (state.sections.length > initialLength) {
    const newIndex = state.sections.length - 1;
    syncSectionWithGlobalOrder('add', newIndex, state.sections[newIndex].name);
  }
};

const originalDeleteSection = window.deleteSection;
window.deleteSection = function() {
  if (state.sections.length <= 1) {
    alert("Debe haber al menos una sección");
    return;
  }
  
  const currentIndex = state.currentSection;
  const sectionName = state.sections[currentIndex].name;
  
  if (confirm(`¿Eliminar la sección "${sectionName}"?`)) {
    // Sincronizar antes de eliminar
    syncSectionWithGlobalOrder('remove', currentIndex, sectionName);
    
    state.sections.splice(currentIndex, 1);
    state.currentSection = Math.max(0, state.currentSection - 1);
    renderSections();
    renderSectionContent();
    updatePrompt();
    scheduleAutoSave();
  }
};

const originalRenameSection = window.renameSection;
window.renameSection = function() {
  const newName = document.getElementById('section-name').value.trim();
  if (newName) {
    const currentIndex = state.currentSection;
    state.sections[currentIndex].name = newName;
    
    // Sincronizar el cambio de nombre
    syncSectionWithGlobalOrder('rename', currentIndex, newName);
    
    renderSections();
    updatePrompt();
    scheduleAutoSave();
  }
};

// Hooks para las funciones existentes de flujos
const originalAddFlow = window.addFlow;
window.addFlow = function() {
  const name = prompt("Nombre del nuevo flujo:", `Flujo ${state.flows.length + 1}`);
  if (name && name.trim()) {
    const initialLength = state.flows.length;
    state.flows.push({ 
      name: name.trim(), 
      steps: [{ text: '', functions: [] }] 
    });
    state.currentFlow = state.flows.length - 1;
    
    // Sincronizar con orden global
    syncFlowWithGlobalOrder('add', state.currentFlow, name.trim());
    
    renderFlows();
    renderSteps();
    updatePrompt();
    scheduleAutoSave();
  }
};

const originalDeleteFlow = window.deleteFlow;
window.deleteFlow = function() {
  if (state.flows.length <= 1) {
    alert("Debe haber al menos un flujo");
    return;
  }
  
  const currentIndex = state.currentFlow;
  const flowName = state.flows[currentIndex].name;
  
  if (confirm(`¿Eliminar el flujo "${flowName}"?`)) {
    // Sincronizar antes de eliminar
    syncFlowWithGlobalOrder('remove', currentIndex, flowName);
    
    state.flows.splice(currentIndex, 1);
    state.currentFlow = Math.max(0, state.currentFlow - 1);
    renderFlows();
    renderSteps();
    updatePrompt();
    scheduleAutoSave();
  }
};

const originalRenameFlow = window.renameFlow;
window.renameFlow = function() {
  const newName = document.getElementById('flow-name').value.trim();
  if (newName) {
    const currentIndex = state.currentFlow;
    state.flows[currentIndex].name = newName;
    
    // Sincronizar el cambio de nombre
    syncFlowWithGlobalOrder('rename', currentIndex, newName);
    
    renderFlows();
    updatePrompt();
    scheduleAutoSave();
  }
};

// Hook para FAQs
const originalAddFAQ = window.addFAQ;
window.addFAQ = function() {
  const wasEmpty = state.faqs.length === 0;
  originalAddFAQ();
  
  // Si antes no había FAQs y ahora sí, agregar al orden global
  if (wasEmpty && state.faqs.length > 0) {
    const exists = state.globalOrder.some(item => item.type === 'faqs');
    if (!exists) {
      addElementToGlobalOrder('faqs', 'all', 'Preguntas Frecuentes');
    }
  }
};

const originalRemoveFAQ = window.removeFAQ;
window.removeFAQ = function(index) {
  if (confirm('¿Eliminar esta pregunta frecuente?')) {
    state.faqs.splice(index, 1);
    
    // Si no quedan FAQs, remover del orden global
    if (state.faqs.length === 0) {
      const faqIndex = state.globalOrder.findIndex(item => item.type === 'faqs');
      if (faqIndex !== -1) {
        removeElementFromGlobalOrder(faqIndex);
      }
    }
    
    renderFAQs();
    updatePrompt();
    scheduleAutoSave();
  }
};

// ==========================================
// FUNCIONES DE EXPORTACIÓN E IMPORTACIÓN
// ==========================================

// Funciones para incluir el orden global con visibilidad en el guardado/carga de proyectos
function exportGlobalOrderData() {
  return {
    orderingEnabled: true, // Siempre true
    globalOrder: state.globalOrder || []
  };
}

function importGlobalOrderData(data) {
  // Siempre habilitar ordenamiento
  state.orderingEnabled = true;
  
  if (data.globalOrder && Array.isArray(data.globalOrder)) {
    state.globalOrder = data.globalOrder;
    // Asegurar que todos los elementos tengan propiedad visible
    state.globalOrder.forEach(item => {
      if (item.visible === undefined) {
        item.visible = true; // Por defecto visible para elementos importados
      }
    });
  } else {
    // Generar orden por defecto si no existe
    state.globalOrder = generateDetailedOrder();
  }
  
  // Validar y limpiar el orden importado
  syncElementChanges();
}

// ==========================================
// FUNCIONES DE DEPURACIÓN (DESARROLLO)
// ==========================================

// Funciones para debugging (remover en producción)
window.debugGlobalOrdering = {
  getState: () => ({
    enabled: state.orderingEnabled,
    order: state.globalOrder,
    stats: getVisibilityStats()
  }),
  
  validate: validateGlobalOrder,
  repair: repairGlobalOrder,
  
  enable: () => {
    state.orderingEnabled = true;
    state.globalOrder = generateDetailedOrder();
    renderGlobalOrderTab();
    updatePrompt();
  },
  
  disable: () => {
    state.orderingEnabled = false;
    state.globalOrder = [];
    updatePrompt();
  },
  
  showAll: () => {
    state.globalOrder.forEach(item => item.visible = true);
    renderGlobalOrder();
    updatePrompt();
  },
  
  hideAll: () => {
    state.globalOrder.forEach(item => item.visible = false);
    renderGlobalOrder();
    updatePrompt();
  }
};
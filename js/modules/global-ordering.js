// ==========================================
// SISTEMA DE ORDENAMIENTO GLOBAL
// ==========================================

// Agregar al objeto state en js/core/state.js
const globalOrderingExtension = {
  // Orden global de elementos en el prompt
  globalOrder: [
    { type: 'sections', id: 'all' }, // Todas las secciones
    { type: 'flows', id: 'all' },    // Todos los flujos  
    { type: 'faqs', id: 'all' }      // Todas las FAQs
  ],
  
  // Configuración de visualización
  orderingEnabled: false
};

// Función para extender el estado actual
function enableGlobalOrdering() {
  // Agregar propiedades al estado existente
  Object.assign(state, globalOrderingExtension);
  
  // Si hay secciones individuales, crear orden detallado
  if (state.sections && state.sections.length > 0) {
    state.globalOrder = generateDetailedOrder();
  }
}

// Generar orden detallado basado en estado actual
function generateDetailedOrder() {
  const order = [];
  
  // Agregar todas las secciones
  state.sections.forEach((section, index) => {
    order.push({ type: 'section', id: index, name: section.name });
  });
  
  // Agregar todos los flujos
  state.flows.forEach((flow, index) => {
    order.push({ type: 'flow', id: index, name: flow.name });
  });
  
  // Agregar FAQs como un bloque
  if (state.faqs && state.faqs.length > 0) {
    order.push({ type: 'faqs', id: 'all', name: 'Preguntas Frecuentes' });
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
// FUNCIONES DE GESTIÓN DE ELEMENTOS
// ==========================================

function addElementToGlobalOrder(type, id, name, position = -1) {
  if (!state.globalOrder) {
    state.globalOrder = [];
  }
  
  const element = { type, id, name };
  
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
// SINCRONIZACIÓN CON ELEMENTOS EXISTENTES
// ==========================================

// Sincronizar cuando se agregan/eliminan/renombran secciones
function syncSectionWithGlobalOrder(action, sectionIndex, sectionName) {
  if (!state.orderingEnabled || !state.globalOrder) return;
  
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
  if (!state.orderingEnabled || !state.globalOrder) return;
  
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

function toggleGlobalOrdering() {
  if (!state.hasOwnProperty('orderingEnabled')) {
    enableGlobalOrdering();
  }
  
  state.orderingEnabled = !state.orderingEnabled;
  
  if (state.orderingEnabled && !state.globalOrder) {
    state.globalOrder = generateDetailedOrder();
  }
  
  renderGlobalOrderTab();
  updatePrompt();
  scheduleAutoSave();
}

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

// Verificar si el orden global está habilitado
function isGlobalOrderingEnabled() {
  return state.orderingEnabled === true && state.globalOrder && state.globalOrder.length > 0;
}
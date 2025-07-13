// ==========================================
// GENERACIÓN DE PROMPT CON ORDEN GLOBAL
// ==========================================

// Función updatePrompt actualizada para usar el orden global
function updatePromptWithGlobalOrder() {
  const businessName = document.getElementById('business-name')?.value || '[Nombre negocio]';

  let html = '';
  
  // Título principal con color
  html += `<span class="output-title">Prompt para Asistente IA – "${businessName}"</span>\n\n`;

  if (isGlobalOrderingEnabled()) {
    // Usar orden global personalizado
    state.globalOrder.forEach(item => {
      const content = generateElementContent(item);
      if (content) {
        html += content + '\n';
      }
    });
  } else {
    // Usar orden por defecto (comportamiento original)
    html += generateDefaultOrderContent();
  }

  // Actualizar output con HTML coloreado
  document.getElementById('output').innerHTML = html.trim();
}

// Generar contenido para un elemento específico del orden global
function generateElementContent(item) {
  switch (item.type) {
    case 'section':
      return generateSectionContent(item.id);
    case 'flow':
      return generateFlowContent(item.id);
    case 'faqs':
      return generateFAQsContent();
    default:
      return '';
  }
}

// Generar contenido de una sección específica
function generateSectionContent(sectionIndex) {
  const section = state.sections[sectionIndex];
  if (!section) return '';
  
  const validFields = section.fields.filter(field => {
    // Validar encabezados H1, H2, H3
    if (field.type === 'h1' || field.type === 'h2' || field.type === 'h3') {
      return field.value && field.value.trim();
    }
    // Validar otros tipos de campos
    if (field.type === 'text') return field.items && field.items.some(item => item.trim());
    if (field.type === 'textarea') return field.value && field.value.trim();
    if (field.type === 'list') return field.items && field.items.some(item => item.trim());
    return false;
  });
  
  if (validFields.length === 0) return '';
  
  let html = `<span class="output-section">${section.name}:</span>\n`;
  
  validFields.forEach(field => {
    // Renderizar encabezados H1, H2, H3
    if (field.type === 'h1') {
      html += `<span class="output-h1">${field.value}</span>\n`;
    } else if (field.type === 'h2') {
      html += `<span class="output-h2">${field.value}</span>\n`;
    } else if (field.type === 'h3') {
      html += `<span class="output-h3">${field.value}</span>\n`;
    } else if (field.type === 'text') {
      const validItems = field.items.filter(item => item.trim());
      if (validItems.length > 0) {
        validItems.forEach((item) => {
          html += `- ${item}\n`;
        });
      }
    } else if (field.type === 'textarea') {
      html += `${field.value}\n`;
    } else if (field.type === 'list') {
      const validItems = field.items.filter(item => item.trim());
      if (validItems.length > 0) {
        validItems.forEach((item, index) => {
          html += `<span class="output-step-number">${index + 1}.</span> ${item}\n`;
        });
      }
    }
  });
  
  return html;
}

// Generar contenido de un flujo específico
function generateFlowContent(flowIndex) {
  const flow = state.flows[flowIndex];
  if (!flow || !flow.steps || flow.steps.length === 0) return '';
  
  const title = state.flows.length === 1 ? "Flujo principal:" : `${flow.name}:`;
  let html = `<span class="output-section">${title}</span>\n`;
  
  flow.steps.forEach((step, stepIndex) => {
    if (!step.text || !step.text.trim()) return;
    
    html += `<span class="output-step-number">${stepIndex + 1}.</span> ${step.text}`;
    
    // Agregar funciones del paso con colores
    if (step.functions && step.functions.length > 0) {
      step.functions.forEach(func => {
        const funcDef = functions.get(func.type);
        if (funcDef) {
          const customFields = func.customFields || [];
          const params = func.params || {};
          
          // Determinar el nombre de la función a mostrar
          let functionName = func.type; // Usar el nombre técnico por defecto
          let displayParams = [];
          
          // Para la función "formularios", usar el parámetro nombre_formulario como nombre
          if (func.type === 'formularios' && params.nombre_formulario) {
            functionName = params.nombre_formulario;
            // Solo agregar campos personalizados como parámetros
            displayParams = customFields
              .filter(field => field.name && field.value)
              .map(field => `<span class="output-keyword">${field.name}</span>: <span class="output-string">"${field.value}"</span>`);
          } else {
            // Para otras funciones, usar el nombre técnico y agregar todos los parámetros
            const predefinedParams = Object.entries(params)
              .filter(([key, value]) => value)
              .map(([key, value]) => `<span class="output-keyword">${key}</span>: <span class="output-string">"${value}"</span>`);
            
            const customParams = customFields
              .filter(field => field.name && field.value)
              .map(field => `<span class="output-keyword">${field.name}</span>: <span class="output-string">"${field.value}"</span>`);
            
            displayParams = [...predefinedParams, ...customParams];
          }
          
          const allParams = displayParams.join(', ');
          html += `\n    <span class="output-function">Ejecuta la función: ${functionName}({${allParams}})</span>`;
        }
      });
    }
    html += '\n';
  });
  
  return html;
}

// Generar contenido de FAQs
function generateFAQsContent() {
  const validFaqs = state.faqs.filter(f => f.question.trim());
  if (validFaqs.length === 0) return '';
  
  let html = `<span class="output-section">Preguntas Frecuentes:</span>\n`;
  validFaqs.forEach(faq => {
    html += `- <span class="output-question">${faq.question}</span>\n`;
    if (faq.answer.trim()) {
      html += `  <span class="output-answer">${faq.answer}</span>\n`;
    }
  });
  
  return html;
}

// Generar contenido con orden por defecto (comportamiento original)
function generateDefaultOrderContent() {
  let html = '';
  
  // Secciones dinámicas
  state.sections.forEach(section => {
    const content = generateSectionContent(state.sections.indexOf(section));
    if (content) {
      html += content + '\n';
    }
  });

  // Flujos
  state.flows.forEach((flow, flowIndex) => {
    const content = generateFlowContent(flowIndex);
    if (content) {
      html += content;
    }
  });

  // Preguntas frecuentes (movidas al final)
  const faqContent = generateFAQsContent();
  if (faqContent) {
    html += faqContent + '\n';
  }
  
  return html;
}

// Reemplazar la función updatePrompt original
const originalUpdatePrompt = window.updatePrompt;
window.updatePrompt = updatePromptWithGlobalOrder;

// ==========================================
// SINCRONIZACIÓN AUTOMÁTICA
// ==========================================

// Hook para sincronizar cuando se modifican elementos
function syncElementChanges() {
  if (!isGlobalOrderingEnabled()) return;
  
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
// EXPORTACIÓN E IMPORTACIÓN CON ORDEN GLOBAL
// ==========================================

// Funciones para incluir el orden global en el guardado/carga de proyectos
function exportGlobalOrderData() {
  return {
    orderingEnabled: state.orderingEnabled || false,
    globalOrder: state.globalOrder || []
  };
}

function importGlobalOrderData(data) {
  if (data.orderingEnabled !== undefined) {
    state.orderingEnabled = data.orderingEnabled;
  }
  if (data.globalOrder && Array.isArray(data.globalOrder)) {
    state.globalOrder = data.globalOrder;
  }
  
  // Validar y limpiar el orden importado
  if (state.orderingEnabled && state.globalOrder) {
    syncElementChanges();
  }
}

// ==========================================
// INTEGRACIÓN CON SISTEMA EXISTENTE
// ==========================================

// Hooks para las funciones existentes de secciones
const originalAddSection = window.addSection;
window.addSection = function() {
  const initialLength = state.sections.length;
  originalAddSection();
  
  // Si se agregó una nueva sección y el ordenamiento está activo
  if (state.sections.length > initialLength && isGlobalOrderingEnabled()) {
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
    if (isGlobalOrderingEnabled()) {
      syncSectionWithGlobalOrder('remove', currentIndex, sectionName);
    }
    
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
    if (isGlobalOrderingEnabled()) {
      syncSectionWithGlobalOrder('rename', currentIndex, newName);
    }
    
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
    
    // Sincronizar si el ordenamiento está activo
    if (isGlobalOrderingEnabled()) {
      syncFlowWithGlobalOrder('add', state.currentFlow, name.trim());
    }
    
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
    if (isGlobalOrderingEnabled()) {
      syncFlowWithGlobalOrder('remove', currentIndex, flowName);
    }
    
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
    if (isGlobalOrderingEnabled()) {
      syncFlowWithGlobalOrder('rename', currentIndex, newName);
    }
    
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
  if (wasEmpty && state.faqs.length > 0 && isGlobalOrderingEnabled()) {
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
    if (state.faqs.length === 0 && isGlobalOrderingEnabled()) {
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
// INICIALIZACIÓN
// ==========================================

// Modificar la inicialización para incluir el toggle de ordenamiento
document.addEventListener('DOMContentLoaded', function() {
  // Esperar a que se carguen los elementos básicos
  setTimeout(() => {
    addGlobalOrderingToggle();
    
    // Si el ordenamiento está habilitado, mostrar la pestaña
    if (state.orderingEnabled) {
      renderGlobalOrderTab();
    }
  }, 100);
});
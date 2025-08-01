    // ==========================================
// INTEGRACIÓN DE TEXTAREA AUTO-RESIZE
// ==========================================

// 1. AGREGAR ESTILOS CSS (añadir a css/components.css)
const autoResizeStyles = `
/* Estilos para textareas auto-redimensionables */
.autoresize {
  overflow: hidden;
  resize: none;
  min-height: 60px; /* Altura mínima para mantener consistencia */
  transition: height 0.1s ease; /* Transición suave */
  line-height: 1.4; /* Altura de línea consistente */
}

/* Evitar que el textarea crezca demasiado */
.autoresize.max-height {
  max-height: 300px;
  overflow-y: auto;
  resize: vertical;
}
`;

// 2. FUNCIÓN PARA INICIALIZAR AUTO-RESIZE
function initializeAutoResize() {
  // Agregar estilos si no existen
  if (!document.getElementById('autoresize-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'autoresize-styles';
    styleSheet.textContent = autoResizeStyles;
    document.head.appendChild(styleSheet);
  }

  // Event listener global para auto-resize
  document.addEventListener('input', function (e) {
    if (e.target.classList.contains('autoresize')) {
      autoResizeTextarea(e.target);
    }
  });

  // También redimensionar al cargar la página
  document.addEventListener('DOMContentLoaded', function() {
    resizeAllTextareas();
  });
}

// 3. FUNCIÓN PARA REDIMENSIONAR UN TEXTAREA ESPECÍFICO
function autoResizeTextarea(textarea) {
  // Resetear altura para obtener la altura correcta del contenido
  textarea.style.height = 'auto';
  
  // Calcular nueva altura basada en scrollHeight
  const newHeight = Math.max(60, textarea.scrollHeight); // Mínimo 60px
  
  // Si tiene clase max-height, limitar a 300px
  if (textarea.classList.contains('max-height')) {
    textarea.style.height = Math.min(newHeight, 300) + 'px';
  } else {
    textarea.style.height = newHeight + 'px';
  }
}

// 4. FUNCIÓN PARA REDIMENSIONAR TODOS LOS TEXTAREAS EXISTENTES
function resizeAllTextareas() {
  document.querySelectorAll('.autoresize').forEach(textarea => {
    autoResizeTextarea(textarea);
  });
}

// 5. MODIFICACIONES A LAS FUNCIONES DE RENDERIZADO EXISTENTES

// A. Modificar renderSectionContent() en sections.js
function renderSectionContentWithAutoResize() {
  const container = document.getElementById('section-content-container');
  const currentSection = state.sections[state.currentSection];
  
  container.innerHTML = currentSection.fields.map((field, fieldIndex) => {
    const fieldControls = `
      <div class="step-controls">
        ${fieldIndex > 0 ? `<button class="step-btn" onclick="moveField(${fieldIndex}, -1)" title="Subir">↑</button>` : ''}
        ${fieldIndex < currentSection.fields.length - 1 ? `<button class="step-btn" onclick="moveField(${fieldIndex}, 1)" title="Bajar">↓</button>` : ''}
        <button class="step-btn btn-danger" onclick="removeField(${fieldIndex})" title="Eliminar">×</button>
      </div>
    `;

    if (field.type === 'textarea') {
      return `
        <div class="step">
          <div class="step-header">
            <span class="step-number type-textarea">📄 ${escapeHtml(field.label)}</span>
            <button class="step-btn" onclick="editFieldLabel(${fieldIndex})" title="Editar nombre" style="margin-right: 8px;">✏️</button>
            <button class="step-btn" onclick="duplicateField(${fieldIndex})" title="Duplicar" style="margin-right: 8px;">📄</button>
            ${fieldControls}
          </div>
          
          <div class="form-group">
            <textarea class="autoresize max-height" 
                      placeholder="Ingresa el texto..." 
                      oninput="updateTextField(${fieldIndex}, this.value)">${escapeHtml(field.value)}</textarea>
          </div>
        </div>
      `;
    }
    
    // ... resto del código original para otros tipos de campos
    
  }).join('');
  
  // Redimensionar textareas después de renderizar
  setTimeout(resizeAllTextareas, 10);
}

// B. Modificar renderSteps() en flows.js
function renderStepsWithAutoResize() {
  const container = document.getElementById('steps-container');
  const currentFlow = state.flows[state.currentFlow];
  
  container.innerHTML = currentFlow.steps.map((step, index) => `
    <div class="step">
      <div class="step-header">
        <span class="step-number">Paso ${index + 1}</span>
        <div class="step-controls">
          <button class="step-btn" onclick="duplicateStep(${index})" title="Duplicar">📄</button>
          ${index > 0 ? `<button class="step-btn" onclick="moveStep(${index}, -1)" title="Subir">↑</button>` : ''}
          ${index < currentFlow.steps.length - 1 ? `<button class="step-btn" onclick="moveStep(${index}, 1)" title="Bajar">↓</button>` : ''}
          <button class="step-btn btn-danger" onclick="removeStep(${index})" title="Eliminar">×</button>
        </div>
      </div>
      
      <div class="form-group">
        <label>Mensaje del paso:</label>
        <textarea class="autoresize max-height" 
                  placeholder="Descripción de lo que debe hacer el asistente en este paso..." 
                  oninput="updateStepText(${index}, this.value)">${escapeHtml(step.text)}</textarea>
      </div>
      
      ${renderStepFunctions(index, step.functions)}
    </div>
  `).join('');
  
  // Redimensionar textareas después de renderizar
  setTimeout(resizeAllTextareas, 10);
}

// C. Modificar renderFAQs() en faqs.js
function renderFAQsWithAutoResize() {
  const container = document.getElementById('faq-container');
  container.innerHTML = state.faqs.map((faq, index) => `
    <div class="list-item" style="flex-direction: column; align-items: stretch; background: var(--bg-tertiary); padding: 12px; border-radius: 6px; border: 1px solid var(--border-secondary); position: relative; margin-bottom: 12px;">
      <div class="step-controls" style="position: absolute; top: 8px; right: 40px; display: flex; gap: 4px;">
        ${index > 0 ? `<button class="step-btn" onclick="moveFAQ(${index}, -1)" title="Subir">↑</button>` : ''}
        ${index < state.faqs.length - 1 ? `<button class="step-btn" onclick="moveFAQ(${index}, 1)" title="Bajar">↓</button>` : ''}
      </div>
      <button class="delete-btn" onclick="removeFAQ(${index})">×</button>
      <label>Pregunta:</label>
      <input type="text" value="${escapeHtml(faq.question)}" placeholder="Pregunta frecuente..."
             oninput="updateFAQ(${index}, 'question', this.value)" style="margin-bottom: 8px;">
      <label>Respuesta:</label>
      <textarea class="autoresize max-height" 
                placeholder="Respuesta..." 
                oninput="updateFAQ(${index}, 'answer', this.value)">${escapeHtml(faq.answer)}</textarea>
    </div>
  `).join('');
  
  // Redimensionar textareas después de renderizar
  setTimeout(resizeAllTextareas, 10);
}

// D. Modificar renderStepFunctions() en step-functions.js para campos personalizados
function renderCustomFieldsWithAutoResize(stepIndex, funcIndex, func) {
  const customFields = func.customFields || [];
  
  return `
    <div style="margin-top: 12px;">
      <label style="color: var(--text-accent); margin-bottom: 8px; display: block;">Campos personalizados:</label>
      
      ${customFields.map((field, fieldIndex) => {
        const fieldControls = `
          <div class="step-controls" style="position: absolute; top: 8px; right: 8px;">
            <button class="step-btn" onclick="duplicateCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex})" title="Duplicar campo">📄</button>
            ${fieldIndex > 0 ? `<button class="step-btn" onclick="moveCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex}, -1)" title="Subir campo">↑</button>` : ''}
            ${fieldIndex < customFields.length - 1 ? `<button class="step-btn" onclick="moveCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex}, 1)" title="Bajar campo">↓</button>` : ''}
            <button class="step-btn btn-danger" onclick="removeCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex})" title="Eliminar campo">×</button>
          </div>
        `;
        
        return `
          <div class="custom-field" style="background: var(--bg-tertiary); border: 1px solid var(--border-secondary); border-radius: 6px; padding: 12px; margin-bottom: 8px; position: relative;">
            ${fieldControls}
            
            <div class="form-group">
              <label>Nombre del campo:</label>
              <input type="text" value="${escapeHtml(field.name || '')}" 
                     placeholder="Ej: nombre_formulario, whatsapp, mensaje..."
                     oninput="updateCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex}, 'name', this.value)">
            </div>
            
            <div class="form-group">
              <label>Valor:</label>
              <textarea class="autoresize max-height" 
                        placeholder="Valor del campo..." 
                        oninput="updateCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex}, 'value', this.value)">${escapeHtml(field.value || '')}</textarea>
            </div>
          </div>
        `;
      }).join('')}
      
      <button type="button" class="btn-small" onclick="addCustomField(${stepIndex}, ${funcIndex})">➕ Agregar Campo</button>
    </div>
  `;
}

// 6. FUNCIÓN PARA APLICAR AUTOMÁTICAMENTE AUTO-RESIZE A TEXTAREAS EXISTENTES
function upgradeExistingTextareas() {
  // Encontrar todos los textareas existentes que no tengan la clase autoresize
  document.querySelectorAll('textarea:not(.autoresize)').forEach(textarea => {
    textarea.classList.add('autoresize');
    
    // Si el textarea es muy alto, agregar max-height
    if (textarea.rows > 3 || textarea.style.height === '' || parseInt(textarea.style.height) > 100) {
      textarea.classList.add('max-height');
    }
    
    // Redimensionar inmediatamente
    autoResizeTextarea(textarea);
  });
}

// 7. FUNCIÓN DE INICIALIZACIÓN PRINCIPAL
function initAutoResizeSystem() {
  console.log('Inicializando sistema de auto-resize para textareas...');
  
  // Inicializar el sistema
  initializeAutoResize();
  
  // Actualizar textareas existentes
  upgradeExistingTextareas();
  
  // Observar cambios en el DOM para auto-aplicar a nuevos textareas
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) { // Es un elemento
          // Buscar textareas en el nodo agregado
          const textareas = node.querySelectorAll ? node.querySelectorAll('textarea') : [];
          textareas.forEach(textarea => {
            if (!textarea.classList.contains('autoresize')) {
              textarea.classList.add('autoresize');
              if (!textarea.classList.contains('max-height')) {
                textarea.classList.add('max-height');
              }
              autoResizeTextarea(textarea);
            }
          });
          
          // Si el nodo mismo es un textarea
          if (node.tagName === 'TEXTAREA' && !node.classList.contains('autoresize')) {
            node.classList.add('autoresize', 'max-height');
            autoResizeTextarea(node);
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('Sistema de auto-resize inicializado correctamente');
}

// 8. INTEGRACIÓN CON EL SISTEMA EXISTENTE
// Agregar al final de events.js:
document.addEventListener('DOMContentLoaded', function() {
  // ... código existente ...
  
  // Inicializar sistema de auto-resize
  initAutoResizeSystem();
  
  // Redimensionar textareas cuando se cambia de pestaña
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('tab')) {
      setTimeout(resizeAllTextareas, 100);
    }
  });
});

// 9. FUNCIONES DE UTILIDAD ADICIONALES

// Función para forzar redimensionamiento manual
function forceResizeTextarea(selector) {
  const textarea = document.querySelector(selector);
  if (textarea) {
    autoResizeTextarea(textarea);
  }
}

// Función para redimensionar textareas en un contenedor específico
function resizeTextareasInContainer(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (container) {
    container.querySelectorAll('.autoresize').forEach(autoResizeTextarea);
  }
}

// Función para desactivar auto-resize temporalmente
function disableAutoResize(textarea) {
  textarea.classList.remove('autoresize');
  textarea.style.resize = 'vertical';
}

// Función para reactivar auto-resize
function enableAutoResize(textarea) {
  textarea.classList.add('autoresize');
  textarea.style.resize = 'none';
  autoResizeTextarea(textarea);
}

// EXPORTAR FUNCIONES PRINCIPALES
window.autoResizeSystem = {
  init: initAutoResizeSystem,
  resize: autoResizeTextarea,
  resizeAll: resizeAllTextareas,
  upgrade: upgradeExistingTextareas,
  forceResize: forceResizeTextarea,
  resizeInContainer: resizeTextareasInContainer,
  disable: disableAutoResize,
  enable: enableAutoResize
};
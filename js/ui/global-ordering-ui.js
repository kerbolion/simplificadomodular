// ==========================================
// INTERFAZ DE USUARIO PARA ORDENAMIENTO GLOBAL CON VISIBILIDAD
// ==========================================

// Renderizar la pestaña de ordenamiento global (SIEMPRE VISIBLE)
function renderGlobalOrderTab() {
  // Buscar si existe la pestaña de ordenamiento
  let orderingTab = document.querySelector('.tab[data-tab="ordering"]');
  let orderingContent = document.getElementById('tab-ordering');
  
  // Crear pestaña si no existe (SIEMPRE)
  if (!orderingTab) {
    const tabsContainer = document.querySelector('.tabs');
    orderingTab = document.createElement('button');
    orderingTab.className = 'tab';
    orderingTab.setAttribute('data-tab', 'ordering');
    orderingTab.onclick = () => showTab('ordering');
    orderingTab.innerHTML = '📋 Orden';
    tabsContainer.appendChild(orderingTab);
  }
  
  // Crear contenido si no existe (SIEMPRE)
  if (!orderingContent) {
    orderingContent = document.createElement('div');
    orderingContent.className = 'tab-content';
    orderingContent.id = 'tab-ordering';
    
    const lastTabContent = document.querySelector('#tab-3');
    if (lastTabContent && lastTabContent.parentNode) {
      lastTabContent.parentNode.appendChild(orderingContent);
    }
  }
  
  // Actualizar contenido
  orderingContent.innerHTML = `
    <div class="section">
      <h3>📋 Orden Global de Elementos</h3>
      <p style="color: var(--text-secondary); margin-bottom: 16px; font-size: 14px;">
        Arrastra y reorganiza los elementos para cambiar el orden en el que aparecen en el prompt final. 
        Usa el ojo para ocultar/mostrar elementos en el prompt.
      </p>
      
      <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
        <button type="button" class="btn-small" onclick="resetGlobalOrder()">🔄 Restablecer Orden</button>
        <button type="button" class="btn-small" onclick="toggleAllElementsVisibility()">👁️ Mostrar/Ocultar Todo</button>
        <span style="font-size: 13px; color: var(--text-accent); align-self: center; background: var(--text-accent)20; padding: 4px 8px; border-radius: 4px; font-weight: 600;">
          ✅ Orden personalizado activo
        </span>
      </div>
      
      <div id="global-order-container"></div>
    </div>
  `;
  
  renderGlobalOrder();
}

// Renderizar lista de elementos en orden global
function renderGlobalOrder() {
  const container = document.getElementById('global-order-container');
  if (!container || !state.globalOrder) return;
  
  container.innerHTML = state.globalOrder.map((item, index) => {
    const element = getElementByTypeAndId(item.type, item.id);
    if (!element && item.type !== 'faqs') return '';
    
    // Configuración por tipo de elemento
    const typeConfig = {
      'section': { icon: '📄', color: '#6366f1', label: 'Sección' },
      'flow': { icon: '🔄', color: '#059669', label: 'Flujo' },
      'faqs': { icon: '❓', color: '#f59e0b', label: 'FAQ' }
    };
    
    const config = typeConfig[item.type] || { icon: '📄', color: '#6b7280', label: 'Elemento' };
    
    // Obtener nombre del elemento
    let elementName = item.name;
    if (item.type === 'section' && element) {
      elementName = element.name;
    } else if (item.type === 'flow' && element) {
      elementName = element.name;
    }
    
    // Información adicional
    let additionalInfo = '';
    if (item.type === 'section' && element) {
      additionalInfo = `${element.fields.length} campos`;
    } else if (item.type === 'flow' && element) {
      additionalInfo = `${element.steps.length} pasos`;
    } else if (item.type === 'faqs') {
      additionalInfo = `${state.faqs.length} preguntas`;
    }
    
    // Verificar si el elemento está visible
    const isVisible = item.visible !== false; // Por defecto visible
    
    return `
      <div class="global-order-item ${!isVisible ? 'hidden-element' : ''}" data-index="${index}" 
           style="background: var(--bg-tertiary); border: 2px solid var(--border-secondary); border-radius: 8px; padding: 16px; margin-bottom: 12px; position: relative; transition: all 0.2s ease; cursor: grab; ${!isVisible ? 'opacity: 0.5;' : ''}">
        
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
            <div style="background: ${config.color}20; color: ${config.color}; padding: 8px; border-radius: 6px; display: flex; align-items: center; justify-content: center; min-width: 40px; font-size: 16px;">
              ${config.icon}
            </div>
            
            <div style="flex: 1;">
              <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 2px; ${!isVisible ? 'text-decoration: line-through;' : ''}">
                ${escapeHtml(elementName)}
                ${!isVisible ? ' <span style="color: var(--text-secondary); font-size: 12px;">(Oculto)</span>' : ''}
              </div>
              <div style="font-size: 12px; color: var(--text-secondary);">
                ${config.label}${additionalInfo ? ` • ${additionalInfo}` : ''}
              </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 4px; color: var(--text-secondary); font-size: 14px;">
              <span style="background: var(--bg-secondary); padding: 4px 8px; border-radius: 4px; font-weight: 600; min-width: 30px; text-align: center;">
                ${index + 1}
              </span>
            </div>
          </div>
          
          <div class="step-controls" style="margin-left: 16px;">
            ${index > 0 ? `<button class="step-btn" onclick="moveGlobalElementUp(${index})" title="Subir">↑</button>` : ''}
            ${index < state.globalOrder.length - 1 ? `<button class="step-btn" onclick="moveGlobalElementDown(${index})" title="Bajar">↓</button>` : ''}
            <button class="step-btn" onclick="toggleElementVisibility(${index})" title="${isVisible ? 'Ocultar elemento' : 'Mostrar elemento'}" 
                    style="background: ${isVisible ? '#ef4444' : '#10b981'}; color: white;">
              ${isVisible ? '👁️' : '🙈'}
            </button>
            <button class="step-btn" onclick="goToElement('${item.type}', ${item.id})" title="Ir al elemento" style="background: ${config.color}; color: white;">
              ➡️
            </button>
          </div>
        </div>
        
        <div class="drag-handle" style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); cursor: grab; font-size: 12px;">
          ⋮⋮
        </div>
      </div>
    `;
  }).join('');
  
  // Inicializar drag and drop
  initializeDragAndDrop();
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

// ==========================================
// FUNCIONES EXISTENTES ACTUALIZADAS
// ==========================================

// Inicializar funcionalidad de drag and drop
function initializeDragAndDrop() {
  const container = document.getElementById('global-order-container');
  if (!container) return;
  
  let draggedElement = null;
  let draggedIndex = null;
  
  // Agregar event listeners a los elementos
  container.querySelectorAll('.global-order-item').forEach((item, index) => {
    item.draggable = true;
    
    item.addEventListener('dragstart', (e) => {
      draggedElement = item;
      draggedIndex = parseInt(item.dataset.index);
      item.style.opacity = '0.3';
      item.style.transform = 'scale(0.95)';
      e.dataTransfer.effectAllowed = 'move';
    });
    
    item.addEventListener('dragend', (e) => {
      item.style.opacity = '';
      item.style.transform = '';
      draggedElement = null;
      draggedIndex = null;
    });
    
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    
    item.addEventListener('dragenter', (e) => {
      e.preventDefault();
      if (item !== draggedElement) {
        item.style.borderColor = 'var(--text-accent)';
        item.style.background = 'var(--text-accent)10';
      }
    });
    
    item.addEventListener('dragleave', (e) => {
      item.style.borderColor = '';
      item.style.background = '';
    });
    
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.style.borderColor = '';
      item.style.background = '';
      
      if (draggedElement && draggedElement !== item) {
        const targetIndex = parseInt(item.dataset.index);
        moveGlobalElement(draggedIndex, targetIndex);
      }
    });
  });
}

// Ir al elemento específico
function goToElement(type, id) {
  switch (type) {
    case 'section':
      state.currentSection = id;
      showTab(0); // Pestaña de configuración
      renderSections();
      renderSectionContent();
      break;
      
    case 'flow':
      state.currentFlow = id;
      showTab(1); // Pestaña de flujos
      renderFlows();
      renderSteps();
      break;
      
    case 'faqs':
      showTab(2); // Pestaña de FAQs
      break;
  }
}

// Modificar la función showTab existente para incluir la pestaña de ordenamiento
const originalShowTab = window.showTab;
window.showTab = function(index) {
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
    // Usar función original para pestañas numéricas
    originalShowTab(index);
  }
};
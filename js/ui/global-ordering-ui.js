// ==========================================
// INTERFAZ DE USUARIO PARA ORDENAMIENTO GLOBAL
// ==========================================

// Renderizar la pestaña de ordenamiento global
function renderGlobalOrderTab() {
  // Buscar si existe la pestaña de ordenamiento
  let orderingTab = document.querySelector('.tab[data-tab="ordering"]');
  let orderingContent = document.getElementById('tab-ordering');
  
  if (state.orderingEnabled) {
    // Crear pestaña si no existe
    if (!orderingTab) {
      const tabsContainer = document.querySelector('.tabs');
      orderingTab = document.createElement('button');
      orderingTab.className = 'tab';
      orderingTab.setAttribute('data-tab', 'ordering');
      orderingTab.onclick = () => showTab('ordering');
      orderingTab.innerHTML = '📋 Orden';
      tabsContainer.appendChild(orderingTab);
    }
    
    // Crear contenido si no existe
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
        </p>
        
        <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
          <button type="button" class="btn-small" onclick="resetGlobalOrder()">🔄 Restablecer Orden</button>
          <button type="button" class="btn-small btn-warning" onclick="toggleGlobalOrdering()">❌ Desactivar Ordenamiento</button>
        </div>
        
        <div id="global-order-container"></div>
      </div>
    `;
    
    renderGlobalOrder();
  } else {
    // Remover pestaña y contenido si existen
    if (orderingTab) {
      orderingTab.remove();
    }
    if (orderingContent) {
      orderingContent.remove();
    }
  }
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
    
    return `
      <div class="global-order-item" data-index="${index}" 
           style="background: var(--bg-tertiary); border: 2px solid var(--border-secondary); border-radius: 8px; padding: 16px; margin-bottom: 12px; position: relative; transition: all 0.2s ease; cursor: grab;">
        
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
            <div style="background: ${config.color}20; color: ${config.color}; padding: 8px; border-radius: 6px; display: flex; align-items: center; justify-content: center; min-width: 40px; font-size: 16px;">
              ${config.icon}
            </div>
            
            <div style="flex: 1;">
              <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">
                ${escapeHtml(elementName)}
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
            <button class="step-btn" onclick="goToElement('${item.type}', ${item.id})" title="Ir al elemento" style="background: ${config.color}; color: white;">👁️</button>
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
      item.style.opacity = '0.5';
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

// Agregar botón para activar ordenamiento global en la pestaña principal
function addGlobalOrderingToggle() {
  const configTab = document.getElementById('tab-0');
  if (!configTab) return;
  
  // Buscar si ya existe el toggle
  let existingToggle = document.getElementById('global-ordering-toggle');
  if (existingToggle) {
    existingToggle.remove();
  }
  
  // Crear section para el toggle
  const toggleSection = document.createElement('div');
  toggleSection.id = 'global-ordering-toggle';
  toggleSection.className = 'section';
  toggleSection.style.background = 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))';
  toggleSection.style.borderColor = 'var(--text-accent)';
  
  toggleSection.innerHTML = `
    <h3>📋 Ordenamiento Global</h3>
    <p style="color: var(--text-secondary); margin-bottom: 16px; font-size: 14px;">
      Organiza el orden de aparición de secciones, flujos y FAQs en el prompt final.
    </p>
    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
      <button type="button" class="btn-small" onclick="toggleGlobalOrdering()" style="background: linear-gradient(90deg, #6366f1, #8b5cf6); color: white;">
        ${state.orderingEnabled ? '✅ Ordenamiento Activo' : '🔧 Activar Ordenamiento'}
      </button>
      ${state.orderingEnabled ? `
        <button type="button" class="btn-small" onclick="showTab('ordering')" style="background: var(--text-accent); color: white;">
          📋 Gestionar Orden
        </button>
      ` : ''}
      <span style="font-size: 12px; color: var(--text-secondary);">
        ${state.orderingEnabled ? 'El orden personalizado está activo' : 'Usa el orden por defecto (Secciones → Flujos → FAQs)'}
      </span>
    </div>
  `;
  
  // Insertar al final de la pestaña de configuración
  configTab.appendChild(toggleSection);
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
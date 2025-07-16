// ==========================================
// INTERFAZ DE USUARIO PARA ORDENAMIENTO GLOBAL OPTIMIZADA
// ==========================================

class GlobalOrderingUI {
  constructor() {
    this.draggedElement = null;
    this.draggedIndex = null;
  }

  // ==========================================
  // RENDERIZADO PRINCIPAL
  // ==========================================

  renderTab() {
    let orderingTab = document.querySelector('.tab[data-tab="ordering"]');
    let orderingContent = document.getElementById('tab-ordering');
    
    // Crear pestaña si no existe
    if (!orderingTab) {
      const tabsContainer = document.querySelector('.tabs');
      orderingTab = document.createElement('button');
      orderingTab.className = 'tab';
      orderingTab.setAttribute('data-tab', 'ordering');
      orderingTab.onclick = () => this.showTab();
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
    orderingContent.innerHTML = this.generateTabContent();
    this.renderOrder();
  }

  generateTabContent() {
    return `
      <div class="section">
        <h3>📋 Orden Global de Elementos</h3>
        <p style="color: var(--text-secondary); margin-bottom: 16px; font-size: 14px;">
          Arrastra y reorganiza los elementos para cambiar el orden en el que aparecen en el prompt final. 
          Usa el ojo para ocultar/mostrar elementos en el prompt.
        </p>
        
        <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
          <button type="button" class="btn-small" onclick="globalOrderingUI.resetOrder()">🔄 Restablecer Orden</button>
          <button type="button" class="btn-small" onclick="globalOrderingUI.toggleAllVisibility()">👁️ Mostrar/Ocultar Todo</button>
          <span style="font-size: 13px; color: var(--text-accent); align-self: center; background: var(--text-accent)20; padding: 4px 8px; border-radius: 4px; font-weight: 600;">
            ✅ Orden personalizado activo
          </span>
        </div>
        
        <div id="global-order-container"></div>
      </div>
    `;
  }

  renderOrder() {
    const container = document.getElementById('global-order-container');
    if (!container || !state.globalOrder) return;
    
    container.innerHTML = state.globalOrder.map((item, index) => 
      this.renderOrderItem(item, index)
    ).join('');
    
    this.initializeDragAndDrop();
  }

  renderOrderItem(item, index) {
    const element = globalOrderingManager.getElementByTypeAndId(item.type, item.id);
    if (!element && item.type !== 'faqs') return '';
    
    const config = this.getTypeConfig(item.type);
    const elementName = this.getElementName(item, element);
    const additionalInfo = this.getAdditionalInfo(item.type, element);
    const isVisible = item.visible !== false;
    
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
                ${TextUtils.escapeHtml(elementName)}
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
          
          ${this.renderItemControls(index, isVisible, item)}
        </div>
        
        <div class="drag-handle" style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); cursor: grab; font-size: 12px;">
          ⋮⋮
        </div>
      </div>
    `;
  }

  renderItemControls(index, isVisible, item) {
    const config = this.getTypeConfig(item.type);
    
    return `
      <div class="step-controls" style="margin-left: 16px;">
        ${index > 0 ? `<button class="step-btn" onclick="globalOrderingUI.moveUp(${index})" title="Subir">↑</button>` : ''}
        ${index < state.globalOrder.length - 1 ? `<button class="step-btn" onclick="globalOrderingUI.moveDown(${index})" title="Bajar">↓</button>` : ''}
        <button class="step-btn" onclick="globalOrderingUI.toggleVisibility(${index})" title="${isVisible ? 'Ocultar elemento' : 'Mostrar elemento'}" 
                style="background: ${isVisible ? '#ef4444' : '#10b981'}; color: white;">
          ${isVisible ? '👁️' : '🙈'}
        </button>
        <button class="step-btn" onclick="globalOrderingUI.goToElement('${item.type}', ${item.id})" title="Ir al elemento" style="background: ${config.color}; color: white;">
          ➡️
        </button>
      </div>
    `;
  }

  // ==========================================
  // DRAG AND DROP
  // ==========================================

  initializeDragAndDrop() {
    const container = document.getElementById('global-order-container');
    if (!container) return;
    
    container.querySelectorAll('.global-order-item').forEach((item, index) => {
      item.draggable = true;
      
      item.addEventListener('dragstart', (e) => this.handleDragStart(e, item, index));
      item.addEventListener('dragend', (e) => this.handleDragEnd(e, item));
      item.addEventListener('dragover', (e) => this.handleDragOver(e));
      item.addEventListener('dragenter', (e) => this.handleDragEnter(e, item));
      item.addEventListener('dragleave', (e) => this.handleDragLeave(e, item));
      item.addEventListener('drop', (e) => this.handleDrop(e, item));
    });
  }

  handleDragStart(e, item, index) {
    this.draggedElement = item;
    this.draggedIndex = parseInt(item.dataset.index);
    item.style.opacity = '0.3';
    item.style.transform = 'scale(0.95)';
    e.dataTransfer.effectAllowed = 'move';
  }

  handleDragEnd(e, item) {
    item.style.opacity = '';
    item.style.transform = '';
    this.draggedElement = null;
    this.draggedIndex = null;
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  handleDragEnter(e, item) {
    e.preventDefault();
    if (item !== this.draggedElement) {
      item.style.borderColor = 'var(--text-accent)';
      item.style.background = 'var(--text-accent)10';
    }
  }

  handleDragLeave(e, item) {
    item.style.borderColor = '';
    item.style.background = '';
  }

  handleDrop(e, item) {
    e.preventDefault();
    item.style.borderColor = '';
    item.style.background = '';
    
    if (this.draggedElement && this.draggedElement !== item) {
      const targetIndex = parseInt(item.dataset.index);
      globalOrderingManager.moveElement(this.draggedIndex, targetIndex);
    }
  }

  // ==========================================
  // ACCIONES DE USUARIO
  // ==========================================

  moveUp(index) {
    globalOrderingManager.moveElementUp(index);
  }

  moveDown(index) {
    globalOrderingManager.moveElementDown(index);
  }

  toggleVisibility(index) {
    globalOrderingManager.toggleElementVisibility(index);
  }

  toggleAllVisibility() {
    globalOrderingManager.toggleAllElementsVisibility();
  }

  resetOrder() {
    globalOrderingManager.resetOrder();
  }

  goToElement(type, id) {
    switch (type) {
      case 'section':
        state.currentSection = id;
        this.showTab(0);
        if (window.sectionManager) {
          sectionManager.renderSections();
          sectionManager.renderSectionContent();
        }
        break;
        
      case 'flow':
        state.currentFlow = id;
        this.showTab(1);
        if (window.flowManager) {
          flowManager.renderFlows();
          flowManager.renderSteps();
        }
        break;
        
      case 'faqs':
        this.showTab(2);
        break;
    }
  }

  showTab(index = 'ordering') {
    if (index === 'ordering') {
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
      if (window.showTab) {
        window.showTab(index);
      }
    }
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  getTypeConfig(type) {
    const configs = {
      'section': { icon: '📄', color: '#6366f1', label: 'Sección' },
      'flow': { icon: '🔄', color: '#059669', label: 'Flujo' },
      'faqs': { icon: '❓', color: '#f59e0b', label: 'FAQ' }
    };
    
    return configs[type] || { icon: '📄', color: '#6b7280', label: 'Elemento' };
  }

  getElementName(item, element) {
    if (item.type === 'section' && element) {
      return element.name;
    } else if (item.type === 'flow' && element) {
      return element.name;
    }
    return item.name;
  }

  getAdditionalInfo(type, element) {
    if (type === 'section' && element) {
      return `${element.fields.length} campos`;
    } else if (type === 'flow' && element) {
      return `${element.steps.length} pasos`;
    } else if (type === 'faqs') {
      return `${state.faqs.length} preguntas`;
    }
    return '';
  }
}

// Instancia global
const globalOrderingUI = new GlobalOrderingUI();

// Exportar globalmente
window.globalOrderingUI = globalOrderingUI;

// Funciones legacy para compatibilidad
window.renderGlobalOrderTab = () => globalOrderingUI.renderTab();
window.renderGlobalOrder = () => globalOrderingUI.renderOrder();

// Modificar la función showTab existente para incluir la pestaña de ordenamiento
const originalShowTab = window.showTab;
window.showTab = function(index) {
  if (index === 'ordering') {
    globalOrderingUI.showTab('ordering');
  } else {
    if (originalShowTab) {
      originalShowTab(index);
    } else {
      // Fallback si no existe la función original
      document.querySelectorAll('.tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
      });
      document.querySelectorAll('.tab-content').forEach((content, i) => {
        content.classList.toggle('active', i === index);
      });
      state.currentTab = index;
    }
  }
};
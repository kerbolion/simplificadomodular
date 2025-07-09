// ==========================================
// MÓDULO DE RENDERIZADO DE UI
// ==========================================

const ui = {
  render: {
    // ==========================================
    // RENDERIZADO PRINCIPAL
    // ==========================================
    
    // Renderizar todos los componentes
    all() {
      this.projects();
      this.sections();
      this.flows();
      this.faqs();
      this.functions();
    },

    // ==========================================
    // GESTIÓN DE PESTAÑAS
    // ==========================================
    
    // Mostrar pestaña específica
    showTab(index) {
      document.querySelectorAll('.tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
      });
      document.querySelectorAll('.tab-content').forEach((content, i) => {
        content.classList.toggle('active', i === index);
      });
      state.currentTab = index;
      
      // Trigger específico por pestaña
      this.onTabChange(index);
    },

    // Manejar cambio de pestaña
    onTabChange(index) {
      switch(index) {
        case 0: // Configuración
          sections.renderContent();
          break;
        case 1: // Flujos
          flows.renderSteps();
          break;
        case 2: // FAQs
          faqs.render();
          break;
        case 3: // Funciones
          functions.render();
          break;
      }
    },

    // ==========================================
    // RENDERIZADO DE MÓDULOS
    // ==========================================
    
    // Renderizar sección de proyectos
    projects() {
      if (projects.render) {
        projects.render();
        projects.renderVersions();
      }
    },

    // Renderizar secciones de configuración
    sections() {
      if (sections.render) {
        sections.render();
        sections.renderContent();
      }
    },

    // Renderizar flujos
    flows() {
      if (flows.render) {
        flows.render();
        flows.renderSteps();
      }
    },

    // Renderizar FAQs
    faqs() {
      if (faqs.render) {
        faqs.render();
      }
    },

    // Renderizar funciones
    functions() {
      if (functions.render) {
        functions.render();
      }
    },

    // ==========================================
    // COMPONENTES ESPECÍFICOS
    // ==========================================
    
    // Renderizar selector genérico
    renderSelector(elementId, options, selectedValue = '', emptyOption = null) {
      const selector = utils.getElement(elementId);
      if (!selector) return;

      let html = '';
      
      if (emptyOption) {
        html += `<option value="">${emptyOption}</option>`;
      }
      
      options.forEach(option => {
        const value = typeof option === 'object' ? option.value : option;
        const label = typeof option === 'object' ? option.label : option;
        const selected = value === selectedValue ? 'selected' : '';
        html += `<option value="${utils.escapeHtml(value)}" ${selected}>${utils.escapeHtml(label)}</option>`;
      });
      
      selector.innerHTML = html;
    },

    // Renderizar lista con controles
    renderListWithControls(containerId, items, renderItemCallback, options = {}) {
      const container = utils.getElement(containerId);
      if (!container) return;

      const {
        showMoveControls = true,
        showDeleteControls = true,
        emptyMessage = 'No hay elementos',
        itemClass = 'list-item'
      } = options;

      if (items.length === 0) {
        container.innerHTML = `<p style="color: var(--text-secondary); font-style: italic;">${emptyMessage}</p>`;
        return;
      }

      container.innerHTML = items.map((item, index) => {
        const controls = this.renderItemControls(index, items.length, showMoveControls, showDeleteControls, options.onMove, options.onDelete);
        return `
          <div class="${itemClass}" data-index="${index}">
            ${renderItemCallback(item, index)}
            ${controls}
          </div>
        `;
      }).join('');
    },

    // Renderizar controles de elemento
    renderItemControls(index, totalItems, showMove, showDelete, onMove, onDelete) {
      if (!showMove && !showDelete) return '';

      let controls = '<div class="item-controls">';
      
      if (showMove) {
        if (index > 0) {
          controls += `<button class="btn-small" onclick="${onMove}(${index}, -1)" title="Subir">↑</button>`;
        }
        if (index < totalItems - 1) {
          controls += `<button class="btn-small" onclick="${onMove}(${index}, 1)" title="Bajar">↓</button>`;
        }
      }
      
      if (showDelete) {
        controls += `<button class="btn-small btn-danger" onclick="${onDelete}(${index})" title="Eliminar">×</button>`;
      }
      
      controls += '</div>';
      return controls;
    },

    // ==========================================
    // FORMULARIOS DINÁMICOS
    // ==========================================
    
    // Renderizar campo de formulario
    renderFormField(field, value = '', onChange = null) {
      const {
        type = 'text',
        name,
        label,
        placeholder = '',
        required = false,
        options = [],
        rows = 3
      } = field;

      const requiredMark = required ? ' *' : '';
      const onChangeAttr = onChange ? `oninput="${onChange}"` : '';
      
      let html = `<div class="form-group">`;
      
      if (label) {
        html += `<label>${utils.escapeHtml(label)}${requiredMark}:</label>`;
      }
      
      switch (type) {
        case 'textarea':
          html += `<textarea 
            name="${name}" 
            placeholder="${utils.escapeHtml(placeholder)}" 
            rows="${rows}"
            ${onChangeAttr}
            ${required ? 'required' : ''}
          >${utils.escapeHtml(value)}</textarea>`;
          break;
          
        case 'select':
          html += `<select name="${name}" ${onChangeAttr} ${required ? 'required' : ''}>`;
          if (!required) {
            html += `<option value="">Seleccionar...</option>`;
          }
          options.forEach(option => {
            const optValue = typeof option === 'object' ? option.value : option;
            const optLabel = typeof option === 'object' ? option.label : option;
            const selected = optValue === value ? 'selected' : '';
            html += `<option value="${utils.escapeHtml(optValue)}" ${selected}>${utils.escapeHtml(optLabel)}</option>`;
          });
          html += '</select>';
          break;
          
        case 'checkbox':
          html += `<label class="checkbox-label">
            <input type="checkbox" name="${name}" ${value ? 'checked' : ''} ${onChangeAttr}>
            ${utils.escapeHtml(label || name)}
          </label>`;
          break;
          
        default: // text, email, etc.
          html += `<input 
            type="${type}" 
            name="${name}" 
            value="${utils.escapeHtml(value)}" 
            placeholder="${utils.escapeHtml(placeholder)}"
            ${onChangeAttr}
            ${required ? 'required' : ''}
          >`;
      }
      
      html += '</div>';
      return html;
    },

    // ==========================================
    // MODALES Y DIÁLOGOS
    // ==========================================
    
    // Crear modal simple
    createModal(title, content, buttons = []) {
      const modalId = `modal-${utils.generateId()}`;
      
      const modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'modal-overlay';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      `;
      
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      modalContent.style.cssText = `
        background: var(--bg-secondary);
        border-radius: var(--border-radius-lg);
        padding: var(--spacing-lg);
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      `;
      
      modalContent.innerHTML = `
        <div class="modal-header" style="margin-bottom: var(--spacing-md);">
          <h3 style="margin: 0;">${utils.escapeHtml(title)}</h3>
          <button class="modal-close" onclick="ui.render.closeModal('${modalId}')" style="float: right; background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        <div class="modal-footer" style="margin-top: var(--spacing-md); text-align: right;">
          ${buttons.map(btn => 
            `<button class="btn-small ${btn.class || ''}" onclick="${btn.onclick || ''}">${btn.text}</button>`
          ).join('')}
        </div>
      `;
      
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
      
      // Cerrar al hacer clic fuera
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modalId);
        }
      });
      
      return modalId;
    },

    // Cerrar modal
    closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.remove();
      }
    },

    // ==========================================
    // NOTIFICACIONES
    // ==========================================
    
    // Mostrar notificación toast
    showToast(message, type = 'info', duration = 3000) {
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      
      const colors = {
        success: 'var(--success)',
        error: 'var(--danger)',
        warning: 'var(--warning)',
        info: 'var(--text-accent)'
      };
      
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 16px;
        border-radius: var(--border-radius);
        z-index: 9999;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform var(--transition-normal);
      `;
      
      toast.textContent = message;
      document.body.appendChild(toast);
      
      // Animar entrada
      setTimeout(() => {
        toast.style.transform = 'translateX(0)';
      }, 10);
      
      // Eliminar después del tiempo especificado
      setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, duration);
    },

    // ==========================================
    // INDICADORES DE ESTADO
    // ==========================================
    
    // Mostrar loading spinner
    showLoading(elementId, message = 'Cargando...') {
      const element = utils.getElement(elementId);
      if (!element) return;

      const originalContent = element.innerHTML;
      element.dataset.originalContent = originalContent;
      
      element.innerHTML = `
        <div style="text-align: center; padding: var(--spacing-lg);">
          <div style="
            border: 3px solid var(--border-secondary);
            border-top: 3px solid var(--text-accent);
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto var(--spacing-sm);
          "></div>
          <p style="color: var(--text-secondary);">${utils.escapeHtml(message)}</p>
        </div>
      `;
      
      // Agregar animación si no existe
      if (!document.getElementById('spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.textContent = `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
    },

    // Ocultar loading spinner
    hideLoading(elementId) {
      const element = utils.getElement(elementId);
      if (!element) return;

      const originalContent = element.dataset.originalContent;
      if (originalContent) {
        element.innerHTML = originalContent;
        delete element.dataset.originalContent;
      }
    },

    // ==========================================
    // UTILIDADES DE RENDERIZADO
    // ==========================================
    
    // Renderizar badge/etiqueta
    renderBadge(text, type = 'default') {
      const colors = {
        success: 'var(--success)',
        error: 'var(--danger)',
        warning: 'var(--warning)',
        info: 'var(--text-accent)',
        default: 'var(--text-secondary)'
      };
      
      return `
        <span style="
          background: ${colors[type] || colors.default};
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        ">${utils.escapeHtml(text)}</span>
      `;
    },

    // Renderizar barra de progreso
    renderProgressBar(percentage, showText = true) {
      const clampedPercent = Math.max(0, Math.min(100, percentage));
      
      return `
        <div style="
          background: var(--bg-tertiary);
          border-radius: 10px;
          overflow: hidden;
          height: 20px;
          position: relative;
        ">
          <div style="
            background: linear-gradient(90deg, var(--success), var(--text-accent));
            height: 100%;
            width: ${clampedPercent}%;
            transition: width var(--transition-normal);
          "></div>
          ${showText ? `
            <span style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-size: 12px;
              font-weight: 600;
              color: ${clampedPercent > 50 ? 'white' : 'var(--text-primary)'};
            ">${clampedPercent}%</span>
          ` : ''}
        </div>
      `;
    }
  }
};
// ==========================================
// GESTIÓN DE SECCIONES OPTIMIZADA
// ==========================================

class SectionManager {
  constructor() {
    this.scrollFeedbackTimeout = null;
  }

  // ==========================================
  // OPERACIONES PRINCIPALES
  // ==========================================

  addSection() {
    const name = prompt("Nombre de la nueva sección:", `Sección ${state.sections.length + 1}`);
    if (name && name.trim()) {
      state.sections.push({ 
        name: name.trim(), 
        fields: [] 
      });
      state.currentSection = state.sections.length - 1;
      this.renderSections();
      this.renderSectionContent();
      this.updatePrompt();
      this.scheduleAutoSave();
    }
  }

  duplicateSection() {
    const currentSection = state.sections[state.currentSection];
    const newName = prompt("Nombre para la sección duplicada:", `${currentSection.name} - Copia`);
    
    if (newName && newName.trim()) {
      const duplicatedSection = this.duplicateWithSuffix(currentSection, newName.trim());
      state.sections.splice(state.currentSection + 1, 0, duplicatedSection);
      state.currentSection = state.currentSection + 1;
      
      this.renderSections();
      this.renderSectionContent();
      this.updatePrompt();
      this.scheduleAutoSave();
    }
  }

  deleteSection() {
    if (state.sections.length <= 1) {
      alert("Debe haber al menos una sección");
      return;
    }
    
    if (confirm(`¿Eliminar la sección "${state.sections[state.currentSection].name}"?`)) {
      state.sections.splice(state.currentSection, 1);
      state.currentSection = Math.max(0, state.currentSection - 1);
      this.renderSections();
      this.renderSectionContent();
      this.updatePrompt();
      this.scheduleAutoSave();
    }
  }

  changeSection() {
    state.currentSection = parseInt(document.getElementById('section-selector').value);
    this.renderSectionContent();
    this.renderSectionControls();
    document.getElementById('section-name').value = state.sections[state.currentSection].name;
  }

  renameSection() {
    const newName = document.getElementById('section-name').value.trim();
    if (newName) {
      state.sections[state.currentSection].name = newName;
      this.renderSections();
      this.updatePrompt();
      this.scheduleAutoSave();
    }
  }

  moveSection(direction) {
    const sections = state.sections;
    const currentIndex = state.currentSection;
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < sections.length) {
      [sections[currentIndex], sections[newIndex]] = [sections[newIndex], sections[currentIndex]];
      state.currentSection = newIndex;
      
      this.renderSections();
      this.renderSectionContent();
      this.updatePrompt();
      this.scheduleAutoSave();
    }
  }

  // ==========================================
  // GESTIÓN DE CAMPOS
  // ==========================================

  addField(fieldType) {
    const fieldHandlers = {
      'header': () => this.addHeaderField(),
      'text': () => this.addTextFieldWithPrompt(),
      'textarea': () => this.addTextAreaFieldWithPrompt(),
      'list': () => this.addListFieldWithPrompt()
    };

    const handler = fieldHandlers[fieldType];
    if (handler) {
      handler();
    }
  }

  addHeaderField() {
    const headerType = prompt('Selecciona el tipo de encabezado:\n1 - H1 (Título principal)\n2 - H2 (Subtítulo)\n3 - H3 (Encabezado menor)\n\nEscribe 1, 2 o 3:');
    
    if (!headerType || !['1', '2', '3'].includes(headerType)) return;
    
    const typeMap = { '1': 'h1', '2': 'h2', '3': 'h3' };
    const selectedType = typeMap[headerType];
    
    const value = prompt(`Texto del encabezado H${headerType}:`);
    if (value && value.trim()) {
      state.sections[state.currentSection].fields.push({
        type: selectedType,
        value: value.trim()
      });
      this.updateUI();
    }
  }

  addTextFieldWithPrompt() {
    const label = prompt("Etiqueta del campo:");
    if (label && label.trim()) {
      state.sections[state.currentSection].fields.push({
        type: "text",
        label: label.trim(),
        items: [""]
      });
      this.updateUI();
    }
  }

  addTextAreaFieldWithPrompt() {
    const label = prompt("Etiqueta del área de texto:");
    if (label && label.trim()) {
      state.sections[state.currentSection].fields.push({
        type: "textarea",
        label: label.trim(),
        value: ""
      });
      this.updateUI();
    }
  }

  addListFieldWithPrompt() {
    const label = prompt("Título de la lista:");
    if (label && label.trim()) {
      state.sections[state.currentSection].fields.push({
        type: "list",
        label: label.trim(),
        items: [""]
      });
      this.updateUI();
    }
  }

  editFieldLabel(fieldIndex) {
    const field = state.sections[state.currentSection].fields[fieldIndex];
    const currentLabel = field.label || '';
    const newLabel = prompt('Nuevo nombre para el campo:', currentLabel);
    
    if (newLabel !== null && newLabel.trim()) {
      field.label = newLabel.trim();
      this.updateUI();
    }
  }

  duplicateField(fieldIndex) {
    const fieldToDuplicate = state.sections[state.currentSection].fields[fieldIndex];
    const duplicatedField = this.duplicateFieldWithSuffix(fieldToDuplicate);
    
    state.sections[state.currentSection].fields.splice(fieldIndex + 1, 0, duplicatedField);
    this.updateUI();
  }

  removeField(fieldIndex) {
    if (confirm("¿Eliminar este campo?")) {
      state.sections[state.currentSection].fields.splice(fieldIndex, 1);
      this.updateUI();
    }
  }

  moveField(fieldIndex, direction) {
    const fields = state.sections[state.currentSection].fields;
    const newIndex = fieldIndex + direction;
    
    if (newIndex >= 0 && newIndex < fields.length) {
      [fields[fieldIndex], fields[newIndex]] = [fields[newIndex], fields[fieldIndex]];
      this.updateUI();
    }
  }

  // ==========================================
  // GESTIÓN DE ITEMS EN CAMPOS
  // ==========================================

  addTextItem(fieldIndex) {
    state.sections[state.currentSection].fields[fieldIndex].items.push('');
    this.renderSectionContent();
    this.scheduleAutoSave();
  }

  removeTextItem(fieldIndex, itemIndex) {
    if (confirm('¿Eliminar este elemento?')) {
      state.sections[state.currentSection].fields[fieldIndex].items.splice(itemIndex, 1);
      this.updateUI();
    }
  }

  moveTextItem(fieldIndex, itemIndex, direction) {
    const items = state.sections[state.currentSection].fields[fieldIndex].items;
    const newIndex = itemIndex + direction;
    
    if (newIndex >= 0 && newIndex < items.length) {
      [items[itemIndex], items[newIndex]] = [items[newIndex], items[itemIndex]];
      this.updateUI();
    }
  }

  updateTextItem(fieldIndex, itemIndex, value) {
    state.sections[state.currentSection].fields[fieldIndex].items[itemIndex] = value;
    this.debouncedUpdate();
  }

  addListItem(fieldIndex) {
    state.sections[state.currentSection].fields[fieldIndex].items.push('');
    this.renderSectionContent();
    this.scheduleAutoSave();
  }

  removeListItem(fieldIndex, itemIndex) {
    if (confirm('¿Eliminar este elemento?')) {
      state.sections[state.currentSection].fields[fieldIndex].items.splice(itemIndex, 1);
      this.updateUI();
    }
  }

  moveListItem(fieldIndex, itemIndex, direction) {
    const items = state.sections[state.currentSection].fields[fieldIndex].items;
    const newIndex = itemIndex + direction;
    
    if (newIndex >= 0 && newIndex < items.length) {
      [items[itemIndex], items[newIndex]] = [items[newIndex], items[itemIndex]];
      this.updateUI();
    }
  }

  updateListItem(fieldIndex, itemIndex, value) {
    state.sections[state.currentSection].fields[fieldIndex].items[itemIndex] = value;
    this.debouncedUpdate();
  }

  updateHeaderValue(fieldIndex, value) {
    state.sections[state.currentSection].fields[fieldIndex].value = value;
    this.debouncedUpdate();
  }

  updateTextField(fieldIndex, value) {
    state.sections[state.currentSection].fields[fieldIndex].value = value;
    this.debouncedUpdate();
  }

  // ==========================================
  // FUNCIONES DE SCROLL
  // ==========================================

  scrollToFieldInOutput(fieldIndex) {
    const currentSection = state.sections[state.currentSection];
    const field = currentSection.fields[fieldIndex];
    
    if (!field) {
      console.warn('Campo no encontrado');
      return;
    }
    
    const outputPanel = document.querySelector('.panel.output');
    const outputElement = document.getElementById('output');
    
    if (!outputPanel || !outputElement) {
      console.warn('No se encontró el panel de salida');
      return;
    }
    
    const searchPatterns = this.generateSearchPatterns(field);
    let fieldDescription = this.getFieldDescription(field);
    
    if (searchPatterns.length === 0) {
      const sectionName = currentSection.name;
      const escapedSection = TextUtils.escapeRegex(sectionName);
      searchPatterns.push(new RegExp(`<span class="output-section">${escapedSection}:</span>`, 'i'));
      fieldDescription = `Sección: "${sectionName}"`;
    }
    
    const match = this.findFirstMatch(outputElement.innerHTML, searchPatterns);
    
    if (match) {
      this.scrollToMatch(outputPanel, outputElement, match);
      this.showFieldScrollFeedback(fieldDescription, true);
    } else {
      this.scrollToSectionInOutput();
      this.showFieldScrollFeedback(fieldDescription, false);
    }
  }

  scrollToSectionInOutput() {
    const currentSectionName = state.sections[state.currentSection].name;
    const outputPanel = document.querySelector('.panel.output');
    const outputElement = document.getElementById('output');
    
    if (!outputPanel || !outputElement) {
      console.warn('No se encontró el panel de salida');
      return;
    }
    
    const outputContent = outputElement.innerHTML;
    const sectionPattern = new RegExp(`<span class="output-section">${TextUtils.escapeRegex(currentSectionName)}:</span>`, 'i');
    const match = sectionPattern.exec(outputContent);
    
    if (match) {
      this.scrollToMatch(outputPanel, outputElement, match);
      this.showFieldScrollFeedback(`Sección: "${currentSectionName}"`, true);
    } else {
      outputPanel.scrollTo({ top: 0, behavior: 'smooth' });
      this.showFieldScrollFeedback(`Sección: "${currentSectionName}"`, false);
    }
  }

  // ==========================================
  // RENDERIZADO
  // ==========================================

  renderSections() {
    const selector = document.getElementById('section-selector');
    selector.innerHTML = state.sections.map((section, index) => 
      `<option value="${index}" ${index === state.currentSection ? 'selected' : ''}>${TextUtils.escapeHtml(section.name)}</option>`
    ).join('');
    
    if (document.getElementById('section-name')) {
      document.getElementById('section-name').value = state.sections[state.currentSection].name;
    }
    
    this.renderSectionControls();
  }

  renderSectionControls() {
    const container = document.getElementById('section-controls');
    if (!container) return;
    
    let controlsHTML = `
      <button type="button" class="btn-small" onclick="sectionManager.addSection()">➕ Nueva Sección</button>
      <button type="button" class="btn-small" onclick="sectionManager.duplicateSection()">📄 Duplicar</button>
      <button type="button" class="btn-small btn-danger" onclick="sectionManager.deleteSection()">🗑️ Eliminar</button>
    `;
    
    if (state.sections.length > 1) {
      if (state.currentSection > 0) {
        controlsHTML += `<button type="button" class="btn-small" onclick="sectionManager.moveSection(-1)">⬆️ Subir</button>`;
      }
      if (state.currentSection < state.sections.length - 1) {
        controlsHTML += `<button type="button" class="btn-small" onclick="sectionManager.moveSection(1)">⬇️ Bajar</button>`;
      }
    }
    
    container.innerHTML = controlsHTML;
  }

  renderSectionContent() {
    const container = document.getElementById('section-content-container');
    const currentSection = state.sections[state.currentSection];
    
    container.innerHTML = currentSection.fields.map((field, fieldIndex) => 
      this.renderField(field, fieldIndex, currentSection.fields.length)
    ).join('');
    
    // Aplicar auto-resize si está disponible
    if (window.autoResizeSystem) {
      setTimeout(() => window.autoResizeSystem.resizeAll(), 10);
    }
  }

  renderField(field, fieldIndex, totalFields) {
    const fieldControls = this.renderFieldControls(fieldIndex, totalFields);
    
    const fieldRenderers = {
      'h1': () => this.renderHeaderField(field, fieldIndex, 'h1', fieldControls),
      'h2': () => this.renderHeaderField(field, fieldIndex, 'h2', fieldControls),
      'h3': () => this.renderHeaderField(field, fieldIndex, 'h3', fieldControls),
      'text': () => this.renderTextField(field, fieldIndex, fieldControls),
      'textarea': () => this.renderTextAreaField(field, fieldIndex, fieldControls),
      'list': () => this.renderListField(field, fieldIndex, fieldControls)
    };

    const renderer = fieldRenderers[field.type];
    return renderer ? renderer() : '';
  }

  renderFieldControls(fieldIndex, totalFields) {
    return `
      <div class="step-controls">
        ${fieldIndex > 0 ? `<button class="step-btn" onclick="sectionManager.moveField(${fieldIndex}, -1)" title="Subir">↑</button>` : ''}
        ${fieldIndex < totalFields - 1 ? `<button class="step-btn" onclick="sectionManager.moveField(${fieldIndex}, 1)" title="Bajar">↓</button>` : ''}
        <button class="step-btn" onclick="sectionManager.scrollToFieldInOutput(${fieldIndex})" title="Ir a este campo específico en el resultado" style="background: #6366f1; color: white;">📍</button>
        <button class="step-btn btn-danger" onclick="sectionManager.removeField(${fieldIndex})" title="Eliminar">×</button>
      </div>
    `;
  }

  renderHeaderField(field, fieldIndex, type, fieldControls) {
    const typeConfig = {
      'h1': { icon: '📰', name: 'H1', color: '#2563eb' },
      'h2': { icon: '📝', name: 'H2', color: '#7c3aed' },
      'h3': { icon: '📄', name: 'H3', color: '#059669' }
    };
    
    const config = typeConfig[type];
    
    return `
      <div class="step">
        <div class="step-header">
          <span class="step-number type-${type}">${config.icon} ${config.name}</span>
          <button class="step-btn" onclick="sectionManager.duplicateField(${fieldIndex})" title="Duplicar" style="margin-right: 8px;">📄</button>
          ${fieldControls}
        </div>
        
        <div class="form-group">
          <input type="text" value="${TextUtils.escapeForAttribute(field.value || '')}" 
                 placeholder="Texto del encabezado..." 
                 oninput="sectionManager.updateHeaderValue(${fieldIndex}, this.value)">
        </div>
      </div>
    `;
  }

  renderTextField(field, fieldIndex, fieldControls) {
    if (!field.items) field.items = [field.value || ''];
    
    return `
      <div class="step">
        <div class="step-header">
          <span class="step-number type-text">📝 ${TextUtils.escapeHtml(field.label)}</span>
          <button class="step-btn" onclick="sectionManager.editFieldLabel(${fieldIndex})" title="Editar nombre" style="margin-right: 8px;">✏️</button>
          <button class="step-btn" onclick="sectionManager.duplicateField(${fieldIndex})" title="Duplicar" style="margin-right: 8px;">📄</button>
          ${fieldControls}
        </div>
        
        <div class="dynamic-list">
          ${this.renderTextItems(field.items, fieldIndex)}
          <button type="button" class="btn-small" onclick="sectionManager.addTextItem(${fieldIndex})">➕ Agregar Elemento</button>
        </div>
      </div>
    `;
  }

  renderTextAreaField(field, fieldIndex, fieldControls) {
    return `
      <div class="step">
        <div class="step-header">
          <span class="step-number type-textarea">📄 ${TextUtils.escapeHtml(field.label)}</span>
          <button class="step-btn" onclick="sectionManager.editFieldLabel(${fieldIndex})" title="Editar nombre" style="margin-right: 8px;">✏️</button>
          <button class="step-btn" onclick="sectionManager.duplicateField(${fieldIndex})" title="Duplicar" style="margin-right: 8px;">📄</button>
          ${fieldControls}
        </div>
        
        <div class="form-group">
          <textarea class="autoresize max-height" placeholder="Ingresa el texto..." 
                    oninput="sectionManager.updateTextField(${fieldIndex}, this.value)">${TextUtils.escapeForInputValue(field.value)}</textarea>
        </div>
      </div>
    `;
  }

  renderListField(field, fieldIndex, fieldControls) {
    return `
      <div class="step">
        <div class="step-header">
          <span class="step-number type-list">📋 ${TextUtils.escapeHtml(field.label)}</span>
          <button class="step-btn" onclick="sectionManager.editFieldLabel(${fieldIndex})" title="Editar nombre" style="margin-right: 8px;">✏️</button>
          <button class="step-btn" onclick="sectionManager.duplicateField(${fieldIndex})" title="Duplicar" style="margin-right: 8px;">📄</button>
          ${fieldControls}
        </div>
        
        <div class="dynamic-list">
          ${this.renderListItems(field.items, fieldIndex)}
          <button type="button" class="btn-small" onclick="sectionManager.addListItem(${fieldIndex})">➕ Agregar Elemento</button>
        </div>
      </div>
    `;
  }

  renderTextItems(items, fieldIndex) {
    return items.map((item, itemIndex) => `
      <div class="list-item">
        <input type="text" value="${TextUtils.escapeForAttribute(item)}" placeholder="Nuevo elemento..." 
               oninput="sectionManager.updateTextItem(${fieldIndex}, ${itemIndex}, this.value)">
        <div class="list-item-controls">
          ${itemIndex > 0 ? `<button class="btn-small" onclick="sectionManager.moveTextItem(${fieldIndex}, ${itemIndex}, -1)" title="Subir">↑</button>` : ''}
          ${itemIndex < items.length - 1 ? `<button class="btn-small" onclick="sectionManager.moveTextItem(${fieldIndex}, ${itemIndex}, 1)" title="Bajar">↓</button>` : ''}
          <button class="btn-small btn-danger" onclick="sectionManager.removeTextItem(${fieldIndex}, ${itemIndex})">×</button>
        </div>
      </div>
    `).join('');
  }

  renderListItems(items, fieldIndex) {
    return items.map((item, itemIndex) => `
      <div class="list-item">
        <input type="text" value="${TextUtils.escapeForAttribute(item)}" placeholder="Nuevo elemento..." 
               oninput="sectionManager.updateListItem(${fieldIndex}, ${itemIndex}, this.value)">
        <div class="list-item-controls">
          ${itemIndex > 0 ? `<button class="btn-small" onclick="sectionManager.moveListItem(${fieldIndex}, ${itemIndex}, -1)" title="Subir">↑</button>` : ''}
          ${itemIndex < items.length - 1 ? `<button class="btn-small" onclick="sectionManager.moveListItem(${fieldIndex}, ${itemIndex}, 1)" title="Bajar">↓</button>` : ''}
          <button class="btn-small btn-danger" onclick="sectionManager.removeListItem(${fieldIndex}, ${itemIndex})">×</button>
        </div>
      </div>
    `).join('');
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD PRIVADOS
  // ==========================================

  duplicateWithSuffix(section, newName) {
    const duplicated = JSON.parse(JSON.stringify(section));
    duplicated.name = newName;
    
    duplicated.fields.forEach(field => {
      if (field.label && field.label.trim()) {
        field.label = field.label + " - Copia";
      }
      
      switch (field.type) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'textarea':
          if (field.value && field.value.trim()) {
            field.value = field.value + " - Copia";
          }
          break;
        case 'text':
        case 'list':
          if (field.items && field.items.length > 0) {
            field.items = field.items.map(item => {
              if (typeof item === 'string' && item.trim()) {
                return item + " - Copia";
              }
              return item;
            });
          }
          break;
      }
    });
    
    return duplicated;
  }

  duplicateFieldWithSuffix(field) {
    const duplicated = JSON.parse(JSON.stringify(field));
    
    if (duplicated.label && duplicated.label.trim()) {
      duplicated.label = duplicated.label + " - Copia";
    }
    
    switch (duplicated.type) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'textarea':
        if (duplicated.value && duplicated.value.trim()) {
          duplicated.value = duplicated.value + " - Copia";
        }
        break;
      case 'text':
      case 'list':
        if (duplicated.items && duplicated.items.length > 0) {
          duplicated.items = duplicated.items.map(item => {
            if (typeof item === 'string' && item.trim()) {
              return item + " - Copia";
            }
            return item;
          });
        }
        break;
    }
    
    return duplicated;
  }

  generateSearchPatterns(field) {
    const patterns = [];
    
    if (field.type === 'h1' || field.type === 'h2' || field.type === 'h3') {
      if (field.value && field.value.trim()) {
        const escapedValue = TextUtils.escapeRegex(field.value.trim());
        patterns.push(new RegExp(`<span class="output-${field.type}">${escapedValue}</span>`, 'i'));
      }
    } else if (field.type === 'text' && field.items) {
      const firstItem = field.items.find(item => item.trim());
      if (firstItem) {
        const escapedItem = TextUtils.escapeRegex(firstItem.trim());
        patterns.push(new RegExp(`- ${escapedItem}`, 'i'));
      }
    } else if (field.type === 'textarea' && field.value) {
      const escapedValue = TextUtils.escapeRegex(field.value.trim());
      patterns.push(new RegExp(escapedValue, 'i'));
    } else if (field.type === 'list' && field.items) {
      const firstItem = field.items.find(item => item.trim());
      if (firstItem) {
        const escapedItem = TextUtils.escapeRegex(firstItem.trim());
        patterns.push(new RegExp(`<span class="output-step-number">1\\.</span> ${escapedItem}`, 'i'));
      }
    }
    
    return patterns;
  }

  getFieldDescription(field) {
    if (field.type === 'h1' || field.type === 'h2' || field.type === 'h3') {
      return `${field.type.toUpperCase()}: "${field.value?.trim() || ''}"`;
    } else if (field.type === 'text' && field.items) {
      const firstItem = field.items.find(item => item.trim());
      return `${field.label}: "${firstItem?.trim() || ''}"`;
    } else if (field.type === 'textarea' && field.value) {
      return `${field.label}: "${TextUtils.truncate(field.value.trim(), 30)}"`;
    } else if (field.type === 'list' && field.items) {
      const firstItem = field.items.find(item => item.trim());
      return `${field.label}: "${firstItem?.trim() || ''}"`;
    }
    return `Campo: ${field.label || 'Sin nombre'}`;
  }

  findFirstMatch(content, patterns) {
    for (const pattern of patterns) {
      const match = pattern.exec(content);
      if (match) return match;
    }
    return null;
  }

  scrollToMatch(outputPanel, outputElement, match) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = outputElement.innerHTML.substring(0, match.index);
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.fontFamily = outputElement.style.fontFamily || "'Consolas', 'Monaco', 'Courier New', monospace";
    tempDiv.style.fontSize = outputElement.style.fontSize || '14px';
    tempDiv.style.lineHeight = outputElement.style.lineHeight || '1.6';
    tempDiv.style.width = outputElement.offsetWidth + 'px';
    
    document.body.appendChild(tempDiv);
    const targetHeight = tempDiv.offsetHeight;
    document.body.removeChild(tempDiv);
    
    outputPanel.scrollTo({
      top: Math.max(0, targetHeight),
      behavior: 'smooth'
    });
  }

  showFieldScrollFeedback(fieldDescription, found = true) {
    // Limpiar timeout anterior
    if (this.scrollFeedbackTimeout) {
      clearTimeout(this.scrollFeedbackTimeout);
    }

    const outputPanel = document.querySelector('.panel.output');
    if (!outputPanel) return;
    
    const panelRect = outputPanel.getBoundingClientRect();
    const textPosition = panelRect.top + 30;
    const leftPosition = panelRect.left + 20;
    
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed; top: ${textPosition}px; left: ${leftPosition}px;
      background: ${found ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)'};
      color: white; padding: 8px 12px; border-radius: 6px; font-size: 11px; font-weight: 600;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); z-index: 1000; opacity: 0;
      transition: all 0.3s ease; max-width: 240px; text-align: left; line-height: 1.2;
      transform: translateY(-10px);
    `;
    
    feedback.innerHTML = `
      ${found ? '📍 <strong>Aquí:</strong>' : '🔍 <strong>No visible:</strong>'}<br>
      <span style="font-size: 10px;">${fieldDescription}</span>
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.opacity = '1';
      feedback.style.transform = 'translateY(0)';
    }, 10);
    
    this.scrollFeedbackTimeout = setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 300);
    }, 3000);
  }

  updateUI() {
    this.renderSectionContent();
    this.updatePrompt();
    this.scheduleAutoSave();
  }

  debouncedUpdate() {
    TimingUtils.debounce('sectionUpdate', () => {
      this.updatePrompt();
      this.scheduleAutoSave();
    }, 300);
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
}

// Instancia global
const sectionManager = new SectionManager();

// Exportar globalmente
window.sectionManager = sectionManager;

// Configurar renderizado en RenderUtils
RenderUtils.renderSections = () => sectionManager.renderSections();
RenderUtils.renderSectionContent = () => sectionManager.renderSectionContent();

// Funciones legacy para compatibilidad (redirigen a sectionManager)
window.addSection = () => sectionManager.addSection();
window.duplicateSection = () => sectionManager.duplicateSection();
window.deleteSection = () => sectionManager.deleteSection();
window.changeSection = () => sectionManager.changeSection();
window.renameSection = () => sectionManager.renameSection();
window.moveSection = (direction) => sectionManager.moveSection(direction);
window.addField = (fieldType) => sectionManager.addField(fieldType);
window.editFieldLabel = (fieldIndex) => sectionManager.editFieldLabel(fieldIndex);
window.duplicateField = (fieldIndex) => sectionManager.duplicateField(fieldIndex);
window.removeField = (fieldIndex) => sectionManager.removeField(fieldIndex);
window.moveField = (fieldIndex, direction) => sectionManager.moveField(fieldIndex, direction);
window.updateHeaderValue = (fieldIndex, value) => sectionManager.updateHeaderValue(fieldIndex, value);
window.updateTextField = (fieldIndex, value) => sectionManager.updateTextField(fieldIndex, value);
window.addTextItem = (fieldIndex) => sectionManager.addTextItem(fieldIndex);
window.removeTextItem = (fieldIndex, itemIndex) => sectionManager.removeTextItem(fieldIndex, itemIndex);
window.moveTextItem = (fieldIndex, itemIndex, direction) => sectionManager.moveTextItem(fieldIndex, itemIndex, direction);
window.updateTextItem = (fieldIndex, itemIndex, value) => sectionManager.updateTextItem(fieldIndex, itemIndex, value);
window.addListItem = (fieldIndex) => sectionManager.addListItem(fieldIndex);
window.removeListItem = (fieldIndex, itemIndex) => sectionManager.removeListItem(fieldIndex, itemIndex);
window.moveListItem = (fieldIndex, itemIndex, direction) => sectionManager.moveListItem(fieldIndex, itemIndex, direction);
window.updateListItem = (fieldIndex, itemIndex, value) => sectionManager.updateListItem(fieldIndex, itemIndex, value);
window.scrollToFieldInOutput = (fieldIndex) => sectionManager.scrollToFieldInOutput(fieldIndex);
window.scrollToSectionInOutput = () => sectionManager.scrollToSectionInOutput();
window.renderSections = () => sectionManager.renderSections();
window.renderSectionContent = () => sectionManager.renderSectionContent();
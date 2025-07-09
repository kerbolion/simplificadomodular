// ==========================================
// MÓDULO DE GESTIÓN DE SECCIONES
// ==========================================

const sections = {
  // ==========================================
  // GESTIÓN DE SECCIONES
  // ==========================================
  
  // Agregar nueva sección
  add() {
    const name = utils.promptWithValidation(
      "Nombre de la nueva sección:", 
      `Sección ${state.sections.length + 1}`,
      (value) => value.length > 0
    );
    
    if (name) {
      state.sections.push({ 
        name: name, 
        fields: [] 
      });
      state.currentSection = state.sections.length - 1;
      this.render();
      this.renderContent();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Eliminar sección actual
  delete() {
    if (state.sections.length <= 1) {
      alert("Debe haber al menos una sección");
      return;
    }
    
    const currentSection = getState.currentSection();
    if (utils.confirmAction(`la sección "${currentSection.name}"`)) {
      state.sections.splice(state.currentSection, 1);
      state.currentSection = Math.max(0, state.currentSection - 1);
      this.render();
      this.renderContent();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Cambiar sección actual
  change() {
    const newIndex = parseInt(utils.getElement('section-selector').value);
    if (validate.sectionIndex(newIndex)) {
      state.currentSection = newIndex;
      this.renderContent();
      utils.setInputValue('section-name', state.sections[newIndex].name);
    }
  },

  // Renombrar sección actual
  rename() {
    const newName = utils.getInputValue('section-name');
    if (utils.cleanText(newName)) {
      state.sections[state.currentSection].name = newName;
      this.render();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // ==========================================
  // GESTIÓN DE CAMPOS
  // ==========================================
  
  // Agregar campo de texto
  addTextField() {
    const label = utils.promptWithValidation(
      "Etiqueta del campo:",
      "",
      (value) => value.length > 0
    );
    
    if (label) {
      getState.currentSection().fields.push({
        type: "text",
        label: label,
        items: [""]
      });
      this.renderContent();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Agregar área de texto
  addTextAreaField() {
    const label = utils.promptWithValidation(
      "Etiqueta del área de texto:",
      "",
      (value) => value.length > 0
    );
    
    if (label) {
      getState.currentSection().fields.push({
        type: "textarea",
        label: label,
        value: ""
      });
      this.renderContent();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Agregar lista
  addListField() {
    const label = utils.promptWithValidation(
      "Título de la lista:",
      "",
      (value) => value.length > 0
    );
    
    if (label) {
      getState.currentSection().fields.push({
        type: "list",
        label: label,
        items: [""]
      });
      this.renderContent();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Eliminar campo
  removeField(fieldIndex) {
    if (utils.confirmAction("este campo")) {
      getState.currentSection().fields.splice(fieldIndex, 1);
      this.renderContent();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Mover campo
  moveField(fieldIndex, direction) {
    const fields = getState.currentSection().fields;
    const newIndex = fieldIndex + direction;
    
    if (utils.moveArrayItem(fields, fieldIndex, newIndex)) {
      this.renderContent();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // ==========================================
  // GESTIÓN DE ELEMENTOS DE CAMPOS
  // ==========================================
  
  // Actualizar campo de texto/textarea
  updateTextField(fieldIndex, value) {
    const field = getState.currentSection().fields[fieldIndex];
    if (field.type === 'textarea') {
      field.value = value;
    }
    prompt.update();
    events.scheduleAutoSave();
  },

  // Agregar elemento a campo de texto
  addTextItem(fieldIndex) {
    const field = getState.currentSection().fields[fieldIndex];
    if (field.items) {
      field.items.push('');
      this.renderContent();
      events.scheduleAutoSave();
    }
  },

  // Eliminar elemento de campo de texto
  removeTextItem(fieldIndex, itemIndex) {
    if (utils.confirmAction('este elemento')) {
      const field = getState.currentSection().fields[fieldIndex];
      if (field.items) {
        field.items.splice(itemIndex, 1);
        this.renderContent();
        prompt.update();
        events.scheduleAutoSave();
      }
    }
  },

  // Mover elemento de campo de texto
  moveTextItem(fieldIndex, itemIndex, direction) {
    const field = getState.currentSection().fields[fieldIndex];
    if (field.items && utils.moveArrayItem(field.items, itemIndex, itemIndex + direction)) {
      this.renderContent();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Actualizar elemento de campo de texto
  updateTextItem(fieldIndex, itemIndex, value) {
    const field = getState.currentSection().fields[fieldIndex];
    if (field.items) {
      field.items[itemIndex] = value;
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Agregar elemento a lista
  addListItem(fieldIndex) {
    const field = getState.currentSection().fields[fieldIndex];
    if (field.items) {
      field.items.push('');
      this.renderContent();
      events.scheduleAutoSave();
    }
  },

  // Eliminar elemento de lista
  removeListItem(fieldIndex, itemIndex) {
    if (utils.confirmAction('este elemento')) {
      const field = getState.currentSection().fields[fieldIndex];
      if (field.items) {
        field.items.splice(itemIndex, 1);
        this.renderContent();
        prompt.update();
        events.scheduleAutoSave();
      }
    }
  },

  // Mover elemento de lista
  moveListItem(fieldIndex, itemIndex, direction) {
    const field = getState.currentSection().fields[fieldIndex];
    if (field.items && utils.moveArrayItem(field.items, itemIndex, itemIndex + direction)) {
      this.renderContent();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Actualizar elemento de lista
  updateListItem(fieldIndex, itemIndex, value) {
    const field = getState.currentSection().fields[fieldIndex];
    if (field.items) {
      field.items[itemIndex] = value;
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // ==========================================
  // RENDERIZADO
  // ==========================================
  
  // Renderizar selector de secciones
  render() {
    const selector = utils.getElement('section-selector');
    if (!selector) return;

    selector.innerHTML = state.sections.map((section, index) => 
      `<option value="${index}" ${index === state.currentSection ? 'selected' : ''}>${utils.escapeHtml(section.name)}</option>`
    ).join('');
    
    const nameInput = utils.getElement('section-name');
    if (nameInput) {
      nameInput.value = state.sections[state.currentSection].name;
    }
  },

  // Renderizar contenido de la sección actual
  renderContent() {
    const container = utils.getElement('section-content-container');
    if (!container) return;

    const currentSection = getState.currentSection();
    
    container.innerHTML = currentSection.fields.map((field, fieldIndex) => {
      return this.renderField(field, fieldIndex, currentSection.fields.length);
    }).join('');
  },

  // Renderizar un campo individual
  renderField(field, fieldIndex, totalFields) {
    const fieldControls = this.renderFieldControls(fieldIndex, totalFields);

    switch (field.type) {
      case 'text':
        return this.renderTextField(field, fieldIndex, fieldControls);
      case 'textarea':
        return this.renderTextAreaField(field, fieldIndex, fieldControls);
      case 'list':
        return this.renderListField(field, fieldIndex, fieldControls);
      default:
        return '';
    }
  },

  // Renderizar controles de campo (mover, eliminar)
  renderFieldControls(fieldIndex, totalFields) {
    return `
      <div class="step-controls">
        ${fieldIndex > 0 ? `<button class="step-btn" onclick="sections.moveField(${fieldIndex}, -1)" title="Subir">↑</button>` : ''}
        ${fieldIndex < totalFields - 1 ? `<button class="step-btn" onclick="sections.moveField(${fieldIndex}, 1)" title="Bajar">↓</button>` : ''}
        <button class="step-btn btn-danger" onclick="sections.removeField(${fieldIndex})" title="Eliminar">×</button>
      </div>
    `;
  },

  // Renderizar campo de texto
  renderTextField(field, fieldIndex, fieldControls) {
    // Asegurar que items existe
    if (!field.items) field.items = [field.value || ''];
    
    return `
      <div class="step">
        <div class="step-header">
          <span class="step-number">📝 ${utils.escapeHtml(field.label)}</span>
          ${fieldControls}
        </div>
        
        <div class="dynamic-list">
          ${field.items.map((item, itemIndex) => `
            <div class="list-item">
              <input type="text" value="${utils.escapeHtml(item)}" placeholder="Nuevo elemento..." 
                     oninput="sections.updateTextItem(${fieldIndex}, ${itemIndex}, this.value)">
              <div class="list-item-controls">
                ${itemIndex > 0 ? `<button class="btn-small" onclick="sections.moveTextItem(${fieldIndex}, ${itemIndex}, -1)" title="Subir">↑</button>` : ''}
                ${itemIndex < field.items.length - 1 ? `<button class="btn-small" onclick="sections.moveTextItem(${fieldIndex}, ${itemIndex}, 1)" title="Bajar">↓</button>` : ''}
                <button class="btn-small btn-danger" onclick="sections.removeTextItem(${fieldIndex}, ${itemIndex})">×</button>
              </div>
            </div>
          `).join('')}
          <button type="button" class="btn-small" onclick="sections.addTextItem(${fieldIndex})">➕ Agregar Elemento</button>
        </div>
      </div>
    `;
  },

  // Renderizar área de texto
  renderTextAreaField(field, fieldIndex, fieldControls) {
    return `
      <div class="step">
        <div class="step-header">
          <span class="step-number">📄 ${utils.escapeHtml(field.label)}</span>
          ${fieldControls}
        </div>
        
        <div class="form-group">
          <textarea placeholder="Ingresa el texto..." 
                    oninput="sections.updateTextField(${fieldIndex}, this.value)">${utils.escapeHtml(field.value)}</textarea>
        </div>
      </div>
    `;
  },

  // Renderizar lista
  renderListField(field, fieldIndex, fieldControls) {
    return `
      <div class="step">
        <div class="step-header">
          <span class="step-number">📋 ${utils.escapeHtml(field.label)}</span>
          ${fieldControls}
        </div>
        
        <div class="dynamic-list">
          ${field.items.map((item, itemIndex) => `
            <div class="list-item">
              <input type="text" value="${utils.escapeHtml(item)}" placeholder="Nuevo elemento..." 
                     oninput="sections.updateListItem(${fieldIndex}, ${itemIndex}, this.value)">
              <div class="list-item-controls">
                ${itemIndex > 0 ? `<button class="btn-small" onclick="sections.moveListItem(${fieldIndex}, ${itemIndex}, -1)" title="Subir">↑</button>` : ''}
                ${itemIndex < field.items.length - 1 ? `<button class="btn-small" onclick="sections.moveListItem(${fieldIndex}, ${itemIndex}, 1)" title="Bajar">↓</button>` : ''}
                <button class="btn-small btn-danger" onclick="sections.removeListItem(${fieldIndex}, ${itemIndex})">×</button>
              </div>
            </div>
          `).join('')}
          <button type="button" class="btn-small" onclick="sections.addListItem(${fieldIndex})">➕ Agregar Elemento</button>
        </div>
      </div>
    `;
  },

  // ==========================================
  // MIGRACIÓN Y COMPATIBILIDAD
  // ==========================================
  
  // Migrar campos antiguos al nuevo formato
  migrateLegacyFields() {
    state.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.type === 'text' && field.value && !field.items) {
          // Convertir de formato anterior (value) a nuevo (items)
          field.items = [field.value];
          delete field.value;
        }
      });
    });
  },

  // Migrar datos del formato anterior
  migrateLegacyData(data) {
    if (data.tone || data.format || data.rules) {
      utils.log('Migrando configuración al nuevo formato...');
      
      // Encontrar o crear sección de "Instrucciones Generales"
      let generalSection = state.sections.find(s => s.name === "Instrucciones Generales");
      if (!generalSection) {
        generalSection = { name: "Instrucciones Generales", fields: [] };
        state.sections.unshift(generalSection);
      }
      
      // Migrar tono y formato al nuevo formato (como items en lugar de value)
      if (data.tone && !generalSection.fields.find(f => f.label === "Tono")) {
        generalSection.fields.push({ type: "text", label: "Tono", items: [data.tone] });
      }
      if (data.format && !generalSection.fields.find(f => f.label === "Formato")) {
        generalSection.fields.push({ type: "text", label: "Formato", items: [data.format] });
      }
      
      // Migrar reglas
      if (data.rules && data.rules.length > 0) {
        let rulesSection = state.sections.find(s => s.name === "Reglas de comportamiento");
        if (!rulesSection) {
          rulesSection = { name: "Reglas de comportamiento", fields: [] };
          state.sections.push(rulesSection);
        }
        
        // Solo migrar si no existe ya una lista de reglas
        if (!rulesSection.fields.find(f => f.type === "list" && f.label === "Reglas")) {
          rulesSection.fields.push({
            type: "list",
            label: "Reglas",
            items: data.rules
          });
        }
      }
    }

    // Migrar campos antiguos
    this.migrateLegacyFields();
  }
};
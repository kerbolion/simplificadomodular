function renderSectionControls() {
  const container = document.getElementById('section-controls');
  if (!container) return;
  
  let controlsHTML = `
    <button type="button" class="btn-small" onclick="addSection()">➕ Nueva Sección</button>
    <button type="button" class="btn-small" onclick="duplicateSection()">📄 Duplicar</button>
    <button type="button" class="btn-small btn-danger" onclick="deleteSection()">🗑️ Eliminar</button>
  `;
  
  // Agregar botones de reorganización si hay más de una sección
  if (state.sections.length > 1) {
    if (state.currentSection > 0) {
      controlsHTML += `<button type="button" class="btn-small" onclick="moveSection(-1)">⬆️ Subir</button>`;
    }
    if (state.currentSection < state.sections.length - 1) {
      controlsHTML += `<button type="button" class="btn-small" onclick="moveSection(1)">⬇️ Bajar</button>`;
    }
  }
  
  container.innerHTML = controlsHTML;
}

function moveSection(direction) {
  const sections = state.sections;
  const currentIndex = state.currentSection;
  const newIndex = currentIndex + direction;
  
  if (newIndex >= 0 && newIndex < sections.length) {
    // Intercambiar secciones
    [sections[currentIndex], sections[newIndex]] = [sections[newIndex], sections[currentIndex]];
    
    // Actualizar índice actual
    state.currentSection = newIndex;
    
    // Re-renderizar
    renderSections();
    renderSectionContent();
    updatePrompt();
    scheduleAutoSave();
  }
}

// ==========================================
// GESTIÓN DE PESTAÑAS
// ==========================================
function showTab(index) {
  document.querySelectorAll('.tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.tab-content').forEach((content, i) => {
    content.classList.toggle('active', i === index);
  });
  state.currentTab = index;
}

// ==========================================
// GESTIÓN DE SECCIONES
// ==========================================
function addSection() {
  const name = prompt("Nombre de la nueva sección:", `Sección ${state.sections.length + 1}`);
  if (name && name.trim()) {
    state.sections.push({ 
      name: name.trim(), 
      fields: [] 
    });
    state.currentSection = state.sections.length - 1;
    renderSections();
    renderSectionContent();
    updatePrompt();
    scheduleAutoSave();
  }
}

function duplicateSection() {
  const currentSection = state.sections[state.currentSection];
  const newName = prompt("Nombre para la sección duplicada:", `${currentSection.name} - Copia`);
  
  if (newName && newName.trim()) {
    // Crear una copia profunda de la sección actual
    const duplicatedSection = JSON.parse(JSON.stringify(currentSection));
    duplicatedSection.name = newName.trim();
    
    // Insertar la sección duplicada después de la actual
    state.sections.splice(state.currentSection + 1, 0, duplicatedSection);
    state.currentSection = state.currentSection + 1;
    
    renderSections();
    renderSectionContent();
    updatePrompt();
    scheduleAutoSave();
  }
}

function deleteSection() {
  if (state.sections.length <= 1) {
    alert("Debe haber al menos una sección");
    return;
  }
  
  if (confirm(`¿Eliminar la sección "${state.sections[state.currentSection].name}"?`)) {
    state.sections.splice(state.currentSection, 1);
    state.currentSection = Math.max(0, state.currentSection - 1);
    renderSections();
    renderSectionContent();
    updatePrompt();
    scheduleAutoSave();
  }
}

function changeSection() {
  state.currentSection = parseInt(document.getElementById('section-selector').value);
  renderSectionContent();
  renderSectionControls(); // Actualizar botones de reorganización
  document.getElementById('section-name').value = state.sections[state.currentSection].name;
}

function renameSection() {
  const newName = document.getElementById('section-name').value.trim();
  if (newName) {
    state.sections[state.currentSection].name = newName;
    renderSections();
    updatePrompt();
    scheduleAutoSave();
  }
}

function renderSections() {
  const selector = document.getElementById('section-selector');
  selector.innerHTML = state.sections.map((section, index) => 
    `<option value="${index}" ${index === state.currentSection ? 'selected' : ''}>${escapeHtml(section.name)}</option>`
  ).join('');
  
  if (document.getElementById('section-name')) {
    document.getElementById('section-name').value = state.sections[state.currentSection].name;
  }
  
  // Renderizar controles de reorganización
  renderSectionControls();
}

// ==========================================
// GESTIÓN DE CONTENIDO DE SECCIONES
// ==========================================

// Función unificada para agregar campos
function addField(fieldType) {
  if (fieldType === 'header') {
    // Mostrar opciones de encabezado
    const headerType = prompt('Selecciona el tipo de encabezado:\n1 - H1 (Título principal)\n2 - H2 (Subtítulo)\n3 - H3 (Encabezado menor)\n\nEscribe 1, 2 o 3:');
    
    if (!headerType || !['1', '2', '3'].includes(headerType)) {
      return;
    }
    
    const typeMap = { '1': 'h1', '2': 'h2', '3': 'h3' };
    const selectedType = typeMap[headerType];
    
    const value = prompt(`Texto del encabezado H${headerType}:`);
    if (value && value.trim()) {
      state.sections[state.currentSection].fields.push({
        type: selectedType,
        value: value.trim()
      });
      renderSectionContent();
      updatePrompt();
      scheduleAutoSave();
    }
  } else if (fieldType === 'text') {
    const label = prompt("Etiqueta del campo:");
    if (label && label.trim()) {
      state.sections[state.currentSection].fields.push({
        type: "text",
        label: label.trim(),
        items: [""]
      });
      renderSectionContent();
      updatePrompt();
      scheduleAutoSave();
    }
  } else if (fieldType === 'textarea') {
    const label = prompt("Etiqueta del área de texto:");
    if (label && label.trim()) {
      state.sections[state.currentSection].fields.push({
        type: "textarea",
        label: label.trim(),
        value: ""
      });
      renderSectionContent();
      updatePrompt();
      scheduleAutoSave();
    }
  } else if (fieldType === 'list') {
    const label = prompt("Título de la lista:");
    if (label && label.trim()) {
      state.sections[state.currentSection].fields.push({
        type: "list",
        label: label.trim(),
        items: [""]
      });
      renderSectionContent();
      updatePrompt();
      scheduleAutoSave();
    }
  }
}

// Función para editar el label/título de un campo
function editFieldLabel(fieldIndex) {
  const field = state.sections[state.currentSection].fields[fieldIndex];
  const currentLabel = field.label || '';
  const newLabel = prompt('Nuevo nombre para el campo:', currentLabel);
  
  if (newLabel !== null && newLabel.trim()) {
    field.label = newLabel.trim();
    renderSectionContent();
    updatePrompt();
    scheduleAutoSave();
  }
}

// Función para duplicar un campo
function duplicateField(fieldIndex) {
  const fieldToDuplicate = state.sections[state.currentSection].fields[fieldIndex];
  // Crear una copia profunda del campo
  const duplicatedField = JSON.parse(JSON.stringify(fieldToDuplicate));
  
  // Si el campo tiene label, agregar " - Copia" al nombre
  if (duplicatedField.label) {
    duplicatedField.label = duplicatedField.label + " - Copia";
  }
  
  // Insertar el campo duplicado después del actual
  state.sections[state.currentSection].fields.splice(fieldIndex + 1, 0, duplicatedField);
  
  renderSectionContent();
  updatePrompt();
  scheduleAutoSave();
}

// Función para agregar encabezados H1, H2, H3 (mantenida por compatibilidad)
function addHeaderField(headerType) {
  const headerTypes = {
    'h1': 'Encabezado H1',
    'h2': 'Encabezado H2', 
    'h3': 'Encabezado H3'
  };
  
  const value = prompt(`Texto del ${headerTypes[headerType]}:`);
  if (value && value.trim()) {
    state.sections[state.currentSection].fields.push({
      type: headerType,
      value: value.trim()
    });
    renderSectionContent();
    updatePrompt();
    scheduleAutoSave();
  }
}

function addTextField() {
  addField('text');
}

function addTextAreaField() {
  addField('textarea');
}

function addListField() {
  addField('list');
}

function removeField(fieldIndex) {
  if (confirm("¿Eliminar este campo?")) {
    state.sections[state.currentSection].fields.splice(fieldIndex, 1);
    renderSectionContent();
    updatePrompt();
    scheduleAutoSave();
  }
}

function moveField(fieldIndex, direction) {
  const fields = state.sections[state.currentSection].fields;
  const newIndex = fieldIndex + direction;
  
  if (newIndex >= 0 && newIndex < fields.length) {
    [fields[fieldIndex], fields[newIndex]] = [fields[newIndex], fields[fieldIndex]];
    renderSectionContent();
    updatePrompt();
    scheduleAutoSave();
  }
}

// Función para actualizar el valor de los encabezados
function updateHeaderValue(fieldIndex, value) {
  state.sections[state.currentSection].fields[fieldIndex].value = value;
  // Usar debounce para evitar llamadas excesivas
  clearTimeout(window.headerValueTimeout);
  window.headerValueTimeout = setTimeout(() => {
    updatePrompt();
    scheduleAutoSave();
  }, 300);
}

function updateTextField(fieldIndex, value) {
  state.sections[state.currentSection].fields[fieldIndex].value = value;
  // Usar debounce para evitar llamadas excesivas
  clearTimeout(window.textFieldTimeout);
  window.textFieldTimeout = setTimeout(() => {
    updatePrompt();
    scheduleAutoSave();
  }, 300);
}

// Nuevas funciones para campos de texto como listas
function addTextItem(fieldIndex) {
  state.sections[state.currentSection].fields[fieldIndex].items.push('');
  renderSectionContent();
  scheduleAutoSave();
}

function removeTextItem(fieldIndex, itemIndex) {
  if (confirm('¿Eliminar este elemento?')) {
    state.sections[state.currentSection].fields[fieldIndex].items.splice(itemIndex, 1);
    renderSectionContent();
    updatePrompt();
    scheduleAutoSave();
  }
}

function moveTextItem(fieldIndex, itemIndex, direction) {
  const items = state.sections[state.currentSection].fields[fieldIndex].items;
  const newIndex = itemIndex + direction;
  
  if (newIndex >= 0 && newIndex < items.length) {
    [items[itemIndex], items[newIndex]] = [items[newIndex], items[itemIndex]];
    renderSectionContent();
    updatePrompt();
    scheduleAutoSave();
  }
}

function updateTextItem(fieldIndex, itemIndex, value) {
  state.sections[state.currentSection].fields[fieldIndex].items[itemIndex] = value;
  // Usar debounce para evitar llamadas excesivas
  clearTimeout(window.textItemTimeout);
  window.textItemTimeout = setTimeout(() => {
    updatePrompt();
    scheduleAutoSave();
  }, 300);
}

function addListItem(fieldIndex) {
  state.sections[state.currentSection].fields[fieldIndex].items.push('');
  renderSectionContent();
  scheduleAutoSave();
}

function removeListItem(fieldIndex, itemIndex) {
  if (confirm('¿Eliminar este elemento?')) {
    state.sections[state.currentSection].fields[fieldIndex].items.splice(itemIndex, 1);
    renderSectionContent();
    updatePrompt();
    scheduleAutoSave();
  }
}

function moveListItem(fieldIndex, itemIndex, direction) {
  const items = state.sections[state.currentSection].fields[fieldIndex].items;
  const newIndex = itemIndex + direction;
  
  if (newIndex >= 0 && newIndex < items.length) {
    [items[itemIndex], items[newIndex]] = [items[newIndex], items[itemIndex]];
    renderSectionContent();
    updatePrompt();
    scheduleAutoSave();
  }
}

function updateListItem(fieldIndex, itemIndex, value) {
  state.sections[state.currentSection].fields[fieldIndex].items[itemIndex] = value;
  // Usar debounce para evitar llamadas excesivas
  clearTimeout(window.listItemTimeout);
  window.listItemTimeout = setTimeout(() => {
    updatePrompt();
    scheduleAutoSave();
  }, 300);
}

function renderSectionContent() {
  const container = document.getElementById('section-content-container');
  const currentSection = state.sections[state.currentSection];
  
  container.innerHTML = currentSection.fields.map((field, fieldIndex) => {
    // Controles de reorganización para campos
    const fieldControls = `
      <div class="step-controls">
        ${fieldIndex > 0 ? `<button class="step-btn" onclick="moveField(${fieldIndex}, -1)" title="Subir">↑</button>` : ''}
        ${fieldIndex < currentSection.fields.length - 1 ? `<button class="step-btn" onclick="moveField(${fieldIndex}, 1)" title="Bajar">↓</button>` : ''}
        <button class="step-btn btn-danger" onclick="removeField(${fieldIndex})" title="Eliminar">×</button>
      </div>
    `;

    // Renderizar encabezados H1, H2, H3
    if (field.type === 'h1' || field.type === 'h2' || field.type === 'h3') {
      const typeConfig = {
        'h1': { icon: '📰', name: 'H1', color: '#2563eb' },
        'h2': { icon: '📝', name: 'H2', color: '#7c3aed' },
        'h3': { icon: '📄', name: 'H3', color: '#059669' }
      };
      
      const config = typeConfig[field.type];
      
      return `
        <div class="step">
          <div class="step-header">
            <span class="step-number type-${field.type}">${config.icon} ${config.name}</span>
            <button class="step-btn" onclick="duplicateField(${fieldIndex})" title="Duplicar" style="margin-right: 8px;">📄</button>
            ${fieldControls}
          </div>
          
          <div class="form-group">
            <input type="text" value="${escapeHtml(field.value || '')}" 
                   placeholder="Texto del encabezado..." 
                   oninput="updateHeaderValue(${fieldIndex}, this.value)">
          </div>
        </div>
      `;
    }
    
    if (field.type === 'text') {
      // Asegurar que items existe
      if (!field.items) field.items = [field.value || ''];
      
      return `
        <div class="step">
          <div class="step-header">
            <span class="step-number type-text">📝 ${escapeHtml(field.label)}</span>
            <button class="step-btn" onclick="editFieldLabel(${fieldIndex})" title="Editar nombre" style="margin-right: 8px;">✏️</button>
            <button class="step-btn" onclick="duplicateField(${fieldIndex})" title="Duplicar" style="margin-right: 8px;">📄</button>
            ${fieldControls}
          </div>
          
          <div class="dynamic-list">
            ${field.items.map((item, itemIndex) => `
              <div class="list-item">
                <input type="text" value="${escapeHtml(item)}" placeholder="Nuevo elemento..." 
                       oninput="updateTextItem(${fieldIndex}, ${itemIndex}, this.value)">
                <div class="list-item-controls">
                  ${itemIndex > 0 ? `<button class="btn-small" onclick="moveTextItem(${fieldIndex}, ${itemIndex}, -1)" title="Subir">↑</button>` : ''}
                  ${itemIndex < field.items.length - 1 ? `<button class="btn-small" onclick="moveTextItem(${fieldIndex}, ${itemIndex}, 1)" title="Bajar">↓</button>` : ''}
                  <button class="btn-small btn-danger" onclick="removeTextItem(${fieldIndex}, ${itemIndex})">×</button>
                </div>
              </div>
            `).join('')}
            <button type="button" class="btn-small" onclick="addTextItem(${fieldIndex})">➕ Agregar Elemento</button>
          </div>
        </div>
      `;
    } else if (field.type === 'textarea') {
      return `
        <div class="step">
          <div class="step-header">
            <span class="step-number type-textarea">📄 ${escapeHtml(field.label)}</span>
            <button class="step-btn" onclick="editFieldLabel(${fieldIndex})" title="Editar nombre" style="margin-right: 8px;">✏️</button>
            <button class="step-btn" onclick="duplicateField(${fieldIndex})" title="Duplicar" style="margin-right: 8px;">📄</button>
            ${fieldControls}
          </div>
          
          <div class="form-group">
            <textarea placeholder="Ingresa el texto..." 
                      oninput="updateTextField(${fieldIndex}, this.value)">${escapeHtml(field.value)}</textarea>
          </div>
        </div>
      `;
    } else if (field.type === 'list') {
      return `
        <div class="step">
          <div class="step-header">
            <span class="step-number type-list">📋 ${escapeHtml(field.label)}</span>
            <button class="step-btn" onclick="editFieldLabel(${fieldIndex})" title="Editar nombre" style="margin-right: 8px;">✏️</button>
            <button class="step-btn" onclick="duplicateField(${fieldIndex})" title="Duplicar" style="margin-right: 8px;">📄</button>
            ${fieldControls}
          </div>
          
          <div class="dynamic-list">
            ${field.items.map((item, itemIndex) => `
              <div class="list-item">
                <input type="text" value="${escapeHtml(item)}" placeholder="Nuevo elemento..." 
                       oninput="updateListItem(${fieldIndex}, ${itemIndex}, this.value)">
                <div class="list-item-controls">
                  ${itemIndex > 0 ? `<button class="btn-small" onclick="moveListItem(${fieldIndex}, ${itemIndex}, -1)" title="Subir">↑</button>` : ''}
                  ${itemIndex < field.items.length - 1 ? `<button class="btn-small" onclick="moveListItem(${fieldIndex}, ${itemIndex}, 1)" title="Bajar">↓</button>` : ''}
                  <button class="btn-small btn-danger" onclick="removeListItem(${fieldIndex}, ${itemIndex})">×</button>
                </div>
              </div>
            `).join('')}
            <button type="button" class="btn-small" onclick="addListItem(${fieldIndex})">➕ Agregar Elemento</button>
          </div>
        </div>
      `;
    }
    return '';
  }).join('');
}
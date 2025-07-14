// ==========================================
// GESTIÓN DE FUNCIONES EN PASOS
// ==========================================
function renderStepFunctions(stepIndex, stepFunctions) {
  const availableFunctions = functions.getAll();
  
  if (Object.keys(availableFunctions).length === 0) {
    return `
      <div style="margin-top: 12px; padding: 12px; background: var(--bg-tertiary); border-radius: 6px; color: var(--text-secondary);">
        <em>No hay funciones disponibles. Ve a la pestaña "Funciones" para crear algunas.</em>
      </div>
    `;
  }
  
  return `
    <div style="margin-top: 12px;">
      <label style="margin-bottom: 8px;">Funciones a ejecutar:</label>
      ${stepFunctions.map((func, funcIndex) => 
        renderStepFunction(stepIndex, funcIndex, func)
      ).join('')}
      <button type="button" class="btn-small" onclick="addFunction(${stepIndex})">➕ Agregar Función</button>
    </div>
  `;
}

function renderStepFunction(stepIndex, funcIndex, func) {
  const availableFunctions = functions.getAll();
  const funcDef = availableFunctions[func.type];
  const stepFunctions = state.flows[state.currentFlow].steps[stepIndex].functions;
  
  if (!funcDef) {
    return `
      <div class="function" style="border-color: var(--danger);">
        <div class="function-header">
          <strong style="color: var(--danger);">⚠️ Función no encontrada: ${func.type}</strong>
          <div style="display: flex; gap: 4px;">
            <button class="delete-btn" onclick="removeFunction(${stepIndex}, ${funcIndex})">×</button>
          </div>
        </div>
      </div>
    `;
  }
  
  // Controles de reordenamiento para funciones en pasos
  const functionControls = `
    <div class="step-controls">
      <button class="step-btn" onclick="duplicateFunction(${stepIndex}, ${funcIndex})" title="Duplicar función">📄</button>
      ${funcIndex > 0 ? `<button class="step-btn" onclick="moveStepFunction(${stepIndex}, ${funcIndex}, -1)" title="Subir función">↑</button>` : ''}
      ${funcIndex < stepFunctions.length - 1 ? `<button class="step-btn" onclick="moveStepFunction(${stepIndex}, ${funcIndex}, 1)" title="Bajar función">↓</button>` : ''}
      <button class="step-btn btn-danger" onclick="removeFunction(${stepIndex}, ${funcIndex})" title="Eliminar función">×</button>
    </div>
  `;
  
  return `
    <div class="function">
      <div class="function-header">
        <strong>${funcDef.name}</strong>
        ${functionControls}
      </div>
      
      <div class="form-group">
        <label>Función:</label>
        <select onchange="changeFunctionType(${stepIndex}, ${funcIndex}, this.value)">
          ${Object.keys(availableFunctions).map(key => 
            `<option value="${key}" ${key === func.type ? 'selected' : ''}>${availableFunctions[key].name}</option>`
          ).join('')}
        </select>
      </div>
      
      ${renderPredefinedParams(stepIndex, funcIndex, func, funcDef)}
      ${renderCustomFields(stepIndex, funcIndex, func)}
    </div>
  `;
}

function renderPredefinedParams(stepIndex, funcIndex, func, funcDef) {
  if (!funcDef.params || funcDef.params.length === 0) {
    return '';
  }
  
  return `
    <div style="margin-top: 12px;">
      ${funcDef.params.map(param => {
        const value = func.params ? func.params[param.name] || '' : '';
        const required = param.required ? ' *' : '';
        
        if (param.type === 'select' && param.options) {
          return `
            <div class="form-group">
              <label>${param.label}${required}:</label>
              <select onchange="updateFunctionParam(${stepIndex}, ${funcIndex}, '${param.name}', this.value)">
                <option value="">Seleccionar...</option>
                ${param.options.map(option => 
                  `<option value="${option}" ${value === option ? 'selected' : ''}>${option}</option>`
                ).join('')}
              </select>
            </div>
          `;
        } else if (param.type === 'textarea') {
          return `
            <div class="form-group">
              <label>${param.label}${required}:</label>
              <textarea placeholder="Ingresa ${param.label.toLowerCase()}..." 
                        oninput="updateFunctionParam(${stepIndex}, ${funcIndex}, '${param.name}', this.value)">${escapeHtml(value)}</textarea>
            </div>
          `;
        } else {
          return `
            <div class="form-group">
              <label>${param.label}${required}:</label>
              <input type="text" value="${escapeHtml(value)}" 
                     placeholder="Ingresa ${param.label.toLowerCase()}..."
                     oninput="updateFunctionParam(${stepIndex}, ${funcIndex}, '${param.name}', this.value)">
            </div>
          `;
        }
      }).join('')}
    </div>
  `;
}

function updateFunctionParam(stepIndex, funcIndex, paramName, value) {
  const func = state.flows[state.currentFlow].steps[stepIndex].functions[funcIndex];
  if (!func.params) func.params = {};
  func.params[paramName] = value;
  // Usar debounce para evitar llamadas excesivas
  clearTimeout(window.functionParamTimeout);
  window.functionParamTimeout = setTimeout(() => {
    updatePrompt();
    scheduleAutoSave();
  }, 300);
}

function renderCustomFields(stepIndex, funcIndex, func) {
  const customFields = func.customFields || [];
  
  return `
    <div style="margin-top: 12px;">
      <label style="color: var(--text-accent); margin-bottom: 8px; display: block;">Campos personalizados:</label>
      
      ${customFields.map((field, fieldIndex) => {
        // Controles de reordenamiento para campos personalizados
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
              <textarea placeholder="Valor del campo..." 
                        oninput="updateCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex}, 'value', this.value)">${escapeHtml(field.value || '')}</textarea>
            </div>
          </div>
        `;
      }).join('')}
      
      <button type="button" class="btn-small" onclick="addCustomField(${stepIndex}, ${funcIndex})">➕ Agregar Campo</button>
    </div>
  `;
}

// ==========================================
// FUNCIONES DE REORDENAMIENTO EN PASOS
// ==========================================

// Mover función dentro de un paso
function moveStepFunction(stepIndex, funcIndex, direction) {
  const stepFunctions = state.flows[state.currentFlow].steps[stepIndex].functions;
  const newIndex = funcIndex + direction;
  
  if (newIndex >= 0 && newIndex < stepFunctions.length) {
    // Intercambiar funciones
    [stepFunctions[funcIndex], stepFunctions[newIndex]] = [stepFunctions[newIndex], stepFunctions[funcIndex]];
    
    renderSteps();
    updatePrompt();
    scheduleAutoSave();
  }
}

// Mover campo personalizado dentro de una función de paso
function moveCustomField(stepIndex, funcIndex, fieldIndex, direction) {
  const func = state.flows[state.currentFlow].steps[stepIndex].functions[funcIndex];
  if (!func.customFields) return;
  
  const newIndex = fieldIndex + direction;
  
  if (newIndex >= 0 && newIndex < func.customFields.length) {
    // Intercambiar campos personalizados
    [func.customFields[fieldIndex], func.customFields[newIndex]] = [func.customFields[newIndex], func.customFields[fieldIndex]];
    
    renderSteps();
    updatePrompt();
    scheduleAutoSave();
  }
}

// ==========================================
// FUNCIONES EXISTENTES CON DUPLICAR
// ==========================================

function addFunction(stepIndex) {
  const availableFunctions = functions.getAll();
  const firstFunc = Object.keys(availableFunctions)[0];
  
  if (!firstFunc) {
    alert('No hay funciones disponibles. Ve a la pestaña "Funciones" para crear algunas.');
    return;
  }
  
  state.flows[state.currentFlow].steps[stepIndex].functions.push({
    type: firstFunc,
    customFields: []
  });
  
  renderSteps();
  updatePrompt();
  scheduleAutoSave();
}

function duplicateFunction(stepIndex, funcIndex) {
  const functionToDuplicate = state.flows[state.currentFlow].steps[stepIndex].functions[funcIndex];
  // Crear una copia profunda de la función con sufijos "- Copia"
  const duplicatedFunction = duplicateFunctionWithSuffix(functionToDuplicate);
  
  // Insertar la función duplicada después de la actual
  state.flows[state.currentFlow].steps[stepIndex].functions.splice(funcIndex + 1, 0, duplicatedFunction);
  
  renderSteps();
  updatePrompt();
  scheduleAutoSave();
}

// Función auxiliar para duplicar función con sufijos "- Copia" recursivamente
function duplicateFunctionWithSuffix(func) {
  // Crear copia profunda de la función
  const duplicatedFunction = JSON.parse(JSON.stringify(func));
  
  // Agregar "- Copia" a parámetros de texto predefinidos
  if (duplicatedFunction.params) {
    Object.keys(duplicatedFunction.params).forEach(paramKey => {
      if (typeof duplicatedFunction.params[paramKey] === 'string' && duplicatedFunction.params[paramKey].trim()) {
        duplicatedFunction.params[paramKey] = duplicatedFunction.params[paramKey] + " - Copia";
      }
    });
  }
  
  // Agregar "- Copia" a campos personalizados
  if (duplicatedFunction.customFields && duplicatedFunction.customFields.length > 0) {
    duplicatedFunction.customFields.forEach(field => {
      if (field.name && field.name.trim()) {
        field.name = field.name + " - Copia";
      }
      if (field.value && field.value.trim()) {
        field.value = field.value + " - Copia";
      }
    });
  }
  
  return duplicatedFunction;
}

function removeFunction(stepIndex, funcIndex) {
  if (confirm('¿Eliminar esta función?')) {
    state.flows[state.currentFlow].steps[stepIndex].functions.splice(funcIndex, 1);
    renderSteps();
    updatePrompt();
    scheduleAutoSave();
  }
}

function changeFunctionType(stepIndex, funcIndex, newType) {
  state.flows[state.currentFlow].steps[stepIndex].functions[funcIndex] = {
    type: newType,
    customFields: []
  };
  renderSteps();
  updatePrompt();
  scheduleAutoSave();
}

function addCustomField(stepIndex, funcIndex) {
  const func = state.flows[state.currentFlow].steps[stepIndex].functions[funcIndex];
  if (!func.customFields) func.customFields = [];
  
  func.customFields.push({
    name: '',
    value: ''
  });
  
  renderSteps();
  scheduleAutoSave();
}

function duplicateCustomField(stepIndex, funcIndex, fieldIndex) {
  const func = state.flows[state.currentFlow].steps[stepIndex].functions[funcIndex];
  if (!func.customFields) return;
  
  const fieldToDuplicate = func.customFields[fieldIndex];
  // Crear una copia profunda del campo con sufijos "- Copia"
  const duplicatedField = duplicateCustomFieldWithSuffix(fieldToDuplicate);
  
  // Insertar el campo duplicado después del actual
  func.customFields.splice(fieldIndex + 1, 0, duplicatedField);
  
  renderSteps();
  updatePrompt();
  scheduleAutoSave();
}

// Función auxiliar para duplicar campo personalizado con sufijos "- Copia"
function duplicateCustomFieldWithSuffix(field) {
  // Crear copia profunda del campo
  const duplicatedField = JSON.parse(JSON.stringify(field));
  
  // Agregar "- Copia" al nombre si no está vacío
  if (duplicatedField.name && duplicatedField.name.trim()) {
    duplicatedField.name = duplicatedField.name + " - Copia";
  }
  
  // Agregar "- Copia" al valor si no está vacío
  if (duplicatedField.value && duplicatedField.value.trim()) {
    duplicatedField.value = duplicatedField.value + " - Copia";
  }
  
  return duplicatedField;
}

function removeCustomField(stepIndex, funcIndex, fieldIndex) {
  if (confirm('¿Eliminar este campo?')) {
    const func = state.flows[state.currentFlow].steps[stepIndex].functions[funcIndex];
    func.customFields.splice(fieldIndex, 1);
    renderSteps();
    updatePrompt();
    scheduleAutoSave();
  }
}

function updateCustomField(stepIndex, funcIndex, fieldIndex, property, value) {
  const func = state.flows[state.currentFlow].steps[stepIndex].functions[funcIndex];
  if (!func.customFields) func.customFields = [];
  if (!func.customFields[fieldIndex]) func.customFields[fieldIndex] = {};
  
  func.customFields[fieldIndex][property] = value;
  // Usar debounce para evitar llamadas excesivas
  clearTimeout(window.customFieldTimeout);
  window.customFieldTimeout = setTimeout(() => {
    updatePrompt();
    scheduleAutoSave();
  }, 300);
}
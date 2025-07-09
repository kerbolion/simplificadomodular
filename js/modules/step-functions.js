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
  
  if (!funcDef) {
    return `
      <div class="function" style="border-color: var(--danger);">
        <div class="function-header">
          <strong style="color: var(--danger);">⚠️ Función no encontrada: ${func.type}</strong>
          <button class="delete-btn" onclick="removeFunction(${stepIndex}, ${funcIndex})">×</button>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="function">
      <div class="function-header">
        <strong>${funcDef.name}</strong>
        <button class="delete-btn" onclick="removeFunction(${stepIndex}, ${funcIndex})">×</button>
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
  updatePrompt();
  scheduleAutoSave();
}

function renderCustomFields(stepIndex, funcIndex, func) {
  const customFields = func.customFields || [];
  
  return `
    <div style="margin-top: 12px;">
      <label style="color: var(--text-accent); margin-bottom: 8px; display: block;">Campos personalizados:</label>
      
      ${customFields.map((field, fieldIndex) => `
        <div class="custom-field" style="background: var(--bg-tertiary); border: 1px solid var(--border-secondary); border-radius: 6px; padding: 12px; margin-bottom: 8px; position: relative;">
          <button class="delete-btn" onclick="removeCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex})" style="top: 4px; right: 4px;">×</button>
          
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
      `).join('')}
      
      <button type="button" class="btn-small" onclick="addCustomField(${stepIndex}, ${funcIndex})">➕ Agregar Campo</button>
    </div>
  `;
}

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
  updatePrompt();
  scheduleAutoSave();
}
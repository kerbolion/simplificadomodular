// ==========================================
// MÓDULO DE GESTIÓN DE FLUJOS
// ==========================================

const flows = {
  // ==========================================
  // GESTIÓN DE FLUJOS
  // ==========================================
  
  // Agregar nuevo flujo
  add() {
    const name = utils.promptWithValidation(
      "Nombre del nuevo flujo:", 
      `Flujo ${state.flows.length + 1}`,
      (value) => value.length > 0
    );
    
    if (name) {
      state.flows.push({ 
        name: name, 
        steps: [{ text: '', functions: [] }] 
      });
      state.currentFlow = state.flows.length - 1;
      this.render();
      this.renderSteps();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Eliminar flujo actual
  delete() {
    if (state.flows.length <= 1) {
      alert("Debe haber al menos un flujo");
      return;
    }
    
    const currentFlow = getState.currentFlow();
    if (utils.confirmAction(`el flujo "${currentFlow.name}"`)) {
      state.flows.splice(state.currentFlow, 1);
      state.currentFlow = Math.max(0, state.currentFlow - 1);
      this.render();
      this.renderSteps();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Cambiar flujo actual
  change() {
    const newIndex = parseInt(utils.getElement('flow-selector').value);
    if (validate.flowIndex(newIndex)) {
      state.currentFlow = newIndex;
      this.renderSteps();
      utils.setInputValue('flow-name', state.flows[newIndex].name);
    }
  },

  // Renombrar flujo actual
  rename() {
    const newName = utils.getInputValue('flow-name');
    if (utils.cleanText(newName)) {
      state.flows[state.currentFlow].name = newName;
      this.render();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // ==========================================
  // GESTIÓN DE PASOS
  // ==========================================
  
  // Agregar paso al flujo actual
  addStep() {
    getState.currentFlow().steps.push({ text: '', functions: [] });
    this.renderSteps();
    prompt.update();
    events.scheduleAutoSave();
  },

  // Eliminar paso
  removeStep(index) {
    if (utils.confirmAction("este paso")) {
      getState.currentFlow().steps.splice(index, 1);
      this.renderSteps();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Mover paso
  moveStep(index, direction) {
    const steps = getState.currentFlow().steps;
    const newIndex = index + direction;
    
    if (utils.moveArrayItem(steps, index, newIndex)) {
      this.renderSteps();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Actualizar texto de paso
  updateStepText(index, value) {
    getState.currentFlow().steps[index].text = value;
    prompt.update();
    events.scheduleAutoSave();
  },

  // ==========================================
  // GESTIÓN DE FUNCIONES EN PASOS
  // ==========================================
  
  // Agregar función a paso
  addFunction(stepIndex) {
    const availableFunctions = functions.getAll();
    const firstFunc = Object.keys(availableFunctions)[0];
    
    if (!firstFunc) {
      alert('No hay funciones disponibles. Ve a la pestaña "Funciones" para crear algunas.');
      return;
    }
    
    getState.currentFlow().steps[stepIndex].functions.push({
      type: firstFunc,
      customFields: []
    });
    
    this.renderSteps();
    prompt.update();
    events.scheduleAutoSave();
  },

  // Eliminar función de paso
  removeFunction(stepIndex, funcIndex) {
    if (utils.confirmAction('esta función')) {
      getState.currentFlow().steps[stepIndex].functions.splice(funcIndex, 1);
      this.renderSteps();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Cambiar tipo de función
  changeFunctionType(stepIndex, funcIndex, newType) {
    getState.currentFlow().steps[stepIndex].functions[funcIndex] = {
      type: newType,
      customFields: []
    };
    this.renderSteps();
    prompt.update();
    events.scheduleAutoSave();
  },

  // Actualizar parámetro de función
  updateFunctionParam(stepIndex, funcIndex, paramName, value) {
    const func = getState.currentFlow().steps[stepIndex].functions[funcIndex];
    if (!func.params) func.params = {};
    func.params[paramName] = value;
    prompt.update();
    events.scheduleAutoSave();
  },

  // Agregar campo personalizado
  addCustomField(stepIndex, funcIndex) {
    const func = getState.currentFlow().steps[stepIndex].functions[funcIndex];
    if (!func.customFields) func.customFields = [];
    
    func.customFields.push({
      name: '',
      value: ''
    });
    
    this.renderSteps();
    events.scheduleAutoSave();
  },

  // Eliminar campo personalizado
  removeCustomField(stepIndex, funcIndex, fieldIndex) {
    if (utils.confirmAction('este campo')) {
      const func = getState.currentFlow().steps[stepIndex].functions[funcIndex];
      func.customFields.splice(fieldIndex, 1);
      this.renderSteps();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Actualizar campo personalizado
  updateCustomField(stepIndex, funcIndex, fieldIndex, property, value) {
    const func = getState.currentFlow().steps[stepIndex].functions[funcIndex];
    if (!func.customFields) func.customFields = [];
    if (!func.customFields[fieldIndex]) func.customFields[fieldIndex] = {};
    
    func.customFields[fieldIndex][property] = value;
    prompt.update();
    events.scheduleAutoSave();
  },

  // ==========================================
  // RENDERIZADO
  // ==========================================
  
  // Renderizar selector de flujos
  render() {
    const selector = utils.getElement('flow-selector');
    if (!selector) return;

    selector.innerHTML = state.flows.map((flow, index) => 
      `<option value="${index}" ${index === state.currentFlow ? 'selected' : ''}>${utils.escapeHtml(flow.name)}</option>`
    ).join('');
    
    const nameInput = utils.getElement('flow-name');
    if (nameInput) {
      nameInput.value = state.flows[state.currentFlow].name;
    }
  },

  // Renderizar pasos del flujo actual
  renderSteps() {
    const container = utils.getElement('steps-container');
    if (!container) return;

    const currentFlow = getState.currentFlow();
    
    container.innerHTML = currentFlow.steps.map((step, index) => 
      this.renderStep(step, index, currentFlow.steps.length)
    ).join('');
  },

  // Renderizar un paso individual
  renderStep(step, index, totalSteps) {
    return `
      <div class="step">
        <div class="step-header">
          <span class="step-number">Paso ${index + 1}</span>
          <div class="step-controls">
            ${index > 0 ? `<button class="step-btn" onclick="flows.moveStep(${index}, -1)" title="Subir">↑</button>` : ''}
            ${index < totalSteps - 1 ? `<button class="step-btn" onclick="flows.moveStep(${index}, 1)" title="Bajar">↓</button>` : ''}
            <button class="step-btn btn-danger" onclick="flows.removeStep(${index})" title="Eliminar">×</button>
          </div>
        </div>
        
        <div class="form-group">
          <label>Mensaje del paso:</label>
          <textarea placeholder="Descripción de lo que debe hacer el asistente en este paso..." 
                    oninput="flows.updateStepText(${index}, this.value)">${utils.escapeHtml(step.text)}</textarea>
        </div>
        
        ${this.renderStepFunctions(index, step.functions)}
      </div>
    `;
  },

  // Renderizar funciones de un paso
  renderStepFunctions(stepIndex, stepFunctions) {
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
          this.renderStepFunction(stepIndex, funcIndex, func)
        ).join('')}
        <button type="button" class="btn-small" onclick="flows.addFunction(${stepIndex})">➕ Agregar Función</button>
      </div>
    `;
  },

  // Renderizar una función de paso
  renderStepFunction(stepIndex, funcIndex, func) {
    const availableFunctions = functions.getAll();
    const funcDef = availableFunctions[func.type];
    
    if (!funcDef) {
      return `
        <div class="function" style="border-color: var(--danger);">
          <div class="function-header">
            <strong style="color: var(--danger);">⚠️ Función no encontrada: ${func.type}</strong>
            <button class="delete-btn" onclick="flows.removeFunction(${stepIndex}, ${funcIndex})">×</button>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="function">
        <div class="function-header">
          <strong>${funcDef.name}</strong>
          <button class="delete-btn" onclick="flows.removeFunction(${stepIndex}, ${funcIndex})">×</button>
        </div>
        
        <div class="form-group">
          <label>Función:</label>
          <select onchange="flows.changeFunctionType(${stepIndex}, ${funcIndex}, this.value)">
            ${Object.keys(availableFunctions).map(key => 
              `<option value="${key}" ${key === func.type ? 'selected' : ''}>${availableFunctions[key].name}</option>`
            ).join('')}
          </select>
        </div>
        
        ${this.renderPredefinedParams(stepIndex, funcIndex, func, funcDef)}
        ${this.renderCustomFields(stepIndex, funcIndex, func)}
      </div>
    `;
  },

  // Renderizar parámetros predefinidos
  renderPredefinedParams(stepIndex, funcIndex, func, funcDef) {
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
                <select onchange="flows.updateFunctionParam(${stepIndex}, ${funcIndex}, '${param.name}', this.value)">
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
                          oninput="flows.updateFunctionParam(${stepIndex}, ${funcIndex}, '${param.name}', this.value)">${utils.escapeHtml(value)}</textarea>
              </div>
            `;
          } else {
            return `
              <div class="form-group">
                <label>${param.label}${required}:</label>
                <input type="text" value="${utils.escapeHtml(value)}" 
                       placeholder="Ingresa ${param.label.toLowerCase()}..."
                       oninput="flows.updateFunctionParam(${stepIndex}, ${funcIndex}, '${param.name}', this.value)">
              </div>
            `;
          }
        }).join('')}
      </div>
    `;
  },

  // Renderizar campos personalizados
  renderCustomFields(stepIndex, funcIndex, func) {
    const customFields = func.customFields || [];
    
    return `
      <div style="margin-top: 12px;">
        <label style="color: var(--text-accent); margin-bottom: 8px; display: block;">Campos personalizados:</label>
        
        ${customFields.map((field, fieldIndex) => `
          <div class="custom-field">
            <button class="delete-btn" onclick="flows.removeCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex})" style="top: 4px; right: 4px;">×</button>
            
            <div class="form-group">
              <label>Nombre del campo:</label>
              <input type="text" value="${utils.escapeHtml(field.name || '')}" 
                     placeholder="Ej: nombre_formulario, whatsapp, mensaje..."
                     oninput="flows.updateCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex}, 'name', this.value)">
            </div>
            
            <div class="form-group">
              <label>Valor:</label>
              <textarea placeholder="Valor del campo..." 
                        oninput="flows.updateCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex}, 'value', this.value)">${utils.escapeHtml(field.value || '')}</textarea>
            </div>
          </div>
        `).join('')}
        
        <button type="button" class="btn-small" onclick="flows.addCustomField(${stepIndex}, ${funcIndex})">➕ Agregar Campo</button>
      </div>
    `;
  },

  // ==========================================
  // VALIDACIÓN
  // ==========================================
  
  // Validar flujo
  validateFlow(flowIndex) {
    const flow = state.flows[flowIndex];
    if (!flow) return { isValid: false, errors: ['Flujo no encontrado'] };

    const errors = [];
    
    if (!utils.cleanText(flow.name)) {
      errors.push('El flujo debe tener un nombre');
    }
    
    if (flow.steps.length === 0) {
      errors.push('El flujo debe tener al menos un paso');
    }
    
    flow.steps.forEach((step, index) => {
      if (!utils.cleanText(step.text)) {
        errors.push(`El paso ${index + 1} debe tener un mensaje`);
      }
      
      // Validar funciones del paso
      step.functions.forEach((func, funcIndex) => {
        const validation = functions.validateParams(func.type, func.params || {});
        if (!validation.valid) {
          errors.push(`Paso ${index + 1}, función ${funcIndex + 1}: ${validation.errors.join(', ')}`);
        }
      });
    });

    return { isValid: errors.length === 0, errors };
  },

  // Validar todos los flujos
  validateAll() {
    const results = state.flows.map((flow, index) => ({
      flowIndex: index,
      flowName: flow.name,
      ...this.validateFlow(index)
    }));

    const allValid = results.every(result => result.isValid);
    const allErrors = results.filter(result => !result.isValid);

    return {
      isValid: allValid,
      results: results,
      errors: allErrors
    };
  },

  // ==========================================
  // UTILIDADES
  // ==========================================
  
  // Duplicar flujo
  duplicate(flowIndex) {
    if (!validate.flowIndex(flowIndex)) return;
    
    const originalFlow = state.flows[flowIndex];
    const newName = utils.promptWithValidation(
      "Nombre del flujo duplicado:",
      `${originalFlow.name} (copia)`,
      (value) => value.length > 0
    );
    
    if (newName) {
      const duplicatedFlow = JSON.parse(JSON.stringify(originalFlow));
      duplicatedFlow.name = newName;
      
      state.flows.push(duplicatedFlow);
      state.currentFlow = state.flows.length - 1;
      
      this.render();
      this.renderSteps();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Obtener estadísticas del flujo
  getFlowStats(flowIndex) {
    const flow = state.flows[flowIndex];
    if (!flow) return null;

    const totalSteps = flow.steps.length;
    const stepsWithText = flow.steps.filter(step => utils.cleanText(step.text)).length;
    const totalFunctions = flow.steps.reduce((total, step) => total + step.functions.length, 0);
    const stepsWithFunctions = flow.steps.filter(step => step.functions.length > 0).length;

    return {
      name: flow.name,
      totalSteps,
      stepsWithText,
      totalFunctions,
      stepsWithFunctions,
      completeness: totalSteps > 0 ? (stepsWithText / totalSteps) * 100 : 0
    };
  },

  // Obtener estadísticas de todos los flujos
  getAllStats() {
    return state.flows.map((flow, index) => ({
      index,
      ...this.getFlowStats(index)
    }));
  },

  // Exportar flujo como JSON
  exportFlow(flowIndex) {
    if (!validate.flowIndex(flowIndex)) return;
    
    const flow = state.flows[flowIndex];
    const data = JSON.stringify(flow, null, 2);
    const filename = `flujo_${flow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    
    utils.downloadFile(data, filename);
  },

  // Importar flujo desde JSON
  importFlow() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const content = await utils.readFile(file);
        const flow = JSON.parse(content);
        
        // Validar estructura del flujo
        if (!flow.name || !Array.isArray(flow.steps)) {
          throw new Error('Archivo de flujo inválido');
        }
        
        // Asegurar que el nombre sea único
        let flowName = flow.name;
        let counter = 1;
        while (state.flows.some(f => f.name === flowName)) {
          flowName = `${flow.name} (${counter})`;
          counter++;
        }
        flow.name = flowName;
        
        // Agregar el flujo
        state.flows.push(flow);
        state.currentFlow = state.flows.length - 1;
        
        this.render();
        this.renderSteps();
        prompt.update();
        events.scheduleAutoSave();
        
        alert(`Flujo "${flowName}" importado exitosamente`);
        
      } catch (error) {
        utils.error('Error al importar flujo:', error);
        alert('Error al importar flujo: ' + error.message);
      }
    };
    
    input.click();
  }
};
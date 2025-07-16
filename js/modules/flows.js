// ==========================================
// GESTIÓN DE FLUJOS CORREGIDA
// ==========================================

class FlowManager {
  constructor() {
    this.scrollFeedbackTimeout = null;
  }

  // ==========================================
  // OPERACIONES DE FLUJOS
  // ==========================================

  addFlow() {
    const name = prompt("Nombre del nuevo flujo:", `Flujo ${state.flows.length + 1}`);
    if (name && name.trim()) {
      state.flows.push({ 
        name: name.trim(), 
        steps: [{ text: '', functions: [] }] 
      });
      state.currentFlow = state.flows.length - 1;
      this.renderFlows();
      this.renderSteps();
      this.updatePrompt();
      this.scheduleAutoSave();
    }
  }

  duplicateFlow() {
    const currentFlow = state.flows[state.currentFlow];
    const newName = prompt("Nombre para el flujo duplicado:", `${currentFlow.name} - Copia`);
    
    if (newName && newName.trim()) {
      const duplicatedFlow = this.duplicateFlowWithSuffix(currentFlow, newName.trim());
      state.flows.splice(state.currentFlow + 1, 0, duplicatedFlow);
      state.currentFlow = state.currentFlow + 1;
      
      this.renderFlows();
      this.renderSteps();
      this.updatePrompt();
      this.scheduleAutoSave();
    }
  }

  deleteFlow() {
    if (state.flows.length <= 1) {
      alert("Debe haber al menos un flujo");
      return;
    }
    
    if (confirm(`¿Eliminar el flujo "${state.flows[state.currentFlow].name}"?`)) {
      state.flows.splice(state.currentFlow, 1);
      state.currentFlow = Math.max(0, state.currentFlow - 1);
      this.renderFlows();
      this.renderSteps();
      this.updatePrompt();
      this.scheduleAutoSave();
    }
  }

  changeFlow() {
    state.currentFlow = parseInt(document.getElementById('flow-selector').value);
    this.renderSteps();
    this.renderFlowControls();
    document.getElementById('flow-name').value = state.flows[state.currentFlow].name;
  }

  renameFlow() {
    const newName = document.getElementById('flow-name').value.trim();
    if (newName) {
      state.flows[state.currentFlow].name = newName;
      this.renderFlows();
      this.updatePrompt();
      this.scheduleAutoSave();
    }
  }

  moveFlow(direction) {
    const flows = state.flows;
    const currentIndex = state.currentFlow;
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < flows.length) {
      [flows[currentIndex], flows[newIndex]] = [flows[newIndex], flows[currentIndex]];
      state.currentFlow = newIndex;
      
      this.renderFlows();
      this.renderSteps();
      this.updatePrompt();
      this.scheduleAutoSave();
    }
  }

  // ==========================================
  // OPERACIONES DE PASOS
  // ==========================================

  addStep() {
    state.flows[state.currentFlow].steps.push({ text: '', functions: [] });
    this.renderSteps();
    this.updatePrompt();
    this.scheduleAutoSave();
  }

  duplicateStep(index) {
    const stepToDuplicate = state.flows[state.currentFlow].steps[index];
    const duplicatedStep = this.duplicateStepWithSuffix(stepToDuplicate);
    
    state.flows[state.currentFlow].steps.splice(index + 1, 0, duplicatedStep);
    this.renderSteps();
    this.updatePrompt();
    this.scheduleAutoSave();
  }

  removeStep(index) {
    if (confirm("¿Eliminar este paso?")) {
      state.flows[state.currentFlow].steps.splice(index, 1);
      this.renderSteps();
      this.updatePrompt();
      this.scheduleAutoSave();
    }
  }

  moveStep(index, direction) {
    const steps = state.flows[state.currentFlow].steps;
    const newIndex = index + direction;
    
    if (newIndex >= 0 && newIndex < steps.length) {
      [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
      this.renderSteps();
      this.updatePrompt();
      this.scheduleAutoSave();
    }
  }

  updateStepText(index, value) {
    state.flows[state.currentFlow].steps[index].text = value;
    TimingUtils.debounce('stepTextUpdate', () => {
      this.updatePrompt();
      this.scheduleAutoSave();
    }, 300);
  }

  // ==========================================
  // FUNCIONES DE SCROLL
  // ==========================================

  scrollToStepInOutput(stepIndex) {
    const currentFlow = state.flows[state.currentFlow];
    const step = currentFlow.steps[stepIndex];
    
    if (!step || !step.text || !step.text.trim()) {
      console.warn('Paso no encontrado o vacío');
      return;
    }
    
    const outputPanel = document.querySelector('.panel.output');
    const outputElement = document.getElementById('output');
    
    if (!outputPanel || !outputElement) {
      console.warn('No se encontró el panel de salida');
      return;
    }
    
    const outputContent = outputElement.innerHTML;
    const stepText = step.text.trim();
    const escapedStepText = TextUtils.escapeRegex(stepText);
    const stepPattern = new RegExp(`<span class="output-step-number">${stepIndex + 1}\\.</span>\\s*${escapedStepText}`, 'i');
    const match = stepPattern.exec(outputContent);
    
    if (match) {
      this.scrollToMatch(outputPanel, outputElement, match);
      const stepDescription = `Paso ${stepIndex + 1}: "${TextUtils.truncate(stepText, 40)}"`;
      this.showStepScrollFeedback(stepDescription, true);
    } else {
      this.scrollToFlowInOutput();
      const stepDescription = `Paso ${stepIndex + 1}: "${TextUtils.truncate(stepText, 40)}"`;
      this.showStepScrollFeedback(stepDescription, false);
    }
  }

  scrollToFlowInOutput() {
    const currentFlowName = state.flows[state.currentFlow].name;
    const outputPanel = document.querySelector('.panel.output');
    const outputElement = document.getElementById('output');
    
    if (!outputPanel || !outputElement) {
      console.warn('No se encontró el panel de salida');
      return;
    }
    
    const outputContent = outputElement.innerHTML;
    const flowPatterns = [
      new RegExp(`<span class="output-section">${TextUtils.escapeRegex(currentFlowName)}:</span>`, 'i'),
      new RegExp(`<span class="output-section">Flujo principal:</span>`, 'i')
    ];
    
    let match = null;
    for (const pattern of flowPatterns) {
      match = pattern.exec(outputContent);
      if (match) break;
    }
    
    if (match) {
      this.scrollToMatch(outputPanel, outputElement, match);
      this.showScrollFeedback(currentFlowName, true, 'flow');
    } else {
      outputPanel.scrollTo({ top: 0, behavior: 'smooth' });
      this.showScrollFeedback(currentFlowName, false, 'flow');
    }
  }

  // ==========================================
  // RENDERIZADO
  // ==========================================

  renderFlows() {
    const selector = document.getElementById('flow-selector');
    if (!selector) return;
    
    selector.innerHTML = state.flows.map((flow, index) => 
      `<option value="${index}" ${index === state.currentFlow ? 'selected' : ''}>${TextUtils.escapeHtml(flow.name)}</option>`
    ).join('');
    
    if (document.getElementById('flow-name')) {
      document.getElementById('flow-name').value = state.flows[state.currentFlow].name;
    }
    
    this.renderFlowControls();
  }

  renderFlowControls() {
    const container = document.getElementById('flow-controls');
    if (!container) return;
    
    let controlsHTML = `
      <button type="button" class="btn-small" onclick="flowManager.addFlow()">➕ Nuevo Flujo</button>
      <button type="button" class="btn-small" onclick="flowManager.duplicateFlow()">📄 Duplicar</button>
      <button type="button" class="btn-small btn-danger" onclick="flowManager.deleteFlow()">🗑️ Eliminar</button>
    `;
    
    if (state.flows.length > 1) {
      if (state.currentFlow > 0) {
        controlsHTML += `<button type="button" class="btn-small" onclick="flowManager.moveFlow(-1)">⬆️ Subir</button>`;
      }
      if (state.currentFlow < state.flows.length - 1) {
        controlsHTML += `<button type="button" class="btn-small" onclick="flowManager.moveFlow(1)">⬇️ Bajar</button>`;
      }
    }
    
    container.innerHTML = controlsHTML;
  }

  renderSteps() {
    const container = document.getElementById('steps-container');
    if (!container) return;
    
    const currentFlow = state.flows[state.currentFlow];
    if (!currentFlow) return;
    
    container.innerHTML = currentFlow.steps.map((step, index) => 
      this.renderStep(step, index, currentFlow.steps.length)
    ).join('');
  }

  renderStep(step, index, totalSteps) {
    const stepControls = this.renderStepControls(index, totalSteps);
    
    return `
      <div class="step">
        <div class="step-header">
          <span class="step-number">Paso ${index + 1}</span>
          ${stepControls}
        </div>
        
        <div class="form-group">
          <label>Mensaje del paso:</label>
          <textarea class="autoresize max-height" 
                    placeholder="Descripción de lo que debe hacer el asistente en este paso..." 
                    oninput="flowManager.updateStepText(${index}, this.value)">${TextUtils.escapeHtml(step.text)}</textarea>
        </div>
        
        ${this.renderStepFunctions(index, step.functions)}
      </div>
    `;
  }

  renderStepControls(index, totalSteps) {
    return `
      <div class="step-controls">
        <button class="step-btn" onclick="flowManager.duplicateStep(${index})" title="Duplicar">📄</button>
        ${index > 0 ? `<button class="step-btn" onclick="flowManager.moveStep(${index}, -1)" title="Subir">↑</button>` : ''}
        ${index < totalSteps - 1 ? `<button class="step-btn" onclick="flowManager.moveStep(${index}, 1)" title="Bajar">↓</button>` : ''}
        <button class="step-btn" onclick="flowManager.scrollToStepInOutput(${index})" title="Ir a este paso específico en el resultado" style="background: #059669; color: white;">📍</button>
        <button class="step-btn btn-danger" onclick="flowManager.removeStep(${index})" title="Eliminar">×</button>
      </div>
    `;
  }

  renderStepFunctions(stepIndex, stepFunctions) {
    // Verificar que functions esté disponible
    if (!window.functions || !window.functions.getAll) {
      return `
        <div style="margin-top: 12px; padding: 12px; background: var(--bg-tertiary); border-radius: 6px; color: var(--text-secondary);">
          <em>Cargando funciones...</em>
        </div>
      `;
    }

    const availableFunctions = window.functions.getAll();
    
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
          this.renderStepFunction(stepIndex, funcIndex, func, stepFunctions.length)
        ).join('')}
        <button type="button" class="btn-small" onclick="stepFunctionManager.addFunction(${stepIndex})">➕ Agregar Función</button>
      </div>
    `;
  }

  renderStepFunction(stepIndex, funcIndex, func, totalFunctions) {
    const availableFunctions = window.functions.getAll();
    const funcDef = availableFunctions[func.type];
    
    if (!funcDef) {
      return `
        <div class="function" style="border-color: var(--danger);">
          <div class="function-header">
            <strong style="color: var(--danger);">⚠️ Función no encontrada: ${func.type}</strong>
            <div style="display: flex; gap: 4px;">
              <button class="delete-btn" onclick="stepFunctionManager.removeFunction(${stepIndex}, ${funcIndex})">×</button>
            </div>
          </div>
        </div>
      `;
    }
    
    const functionControls = this.renderFunctionControls(stepIndex, funcIndex, totalFunctions);
    
    return `
      <div class="function">
        <div class="function-header">
          <strong>${funcDef.name}</strong>
          ${functionControls}
        </div>
        
        <div class="form-group">
          <label>Función:</label>
          <select onchange="stepFunctionManager.changeFunctionType(${stepIndex}, ${funcIndex}, this.value)">
            ${Object.keys(availableFunctions).map(key => 
              `<option value="${key}" ${key === func.type ? 'selected' : ''}>${availableFunctions[key].name}</option>`
            ).join('')}
          </select>
        </div>
        
        ${this.renderPredefinedParams(stepIndex, funcIndex, func, funcDef)}
        ${this.renderCustomFields(stepIndex, funcIndex, func)}
      </div>
    `;
  }

  renderFunctionControls(stepIndex, funcIndex, totalFunctions) {
    return `
      <div class="step-controls">
        <button class="step-btn" onclick="stepFunctionManager.duplicateFunction(${stepIndex}, ${funcIndex})" title="Duplicar función">📄</button>
        ${funcIndex > 0 ? `<button class="step-btn" onclick="stepFunctionManager.moveStepFunction(${stepIndex}, ${funcIndex}, -1)" title="Subir función">↑</button>` : ''}
        ${funcIndex < totalFunctions - 1 ? `<button class="step-btn" onclick="stepFunctionManager.moveStepFunction(${stepIndex}, ${funcIndex}, 1)" title="Bajar función">↓</button>` : ''}
        <button class="step-btn btn-danger" onclick="stepFunctionManager.removeFunction(${stepIndex}, ${funcIndex})" title="Eliminar función">×</button>
      </div>
    `;
  }

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
                <select onchange="stepFunctionManager.updateFunctionParam(${stepIndex}, ${funcIndex}, '${param.name}', this.value)">
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
                <textarea class="autoresize max-height" placeholder="Ingresa ${param.label.toLowerCase()}..." 
                          oninput="stepFunctionManager.updateFunctionParam(${stepIndex}, ${funcIndex}, '${param.name}', this.value)">${TextUtils.escapeHtml(value)}</textarea>
              </div>
            `;
          } else {
            return `
              <div class="form-group">
                <label>${param.label}${required}:</label>
                <input type="text" value="${TextUtils.escapeHtml(value)}" 
                       placeholder="Ingresa ${param.label.toLowerCase()}..."
                       oninput="stepFunctionManager.updateFunctionParam(${stepIndex}, ${funcIndex}, '${param.name}', this.value)">
              </div>
            `;
          }
        }).join('')}
      </div>
    `;
  }

  renderCustomFields(stepIndex, funcIndex, func) {
    const customFields = func.customFields || [];
    
    return `
      <div style="margin-top: 12px;">
        <label style="color: var(--text-accent); margin-bottom: 8px; display: block;">Campos personalizados:</label>
        
        ${customFields.map((field, fieldIndex) => {
          const fieldControls = this.renderCustomFieldControls(stepIndex, funcIndex, fieldIndex, customFields.length);
          
          return `
            <div class="custom-field" style="background: var(--bg-tertiary); border: 1px solid var(--border-secondary); border-radius: 6px; padding: 12px; margin-bottom: 8px; position: relative;">
              ${fieldControls}
              
              <div class="form-group">
                <label>Nombre del campo:</label>
                <input type="text" value="${TextUtils.escapeHtml(field.name || '')}" 
                       placeholder="Ej: nombre_formulario, whatsapp, mensaje..."
                       oninput="stepFunctionManager.updateCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex}, 'name', this.value)">
              </div>
              
              <div class="form-group">
                <label>Valor:</label>
                <textarea class="autoresize max-height" 
                          placeholder="Valor del campo..." 
                          oninput="stepFunctionManager.updateCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex}, 'value', this.value)">${TextUtils.escapeHtml(field.value || '')}</textarea>
              </div>
            </div>
          `;
        }).join('')}
        
        <button type="button" class="btn-small" onclick="stepFunctionManager.addCustomField(${stepIndex}, ${funcIndex})">➕ Agregar Campo</button>
      </div>
    `;
  }

  renderCustomFieldControls(stepIndex, funcIndex, fieldIndex, totalFields) {
    return `
      <div class="step-controls" style="position: absolute; top: 8px; right: 8px;">
        <button class="step-btn" onclick="stepFunctionManager.duplicateCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex})" title="Duplicar campo">📄</button>
        ${fieldIndex > 0 ? `<button class="step-btn" onclick="stepFunctionManager.moveCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex}, -1)" title="Subir campo">↑</button>` : ''}
        ${fieldIndex < totalFields - 1 ? `<button class="step-btn" onclick="stepFunctionManager.moveCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex}, 1)" title="Bajar campo">↓</button>` : ''}
        <button class="step-btn btn-danger" onclick="stepFunctionManager.removeCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex})" title="Eliminar campo">×</button>
      </div>
    `;
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD PRIVADOS
  // ==========================================

  duplicateFlowWithSuffix(flow, newName) {
    const duplicated = JSON.parse(JSON.stringify(flow));
    duplicated.name = newName;
    
    duplicated.steps.forEach(step => {
      if (step.text && step.text.trim()) {
        step.text = step.text + " - Copia";
      }
      
      if (step.functions && step.functions.length > 0) {
        step.functions.forEach(func => {
          if (func.params) {
            Object.keys(func.params).forEach(paramKey => {
              if (typeof func.params[paramKey] === 'string' && func.params[paramKey].trim()) {
                func.params[paramKey] = func.params[paramKey] + " - Copia";
              }
            });
          }
          
          if (func.customFields && func.customFields.length > 0) {
            func.customFields.forEach(field => {
              if (field.name && field.name.trim()) {
                field.name = field.name + " - Copia";
              }
              if (field.value && field.value.trim()) {
                field.value = field.value + " - Copia";
              }
            });
          }
        });
      }
    });
    
    return duplicated;
  }

  duplicateStepWithSuffix(step) {
    const duplicated = JSON.parse(JSON.stringify(step));
    
    if (duplicated.text && duplicated.text.trim()) {
      duplicated.text = duplicated.text + " - Copia";
    }
    
    if (duplicated.functions && duplicated.functions.length > 0) {
      duplicated.functions.forEach(func => {
        if (func.params) {
          Object.keys(func.params).forEach(paramKey => {
            if (typeof func.params[paramKey] === 'string' && func.params[paramKey].trim()) {
              func.params[paramKey] = func.params[paramKey] + " - Copia";
            }
          });
        }
        
        if (func.customFields && func.customFields.length > 0) {
          func.customFields.forEach(field => {
            if (field.name && field.name.trim()) {
              field.name = field.name + " - Copia";
            }
            if (field.value && field.value.trim()) {
              field.value = field.value + " - Copia";
            }
          });
        }
      });
    }
    
    return duplicated;
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

  showStepScrollFeedback(stepDescription, found = true) {
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
      ${found ? '🔄 <strong>Aquí:</strong>' : '🔍 <strong>No visible:</strong>'}<br>
      <span style="font-size: 10px;">${stepDescription}</span>
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

  showScrollFeedback(elementName, found = true, type = '') {
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
    
    const icon = type === 'flow' ? '🔄' : '📍';
    feedback.innerHTML = `
      ${found ? `${icon} <strong>Aquí:</strong>` : '🔍 <strong>No visible:</strong>'}<br>
      <span style="font-size: 10px;">${elementName}</span>
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
const flowManager = new FlowManager();

// Exportar globalmente
window.flowManager = flowManager;

// Funciones legacy para compatibilidad (redirigen a flowManager)
window.addFlow = () => flowManager.addFlow();
window.duplicateFlow = () => flowManager.duplicateFlow();
window.deleteFlow = () => flowManager.deleteFlow();
window.changeFlow = () => flowManager.changeFlow();
window.renameFlow = () => flowManager.renameFlow();
window.moveFlow = (direction) => flowManager.moveFlow(direction);
window.addStep = () => flowManager.addStep();
window.duplicateStep = (index) => flowManager.duplicateStep(index);
window.removeStep = (index) => flowManager.removeStep(index);
window.moveStep = (index, direction) => flowManager.moveStep(index, direction);
window.updateStepText = (index, value) => flowManager.updateStepText(index, value);
window.scrollToStepInOutput = (stepIndex) => flowManager.scrollToStepInOutput(stepIndex);
window.scrollToFlowInOutput = () => flowManager.scrollToFlowInOutput();
window.renderFlows = () => flowManager.renderFlows();
window.renderSteps = () => flowManager.renderSteps();
window.renderStepFunctions = (stepIndex, stepFunctions) => flowManager.renderStepFunctions(stepIndex, stepFunctions);
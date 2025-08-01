// ==========================================
// GESTIÓN DE FLUJOS CORREGIDA CON TEXTOS REORDENABLES
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
        steps: [{ text: '', functions: [], textElements: [] }] 
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
    const newStep = { 
      text: '', 
      functions: [], 
      textElements: [],
      elementOrder: [] // Nuevo: orden de elementos
    };
    state.flows[state.currentFlow].steps.push(newStep);
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
  // OPERACIONES DE ELEMENTOS DE TEXTO
  // ==========================================

  addTextElement(stepIndex) {
    const step = state.flows[state.currentFlow].steps[stepIndex];
    if (!step.textElements) step.textElements = [];
    if (!step.elementOrder) step.elementOrder = [];
    
    const newTextIndex = step.textElements.length;
    step.textElements.push({ text: '' });
    
    // Agregar al orden global
    step.elementOrder.push({
      type: 'text',
      index: newTextIndex
    });
    
    this.renderSteps();
    this.scheduleAutoSave();
  }

  // Función para interceptar cuando se agregan funciones desde stepFunctionManager
  onFunctionAdded(stepIndex, functionIndex) {
    const step = state.flows[state.currentFlow].steps[stepIndex];
    if (!step.elementOrder) step.elementOrder = [];
    
    // Agregar la nueva función al final del orden
    step.elementOrder.push({
      type: 'function',
      index: functionIndex
    });
    
    this.renderSteps();
    this.updatePrompt();
  }

  duplicateTextElement(stepIndex, textIndex) {
    const step = state.flows[state.currentFlow].steps[stepIndex];
    if (!step.textElements) return;
    
    const textToDuplicate = step.textElements[textIndex];
    const duplicatedText = this.duplicateTextElementWithSuffix(textToDuplicate);
    
    step.textElements.splice(textIndex + 1, 0, duplicatedText);
    this.renderSteps();
    this.updatePrompt();
    this.scheduleAutoSave();
  }

  removeTextElement(stepIndex, textIndex) {
    if (confirm("¿Eliminar este texto?")) {
      const step = state.flows[state.currentFlow].steps[stepIndex];
      step.textElements.splice(textIndex, 1);
      this.renderSteps();
      this.updatePrompt();
      this.scheduleAutoSave();
    }
  }

  moveTextElement(stepIndex, textIndex, direction) {
    const step = state.flows[state.currentFlow].steps[stepIndex];
    if (!step.textElements) return;
    
    const newIndex = textIndex + direction;
    
    if (newIndex >= 0 && newIndex < step.textElements.length) {
      [step.textElements[textIndex], step.textElements[newIndex]] = [step.textElements[newIndex], step.textElements[textIndex]];
      this.renderSteps();
      this.updatePrompt();
      this.scheduleAutoSave();
    }
  }

  updateTextElement(stepIndex, textIndex, value) {
    const step = state.flows[state.currentFlow].steps[stepIndex];
    if (!step.textElements) step.textElements = [];
    if (!step.textElements[textIndex]) step.textElements[textIndex] = {};
    
    step.textElements[textIndex].text = value;
    TimingUtils.debounce('textElementUpdate', () => {
      this.updatePrompt();
      this.scheduleAutoSave();
    }, 300);
  }

  // ==========================================
  // REORDENAMIENTO MIXTO MEJORADO (FUNCIONES Y TEXTOS)
  // ==========================================

  getAllElements(stepIndex) {
    const step = state.flows[state.currentFlow].steps[stepIndex];
    const elements = [];
    
    // Agregar funciones con información de posición
    if (step.functions) {
      step.functions.forEach((func, index) => {
        elements.push({
          type: 'function',
          originalIndex: index,
          data: func,
          sortKey: `function_${index}`
        });
      });
    }
    
    // Agregar elementos de texto con información de posición
    if (step.textElements) {
      step.textElements.forEach((textEl, index) => {
        elements.push({
          type: 'text',
          originalIndex: index,
          data: textEl,
          sortKey: `text_${index}`
        });
      });
    }
    
    return elements;
  }

  getAllElementsOrdered(stepIndex) {
    return this.getAllElements(stepIndex);
  }

  moveElementInStepGlobally(stepIndex, elementType, elementIndex, direction) {
    const step = state.flows[state.currentFlow].steps[stepIndex];
    
    // Crear lista unificada de elementos con sus posiciones
    const allElements = [];
    
    // Agregar funciones
    if (step.functions) {
      step.functions.forEach((func, index) => {
        allElements.push({
          type: 'function',
          index: index,
          data: func
        });
      });
    }
    
    // Agregar textos
    if (step.textElements) {
      step.textElements.forEach((textEl, index) => {
        allElements.push({
          type: 'text',
          index: index,
          data: textEl
        });
      });
    }
    
    // Encontrar el elemento actual en la lista unificada
    let globalIndex = -1;
    let functionsBeforeTarget = 0;
    let textsBeforeTarget = 0;
    
    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];
      
      if (element.type === elementType && element.index === elementIndex) {
        globalIndex = i;
        break;
      }
      
      if (element.type === 'function') {
        functionsBeforeTarget++;
      } else {
        textsBeforeTarget++;
      }
    }
    
    if (globalIndex === -1) return; // No encontrado
    
    const newGlobalIndex = globalIndex + direction;
    
    // Verificar límites
    if (newGlobalIndex < 0 || newGlobalIndex >= allElements.length) return;
    
    // Intercambiar elementos en la lista global
    [allElements[globalIndex], allElements[newGlobalIndex]] = [allElements[newGlobalIndex], allElements[globalIndex]];
    
    // Reconstruir arrays separados
    const newFunctions = [];
    const newTextElements = [];
    
    allElements.forEach(element => {
      if (element.type === 'function') {
        newFunctions.push(element.data);
      } else {
        newTextElements.push(element.data);
      }
    });
    
    // Actualizar el estado
    step.functions = newFunctions;
    step.textElements = newTextElements;
    
    this.renderSteps();
    this.updatePrompt();
    this.scheduleAutoSave();
  }

  moveElementInStep(elementType, stepIndex, elementIndex, direction) {
    // Usar el nuevo sistema de reordenamiento global
    this.moveElementInStepGlobally(stepIndex, elementType, elementIndex, direction);
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
    
    // Asegurar que step.textElements existe
    if (!step.textElements) step.textElements = [];
    
    const allElements = this.getAllElements(index);
    const elementCount = step.functions.length + step.textElements.length;
    
    return `
      <div class="step">
        <div class="step-header">
          <span class="step-number">Paso ${index + 1}</span>
          ${stepControls}
        </div>
        
        <div class="form-group">
          <label>Mensaje principal del paso:</label>
          <textarea class="autoresize max-height" 
                    placeholder="Descripción de lo que debe hacer el asistente en este paso..." 
                    oninput="flowManager.updateStepText(${index}, this.value)">${TextUtils.escapeForInputValue(step.text)}</textarea>
        </div>
        
        <div style="margin-top: 16px;">
          <label class="step-elements-count">
            📋 Elementos del paso<span class="count-number">${elementCount}</span>:
          </label>
          
          <div id="step-elements-${index}" style="margin-bottom: 12px;">
            ${this.renderStepElements(index, step)}
          </div>
          
          <div class="step-add-elements">
            <button type="button" class="btn-small btn-add-function" onclick="stepFunctionManager.addFunction(${index})">
              <span>⚡</span>
              <span>Agregar Función</span>
            </button>
            <button type="button" class="btn-small btn-add-text" onclick="flowManager.addTextElement(${index})">
              <span>📝</span>
              <span>Agregar Texto</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderStepElements(stepIndex, step) {
    let elementsHTML = '';
    
    // Asegurar que los arrays existen
    if (!step.functions) step.functions = [];
    if (!step.textElements) step.textElements = [];
    if (!step.elementOrder) {
      // Migrar paso existente sin orden
      step.elementOrder = [];
      
      // Agregar funciones existentes al orden
      step.functions.forEach((func, index) => {
        step.elementOrder.push({
          type: 'function',
          index: index
        });
      });
      
      // Agregar textos existentes al orden  
      step.textElements.forEach((textEl, index) => {
        step.elementOrder.push({
          type: 'text',
          index: index
        });
      });
    }
    
    // Si no hay elementos, mostrar mensaje vacío
    if (step.elementOrder.length === 0) {
      elementsHTML = `
        <div class="step-elements-empty">
          <div class="step-elements-empty-icon">📋</div>
          No hay elementos en este paso. Agrega funciones o textos usando los botones de abajo.
        </div>
      `;
      return elementsHTML;
    }
    
    // Renderizar elementos según el orden definido
    step.elementOrder.forEach((orderItem, globalIndex) => {
      if (orderItem.type === 'function' && step.functions[orderItem.index]) {
        elementsHTML += this.renderStepFunctionWithGlobalIndex(
          stepIndex, 
          orderItem.index, 
          globalIndex, 
          step.functions[orderItem.index], 
          step.elementOrder.length
        );
      } else if (orderItem.type === 'text' && step.textElements[orderItem.index]) {
        elementsHTML += this.renderTextElementWithGlobalIndex(
          stepIndex, 
          orderItem.index, 
          globalIndex, 
          step.textElements[orderItem.index], 
          step.elementOrder.length
        );
      }
    });
    
    return elementsHTML;
  }

  renderStepFunctionWithGlobalIndex(stepIndex, funcIndex, globalIndex, func, totalElements) {
    // Verificar que functions esté disponible
    if (!window.functions || !window.functions.getAll) {
      return `
        <div class="step-element-container step-element-function">
          <div class="step-element-header">
            <span class="step-element-icon">⚡</span>
            <span class="step-element-title">Cargando funciones...</span>
          </div>
        </div>
      `;
    }

    const availableFunctions = window.functions.getAll();
    
    if (Object.keys(availableFunctions).length === 0) {
      return `
        <div class="step-element-container step-element-function">
          <div class="step-element-header">
            <span class="step-element-icon">⚡</span>
            <span class="step-element-title">No hay funciones disponibles</span>
          </div>
          <div class="step-element-content">
            <em>Ve a la pestaña "Funciones" para crear algunas.</em>
          </div>
        </div>
      `;
    }
    
    const funcDef = availableFunctions[func.type];
    
    if (!funcDef) {
      return `
        <div class="step-element-container step-element-function" style="border-left-color: var(--danger);">
          <div class="step-element-header">
            <span class="step-element-icon">⚠️</span>
            <span class="step-element-title">Función no encontrada: ${func.type}</span>
            <div class="step-element-controls">
              <button class="step-btn btn-danger" onclick="stepFunctionManager.removeFunction(${stepIndex}, ${funcIndex})" title="Eliminar función">×</button>
            </div>
          </div>
        </div>
      `;
    }
    
    const functionControls = this.renderGlobalElementControls('function', stepIndex, funcIndex, globalIndex, totalElements);
    
    return `
      <div class="step-element-container step-element-function">
        <div class="step-element-header">
          <span class="step-element-icon">⚡</span>
          <span class="step-element-title">${funcDef.name}</span>
          ${functionControls}
        </div>
        
        <div class="step-element-content">
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
      </div>
    `;
  }

  renderTextElementWithGlobalIndex(stepIndex, textIndex, globalIndex, textEl, totalElements) {
    const textControls = this.renderGlobalElementControls('text', stepIndex, textIndex, globalIndex, totalElements);
    
    return `
      <div class="step-element-container step-element-text">
        <div class="step-element-header">
          <span class="step-element-icon">📝</span>
          <span class="step-element-title">Texto adicional</span>
          ${textControls}
        </div>
        
        <div class="step-element-content">
          <div class="form-group">
            <label>Texto:</label>
            <textarea class="step-text-input autoresize max-height" 
                      placeholder="Texto adicional para este paso..." 
                      oninput="flowManager.updateTextElement(${stepIndex}, ${textIndex}, this.value)">${TextUtils.escapeForInputValue(textEl.text || '')}</textarea>
          </div>
        </div>
      </div>
    `;
  }

  renderGlobalElementControls(elementType, stepIndex, elementIndex, globalIndex, totalElements) {
    return `
      <div class="step-element-controls">
        <button class="step-btn" onclick="flowManager.duplicateElementInStep('${elementType}', ${stepIndex}, ${elementIndex})" title="Duplicar ${elementType === 'function' ? 'función' : 'texto'}">📄</button>
        ${globalIndex > 0 ? `<button class="step-btn" onclick="flowManager.moveElementByGlobalIndex(${stepIndex}, ${globalIndex}, -1)" title="Subir ${elementType === 'function' ? 'función' : 'texto'}">↑</button>` : ''}
        ${globalIndex < totalElements - 1 ? `<button class="step-btn" onclick="flowManager.moveElementByGlobalIndex(${stepIndex}, ${globalIndex}, 1)" title="Bajar ${elementType === 'function' ? 'función' : 'texto'}">↓</button>` : ''}
        <button class="step-btn btn-danger" onclick="flowManager.removeElementFromStep('${elementType}', ${stepIndex}, ${elementIndex})" title="Eliminar ${elementType === 'function' ? 'función' : 'texto'}">×</button>
      </div>
    `;
  }

  moveElementByGlobalIndex(stepIndex, globalIndex, direction) {
    const step = state.flows[state.currentFlow].steps[stepIndex];
    
    // Asegurar que elementOrder existe
    if (!step.elementOrder) {
      console.warn('elementOrder no existe, recreando...');
      return;
    }
    
    const newGlobalIndex = globalIndex + direction;
    
    // Verificar límites
    if (newGlobalIndex < 0 || newGlobalIndex >= step.elementOrder.length) return;
    
    // Intercambiar elementos en el orden
    [step.elementOrder[globalIndex], step.elementOrder[newGlobalIndex]] = 
    [step.elementOrder[newGlobalIndex], step.elementOrder[globalIndex]];
    
    // Re-renderizar y actualizar
    this.renderSteps();
    this.updatePrompt();
    this.scheduleAutoSave();
  }

  renderStepFunction(stepIndex, funcIndex, func, totalFunctions, totalTexts) {
    // Verificar que functions esté disponible
    if (!window.functions || !window.functions.getAll) {
      return `
        <div class="step-element-container step-element-function">
          <div class="step-element-header">
            <span class="step-element-icon">⚡</span>
            <span class="step-element-title">Cargando funciones...</span>
          </div>
        </div>
      `;
    }

    const availableFunctions = window.functions.getAll();
    
    if (Object.keys(availableFunctions).length === 0) {
      return `
        <div class="step-element-container step-element-function">
          <div class="step-element-header">
            <span class="step-element-icon">⚡</span>
            <span class="step-element-title">No hay funciones disponibles</span>
          </div>
          <div class="step-element-content">
            <em>Ve a la pestaña "Funciones" para crear algunas.</em>
          </div>
        </div>
      `;
    }
    
    const funcDef = availableFunctions[func.type];
    
    if (!funcDef) {
      return `
        <div class="step-element-container step-element-function" style="border-left-color: var(--danger);">
          <div class="step-element-header">
            <span class="step-element-icon">⚠️</span>
            <span class="step-element-title">Función no encontrada: ${func.type}</span>
            <div class="step-element-controls">
              <button class="step-btn btn-danger" onclick="stepFunctionManager.removeFunction(${stepIndex}, ${funcIndex})" title="Eliminar función">×</button>
            </div>
          </div>
        </div>
      `;
    }
    
    const functionControls = this.renderElementControls('function', stepIndex, funcIndex, totalFunctions, totalTexts);
    
    return `
      <div class="step-element-container step-element-function">
        <div class="step-element-header">
          <span class="step-element-icon">⚡</span>
          <span class="step-element-title">${funcDef.name}</span>
          ${functionControls}
        </div>
        
        <div class="step-element-content">
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
      </div>
    `;
  }

  renderTextElement(stepIndex, textIndex, textEl, totalTexts, totalFunctions) {
    const textControls = this.renderElementControls('text', stepIndex, textIndex, totalTexts, totalFunctions);
    
    return `
      <div class="step-element-container step-element-text">
        <div class="step-element-header">
          <span class="step-element-icon">📝</span>
          <span class="step-element-title">Texto adicional</span>
          ${textControls}
        </div>
        
        <div class="step-element-content">
          <div class="form-group">
            <label>Texto:</label>
            <textarea class="step-text-input autoresize max-height" 
                      placeholder="Texto adicional para este paso..." 
                      oninput="flowManager.updateTextElement(${stepIndex}, ${textIndex}, this.value)">${TextUtils.escapeForInputValue(textEl.text || '')}</textarea>
          </div>
        </div>
      </div>
    `;
  }

  renderElementControls(elementType, stepIndex, elementIndex, totalOfType, totalOfOtherType) {
    const totalElements = totalOfType + totalOfOtherType;
    
    return `
      <div class="step-element-controls">
        <button class="step-btn" onclick="flowManager.duplicateElementInStep('${elementType}', ${stepIndex}, ${elementIndex})" title="Duplicar ${elementType === 'function' ? 'función' : 'texto'}">📄</button>
        <button class="step-btn" onclick="flowManager.moveElementInStep('${elementType}', ${stepIndex}, ${elementIndex}, -1)" title="Subir ${elementType === 'function' ? 'función' : 'texto'}">↑</button>
        <button class="step-btn" onclick="flowManager.moveElementInStep('${elementType}', ${stepIndex}, ${elementIndex}, 1)" title="Bajar ${elementType === 'function' ? 'función' : 'texto'}">↓</button>
        <button class="step-btn btn-danger" onclick="flowManager.removeElementFromStep('${elementType}', ${stepIndex}, ${elementIndex})" title="Eliminar ${elementType === 'function' ? 'función' : 'texto'}">×</button>
      </div>
    `;
  }

  duplicateElementInStep(elementType, stepIndex, elementIndex) {
    if (elementType === 'function') {
      stepFunctionManager.duplicateFunction(stepIndex, elementIndex);
    } else if (elementType === 'text') {
      this.duplicateTextElement(stepIndex, elementIndex);
    }
  }

  removeElementFromStep(elementType, stepIndex, elementIndex) {
    if (elementType === 'function') {
      stepFunctionManager.removeFunction(stepIndex, elementIndex);
    } else if (elementType === 'text') {
      this.removeTextElement(stepIndex, elementIndex);
    }
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
                          oninput="stepFunctionManager.updateFunctionParam(${stepIndex}, ${funcIndex}, '${param.name}', this.value)">${TextUtils.escapeForInputValue(value)}</textarea>
              </div>
            `;
          } else {
            return `
              <div class="form-group">
                <label>${param.label}${required}:</label>
                <input type="text" value="${TextUtils.escapeForAttribute(value)}" 
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
                <input type="text" value="${TextUtils.escapeForAttribute(field.name || '')}" 
                       placeholder="Ej: nombre_formulario, whatsapp, mensaje..."
                       oninput="stepFunctionManager.updateCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex}, 'name', this.value)">
              </div>
              
              <div class="form-group">
                <label>Valor:</label>
                <textarea class="autoresize max-height" 
                          placeholder="Valor del campo..." 
                          oninput="stepFunctionManager.updateCustomField(${stepIndex}, ${funcIndex}, ${fieldIndex}, 'value', this.value)">${TextUtils.escapeForInputValue(field.value || '')}</textarea>
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
      
      if (step.textElements && step.textElements.length > 0) {
        step.textElements.forEach(textEl => {
          if (textEl.text && textEl.text.trim()) {
            textEl.text = textEl.text + " - Copia";
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
    
    if (duplicated.textElements && duplicated.textElements.length > 0) {
      duplicated.textElements.forEach(textEl => {
        if (textEl.text && textEl.text.trim()) {
          textEl.text = textEl.text + " - Copia";
        }
      });
    }
    
    return duplicated;
  }

  duplicateTextElementWithSuffix(textEl) {
    const duplicated = JSON.parse(JSON.stringify(textEl));
    
    if (duplicated.text && duplicated.text.trim()) {
      duplicated.text = duplicated.text + " - Copia";
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
window.addTextElement = (stepIndex) => flowManager.addTextElement(stepIndex);
window.duplicateTextElement = (stepIndex, textIndex) => flowManager.duplicateTextElement(stepIndex, textIndex);
window.removeTextElement = (stepIndex, textIndex) => flowManager.removeTextElement(stepIndex, textIndex);
window.moveTextElement = (stepIndex, textIndex, direction) => flowManager.moveTextElement(stepIndex, textIndex, direction);
window.updateTextElement = (stepIndex, textIndex, value) => flowManager.updateTextElement(stepIndex, textIndex, value);
window.duplicateElementInStep = (elementType, stepIndex, elementIndex) => flowManager.duplicateElementInStep(elementType, stepIndex, elementIndex);
window.removeElementFromStep = (elementType, stepIndex, elementIndex) => flowManager.removeElementFromStep(elementType, stepIndex, elementIndex);
window.moveElementInStep = (elementType, stepIndex, elementIndex, direction) => flowManager.moveElementInStep(elementType, stepIndex, elementIndex, direction);
window.scrollToStepInOutput = (stepIndex) => flowManager.scrollToStepInOutput(stepIndex);
window.scrollToFlowInOutput = () => flowManager.scrollToFlowInOutput();
window.renderFlows = () => flowManager.renderFlows();
window.renderSteps = () => flowManager.renderSteps();
window.renderStepFunctions = (stepIndex, stepFunctions) => flowManager.renderStepFunctions(stepIndex, stepFunctions);
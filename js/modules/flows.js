function renderFlowControls() {
  const container = document.getElementById('flow-controls');
  if (!container) return;
  
  let controlsHTML = `
    <button type="button" class="btn-small" onclick="addFlow()">➕ Nuevo Flujo</button>
    <button type="button" class="btn-small" onclick="duplicateFlow()">📄 Duplicar</button>
    <button type="button" class="btn-small btn-danger" onclick="deleteFlow()">🗑️ Eliminar</button>
  `;
  
  // Agregar botones de reorganización si hay más de un flujo
  if (state.flows.length > 1) {
    if (state.currentFlow > 0) {
      controlsHTML += `<button type="button" class="btn-small" onclick="moveFlow(-1)">⬆️ Subir</button>`;
    }
    if (state.currentFlow < state.flows.length - 1) {
      controlsHTML += `<button type="button" class="btn-small" onclick="moveFlow(1)">⬇️ Bajar</button>`;
    }
  }
  
  container.innerHTML = controlsHTML;
}

function moveFlow(direction) {
  const flows = state.flows;
  const currentIndex = state.currentFlow;
  const newIndex = currentIndex + direction;
  
  if (newIndex >= 0 && newIndex < flows.length) {
    // Intercambiar flujos
    [flows[currentIndex], flows[newIndex]] = [flows[newIndex], flows[currentIndex]];
    
    // Actualizar índice actual
    state.currentFlow = newIndex;
    
    // Re-renderizar
    renderFlows();
    renderSteps();
    updatePrompt();
    scheduleAutoSave();
  }
}

// ==========================================
// FUNCIÓN DE SCROLL PRECISO A PASO ESPECÍFICO
// ==========================================
function scrollToStepInOutput(stepIndex) {
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
  
  // Buscar el texto específico del paso en el output
  const outputContent = outputElement.innerHTML;
  const stepText = step.text.trim();
  
  // Buscar el patrón del paso específico (número de paso + texto)
  const escapedStepText = escapeRegex(stepText);
  const stepPattern = new RegExp(`<span class="output-step-number">${stepIndex + 1}\\.</span>\\s*${escapedStepText}`, 'i');
  const match = stepPattern.exec(outputContent);
  
  if (match) {
    // Crear un elemento temporal para medir la posición
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = outputContent.substring(0, match.index);
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.fontFamily = outputElement.style.fontFamily || "'Consolas', 'Monaco', 'Courier New', monospace";
    tempDiv.style.fontSize = outputElement.style.fontSize || '14px';
    tempDiv.style.lineHeight = outputElement.style.lineHeight || '1.6';
    tempDiv.style.width = outputElement.offsetWidth + 'px';
    
    document.body.appendChild(tempDiv);
    
    // Calcular la altura hasta el paso específico
    const targetHeight = tempDiv.offsetHeight;
    
    // Limpiar elemento temporal
    document.body.removeChild(tempDiv);
    
    // Hacer scroll al panel - paso al inicio
    outputPanel.scrollTo({
      top: Math.max(0, targetHeight), // Sin margen - paso al inicio del panel
      behavior: 'smooth'
    });
    
    // Mostrar feedback visual específico
    const stepDescription = `Paso ${stepIndex + 1}: "${stepText.substring(0, 40)}${stepText.length > 40 ? '...' : ''}"`;
    showStepScrollFeedback(stepDescription, true);
  } else {
    // Si no se encuentra el paso específico, ir al flujo completo
    scrollToFlowInOutput();
    const stepDescription = `Paso ${stepIndex + 1}: "${stepText.substring(0, 40)}${stepText.length > 40 ? '...' : ''}"`;
    showStepScrollFeedback(stepDescription, false);
  }
}
// ==========================================
// FUNCIÓN DE SCROLL A FLUJO COMPLETO (FALLBACK)
// ==========================================
function scrollToFlowInOutput() {
  const currentFlowName = state.flows[state.currentFlow].name;
  const outputPanel = document.querySelector('.panel.output');
  const outputElement = document.getElementById('output');
  
  if (!outputPanel || !outputElement) {
    console.warn('No se encontró el panel de salida');
    return;
  }
  
  // Buscar el texto del flujo en el output
  const outputContent = outputElement.innerHTML;
  
  // Patrón para encontrar el flujo (considerando flujo único o múltiple)
  const flowPatterns = [
    new RegExp(`<span class="output-section">${escapeRegex(currentFlowName)}:</span>`, 'i'),
    new RegExp(`<span class="output-section">Flujo principal:</span>`, 'i') // Para flujo único
  ];
  
  let match = null;
  for (const pattern of flowPatterns) {
    match = pattern.exec(outputContent);
    if (match) break;
  }
  
  if (match) {
    // Crear un elemento temporal para medir la posición
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = outputContent.substring(0, match.index);
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.fontFamily = outputElement.style.fontFamily || "'Consolas', 'Monaco', 'Courier New', monospace";
    tempDiv.style.fontSize = outputElement.style.fontSize || '14px';
    tempDiv.style.lineHeight = outputElement.style.lineHeight || '1.6';
    tempDiv.style.width = outputElement.offsetWidth + 'px';
    
    document.body.appendChild(tempDiv);
    
    // Calcular la altura hasta el flujo
    const targetHeight = tempDiv.offsetHeight;
    
    // Limpiar elemento temporal
    document.body.removeChild(tempDiv);
    
    // Hacer scroll al panel - flujo al inicio
    outputPanel.scrollTo({
      top: Math.max(0, targetHeight), // Sin margen - flujo al inicio del panel
      behavior: 'smooth'
    });
    
    // Mostrar feedback visual
    showScrollFeedback(currentFlowName, true, 'flow');
  } else {
    // Si no se encuentra el flujo, hacer scroll al inicio
    outputPanel.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    showScrollFeedback(currentFlowName, false, 'flow');
  }
}

// Función auxiliar para escapar caracteres especiales en regex
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Mostrar feedback visual específico para pasos
function showStepScrollFeedback(stepDescription, found = true) {
  const outputPanel = document.querySelector('.panel.output');
  if (!outputPanel) return;
  
  // Calcular la posición del panel
  const panelRect = outputPanel.getBoundingClientRect();
  
  // Posicionar la notificación DENTRO del panel derecho, en el borde izquierdo
  const textPosition = panelRect.top + 30; // 30px desde el top del panel visible
  const leftPosition = panelRect.left + 20; // 20px DENTRO del panel derecho
  
  // Crear elemento de feedback
  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed;
    top: ${textPosition}px;
    left: ${leftPosition}px;
    background: ${found ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)'};
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    opacity: 0;
    transition: all 0.3s ease;
    max-width: 240px;
    text-align: left;
    line-height: 1.2;
    transform: translateY(-10px);
  `;
  
  // Sin flecha, ya que está dentro del panel
  feedback.innerHTML = `
    ${found ? '🔄 <strong>Aquí:</strong>' : '🔍 <strong>No visible:</strong>'}<br><span style="font-size: 10px;">${stepDescription}</span>
  `;
  
  document.body.appendChild(feedback);
  
  // Animar entrada
  setTimeout(() => {
    feedback.style.opacity = '1';
    feedback.style.transform = 'translateY(0)';
  }, 10);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    feedback.style.opacity = '0';
    feedback.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 300);
  }, 3000);
}

// ==========================================
// GESTIÓN DE FLUJOS
// ==========================================
function addFlow() {
  const name = prompt("Nombre del nuevo flujo:", `Flujo ${state.flows.length + 1}`);
  if (name && name.trim()) {
    state.flows.push({ 
      name: name.trim(), 
      steps: [{ text: '', functions: [] }] 
    });
    state.currentFlow = state.flows.length - 1;
    renderFlows();
    renderSteps();
    updatePrompt();
    scheduleAutoSave();
  }
}

// Función para duplicar flujo completo (NUEVA)
function duplicateFlow() {
  const currentFlow = state.flows[state.currentFlow];
  const newName = prompt("Nombre para el flujo duplicado:", `${currentFlow.name} - Copia`);
  
  if (newName && newName.trim()) {
    // Crear una copia profunda del flujo actual con sufijos "- Copia"
    const duplicatedFlow = duplicateFlowWithSuffix(currentFlow, newName.trim());
    
    // Insertar el flujo duplicado después del actual
    state.flows.splice(state.currentFlow + 1, 0, duplicatedFlow);
    state.currentFlow = state.currentFlow + 1;
    
    renderFlows();
    renderSteps();
    updatePrompt();
    scheduleAutoSave();
  }
}

// Función auxiliar para duplicar flujo con sufijos "- Copia" recursivamente
function duplicateFlowWithSuffix(flow, newName) {
  // Crear copia profunda del flujo
  const duplicatedFlow = JSON.parse(JSON.stringify(flow));
  duplicatedFlow.name = newName;
  
  // Agregar "- Copia" a cada paso
  duplicatedFlow.steps.forEach(step => {
    // Agregar sufijo al texto del paso si no está vacío
    if (step.text && step.text.trim()) {
      step.text = step.text + " - Copia";
    }
    
    // Procesar funciones del paso
    if (step.functions && step.functions.length > 0) {
      step.functions.forEach(func => {
        // Agregar "- Copia" a parámetros de texto
        if (func.params) {
          Object.keys(func.params).forEach(paramKey => {
            if (typeof func.params[paramKey] === 'string' && func.params[paramKey].trim()) {
              func.params[paramKey] = func.params[paramKey] + " - Copia";
            }
          });
        }
        
        // Agregar "- Copia" a campos personalizados
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
  
  return duplicatedFlow;
}

function deleteFlow() {
  if (state.flows.length <= 1) {
    alert("Debe haber al menos un flujo");
    return;
  }
  
  if (confirm(`¿Eliminar el flujo "${state.flows[state.currentFlow].name}"?`)) {
    state.flows.splice(state.currentFlow, 1);
    state.currentFlow = Math.max(0, state.currentFlow - 1);
    renderFlows();
    renderSteps();
    updatePrompt();
    scheduleAutoSave();
  }
}

function changeFlow() {
  state.currentFlow = parseInt(document.getElementById('flow-selector').value);
  renderSteps();
  renderFlowControls(); // Actualizar botones de reorganización
  document.getElementById('flow-name').value = state.flows[state.currentFlow].name;
}

function renameFlow() {
  const newName = document.getElementById('flow-name').value.trim();
  if (newName) {
    state.flows[state.currentFlow].name = newName;
    renderFlows();
    updatePrompt();
    scheduleAutoSave();
  }
}

function renderFlows() {
  const selector = document.getElementById('flow-selector');
  selector.innerHTML = state.flows.map((flow, index) => 
    `<option value="${index}" ${index === state.currentFlow ? 'selected' : ''}>${escapeHtml(flow.name)}</option>`
  ).join('');
  
  if (document.getElementById('flow-name')) {
    document.getElementById('flow-name').value = state.flows[state.currentFlow].name;
  }
  
  // Renderizar controles de reorganización
  renderFlowControls();
}

// ==========================================
// GESTIÓN DE PASOS
// ==========================================
function addStep() {
  state.flows[state.currentFlow].steps.push({ text: '', functions: [] });
  renderSteps();
  updatePrompt();
  scheduleAutoSave();
}

function duplicateStep(index) {
  const stepToDuplicate = state.flows[state.currentFlow].steps[index];
  // Crear una copia profunda del paso con sufijos "- Copia"
  const duplicatedStep = duplicateStepWithSuffix(stepToDuplicate);
  
  // Insertar el paso duplicado después del actual
  state.flows[state.currentFlow].steps.splice(index + 1, 0, duplicatedStep);
  
  renderSteps();
  updatePrompt();
  scheduleAutoSave();
}

// Función auxiliar para duplicar paso con sufijos "- Copia" recursivamente
function duplicateStepWithSuffix(step) {
  // Crear copia profunda del paso
  const duplicatedStep = JSON.parse(JSON.stringify(step));
  
  // Agregar "- Copia" al texto del paso si no está vacío
  if (duplicatedStep.text && duplicatedStep.text.trim()) {
    duplicatedStep.text = duplicatedStep.text + " - Copia";
  }
  
  // Procesar funciones del paso
  if (duplicatedStep.functions && duplicatedStep.functions.length > 0) {
    duplicatedStep.functions.forEach(func => {
      // Agregar "- Copia" a parámetros de texto
      if (func.params) {
        Object.keys(func.params).forEach(paramKey => {
          if (typeof func.params[paramKey] === 'string' && func.params[paramKey].trim()) {
            func.params[paramKey] = func.params[paramKey] + " - Copia";
          }
        });
      }
      
      // Agregar "- Copia" a campos personalizados
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
  
  return duplicatedStep;
}

function removeStep(index) {
  if (confirm("¿Eliminar este paso?")) {
    state.flows[state.currentFlow].steps.splice(index, 1);
    renderSteps();
    updatePrompt();
    scheduleAutoSave();
  }
}

function moveStep(index, direction) {
  const steps = state.flows[state.currentFlow].steps;
  const newIndex = index + direction;
  
  if (newIndex >= 0 && newIndex < steps.length) {
    [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
    renderSteps();
    updatePrompt();
    scheduleAutoSave();
  }
}

function updateStepText(index, value) {
  state.flows[state.currentFlow].steps[index].text = value;
  // Usar debounce para evitar llamadas excesivas
  clearTimeout(window.stepTextTimeout);
  window.stepTextTimeout = setTimeout(() => {
    updatePrompt();
    scheduleAutoSave();
  }, 300);
}

function renderSteps() {
  const container = document.getElementById('steps-container');
  const currentFlow = state.flows[state.currentFlow];
  
  container.innerHTML = currentFlow.steps.map((step, index) => `
    <div class="step">
      <div class="step-header">
        <span class="step-number">Paso ${index + 1}</span>
        <div class="step-controls">
          <button class="step-btn" onclick="duplicateStep(${index})" title="Duplicar">📄</button>
          ${index > 0 ? `<button class="step-btn" onclick="moveStep(${index}, -1)" title="Subir">↑</button>` : ''}
          ${index < currentFlow.steps.length - 1 ? `<button class="step-btn" onclick="moveStep(${index}, 1)" title="Bajar">↓</button>` : ''}
          <button class="step-btn" onclick="scrollToStepInOutput(${index})" title="Ir a este paso específico en el resultado" style="background: #059669; color: white;">📍</button>
          <button class="step-btn btn-danger" onclick="removeStep(${index})" title="Eliminar">×</button>
        </div>
      </div>
      
      <div class="form-group">
        <label>Mensaje del paso:</label>
        <textarea placeholder="Descripción de lo que debe hacer el asistente en este paso..." 
                  oninput="updateStepText(${index}, this.value)">${escapeHtml(step.text)}</textarea>
      </div>
      
      ${renderStepFunctions(index, step.functions)}
    </div>
  `).join('');
}
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
          ${index > 0 ? `<button class="step-btn" onclick="moveStep(${index}, -1)" title="Subir">↑</button>` : ''}
          ${index < currentFlow.steps.length - 1 ? `<button class="step-btn" onclick="moveStep(${index}, 1)" title="Bajar">↓</button>` : ''}
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
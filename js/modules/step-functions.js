// ==========================================
// GESTIÓN DE FUNCIONES EN PASOS OPTIMIZADA CON ELEMENT ORDER
// ==========================================

class StepFunctionManager {
  // ==========================================
  // OPERACIONES PRINCIPALES
  // ==========================================

  addFunction(stepIndex) {
    const availableFunctions = functions.getAll();
    const firstFunc = Object.keys(availableFunctions)[0];
    
    if (!firstFunc) {
      alert('No hay funciones disponibles. Ve a la pestaña "Funciones" para crear algunas.');
      return;
    }
    
    const step = state.flows[state.currentFlow].steps[stepIndex];
    if (!step.elementOrder) step.elementOrder = [];
    
    const newFunctionIndex = step.functions.length;
    step.functions.push({
      type: firstFunc,
      customFields: []
    });
    
    // Agregar al orden global
    step.elementOrder.push({
      type: 'function',
      index: newFunctionIndex
    });
    
    this.updateUI();
  }

  duplicateFunction(stepIndex, funcIndex) {
    const functionToDuplicate = state.flows[state.currentFlow].steps[stepIndex].functions[funcIndex];
    const duplicatedFunction = this.duplicateFunctionWithSuffix(functionToDuplicate);
    
    const step = state.flows[state.currentFlow].steps[stepIndex];
    if (!step.elementOrder) step.elementOrder = [];
    
    const newFunctionIndex = step.functions.length;
    step.functions.push(duplicatedFunction);
    
    // Encontrar la posición en elementOrder de la función original
    const originalOrderIndex = step.elementOrder.findIndex(
      item => item.type === 'function' && item.index === funcIndex
    );
    
    // Insertar la duplicada justo después de la original
    const insertPosition = originalOrderIndex + 1;
    step.elementOrder.splice(insertPosition, 0, {
      type: 'function',
      index: newFunctionIndex
    });
    
    this.updateUI();
  }

  removeFunction(stepIndex, funcIndex) {
    if (confirm('¿Eliminar esta función?')) {
      const step = state.flows[state.currentFlow].steps[stepIndex];
      
      // Remover de functions
      step.functions.splice(funcIndex, 1);
      
      // Remover de elementOrder y actualizar índices
      step.elementOrder = step.elementOrder.filter(item => {
        if (item.type === 'function') {
          if (item.index === funcIndex) {
            return false; // Eliminar este item
          } else if (item.index > funcIndex) {
            item.index--; // Decrementar índices superiores
          }
        }
        return true;
      });
      
      this.updateUI();
    }
  }

  changeFunctionType(stepIndex, funcIndex, newType) {
    state.flows[state.currentFlow].steps[stepIndex].functions[funcIndex] = {
      type: newType,
      customFields: []
    };
    this.updateUI();
  }

  // ==========================================
  // REORDENAMIENTO DE FUNCIONES
  // ==========================================

  moveStepFunction(stepIndex, funcIndex, direction) {
    // Esta función ahora es manejada por flowManager.moveElementByGlobalIndex
    // Mantener por compatibilidad pero redirigir
    console.warn('moveStepFunction deprecated, usar moveElementByGlobalIndex');
  }

  // ==========================================
  // GESTIÓN DE PARÁMETROS
  // ==========================================

  updateFunctionParam(stepIndex, funcIndex, paramName, value) {
    const func = state.flows[state.currentFlow].steps[stepIndex].functions[funcIndex];
    if (!func.params) func.params = {};
    func.params[paramName] = value;
    
    TimingUtils.debounce('functionParamUpdate', () => {
      this.updatePrompt();
      this.scheduleAutoSave();
    }, 300);
  }

  // ==========================================
  // GESTIÓN DE CAMPOS PERSONALIZADOS
  // ==========================================

  addCustomField(stepIndex, funcIndex) {
    const func = state.flows[state.currentFlow].steps[stepIndex].functions[funcIndex];
    if (!func.customFields) func.customFields = [];
    
    func.customFields.push({
      name: '',
      value: ''
    });
    
    flowManager.renderSteps();
    this.scheduleAutoSave();
  }

  duplicateCustomField(stepIndex, funcIndex, fieldIndex) {
    const func = state.flows[state.currentFlow].steps[stepIndex].functions[funcIndex];
    if (!func.customFields) return;
    
    const fieldToDuplicate = func.customFields[fieldIndex];
    const duplicatedField = this.duplicateCustomFieldWithSuffix(fieldToDuplicate);
    
    func.customFields.splice(fieldIndex + 1, 0, duplicatedField);
    this.updateUI();
  }

  removeCustomField(stepIndex, funcIndex, fieldIndex) {
    if (confirm('¿Eliminar este campo?')) {
      const func = state.flows[state.currentFlow].steps[stepIndex].functions[funcIndex];
      func.customFields.splice(fieldIndex, 1);
      this.updateUI();
    }
  }

  moveCustomField(stepIndex, funcIndex, fieldIndex, direction) {
    const func = state.flows[state.currentFlow].steps[stepIndex].functions[funcIndex];
    if (!func.customFields) return;
    
    const newIndex = fieldIndex + direction;
    
    if (newIndex >= 0 && newIndex < func.customFields.length) {
      [func.customFields[fieldIndex], func.customFields[newIndex]] = [func.customFields[newIndex], func.customFields[fieldIndex]];
      this.updateUI();
    }
  }

  updateCustomField(stepIndex, funcIndex, fieldIndex, property, value) {
    const func = state.flows[state.currentFlow].steps[stepIndex].functions[funcIndex];
    if (!func.customFields) func.customFields = [];
    if (!func.customFields[fieldIndex]) func.customFields[fieldIndex] = {};
    
    func.customFields[fieldIndex][property] = value;
    
    TimingUtils.debounce('customFieldUpdate', () => {
      this.updatePrompt();
      this.scheduleAutoSave();
    }, 300);
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD PRIVADOS
  // ==========================================

  duplicateFunctionWithSuffix(func) {
    const duplicated = JSON.parse(JSON.stringify(func));
    
    if (duplicated.params) {
      Object.keys(duplicated.params).forEach(paramKey => {
        if (typeof duplicated.params[paramKey] === 'string' && duplicated.params[paramKey].trim()) {
          duplicated.params[paramKey] = duplicated.params[paramKey] + " - Copia";
        }
      });
    }
    
    if (duplicated.customFields && duplicated.customFields.length > 0) {
      duplicated.customFields.forEach(field => {
        if (field.name && field.name.trim()) {
          field.name = field.name + " - Copia";
        }
        if (field.value && field.value.trim()) {
          field.value = field.value + " - Copia";
        }
      });
    }
    
    return duplicated;
  }

  duplicateCustomFieldWithSuffix(field) {
    const duplicated = JSON.parse(JSON.stringify(field));
    
    if (duplicated.name && duplicated.name.trim()) {
      duplicated.name = duplicated.name + " - Copia";
    }
    
    if (duplicated.value && duplicated.value.trim()) {
      duplicated.value = duplicated.value + " - Copia";
    }
    
    return duplicated;
  }

  updateUI() {
    flowManager.renderSteps();
    this.updatePrompt();
    this.scheduleAutoSave();
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
const stepFunctionManager = new StepFunctionManager();

// Exportar globalmente
window.stepFunctionManager = stepFunctionManager;

// Funciones legacy para compatibilidad
window.addFunction = (stepIndex) => stepFunctionManager.addFunction(stepIndex);
window.duplicateFunction = (stepIndex, funcIndex) => stepFunctionManager.duplicateFunction(stepIndex, funcIndex);
window.removeFunction = (stepIndex, funcIndex) => stepFunctionManager.removeFunction(stepIndex, funcIndex);
window.changeFunctionType = (stepIndex, funcIndex, newType) => stepFunctionManager.changeFunctionType(stepIndex, funcIndex, newType);
window.moveStepFunction = (stepIndex, funcIndex, direction) => stepFunctionManager.moveStepFunction(stepIndex, funcIndex, direction);
window.updateFunctionParam = (stepIndex, funcIndex, paramName, value) => stepFunctionManager.updateFunctionParam(stepIndex, funcIndex, paramName, value);
window.addCustomField = (stepIndex, funcIndex) => stepFunctionManager.addCustomField(stepIndex, funcIndex);
window.duplicateCustomField = (stepIndex, funcIndex, fieldIndex) => stepFunctionManager.duplicateCustomField(stepIndex, funcIndex, fieldIndex);
window.removeCustomField = (stepIndex, funcIndex, fieldIndex) => stepFunctionManager.removeCustomField(stepIndex, funcIndex, fieldIndex);
window.moveCustomField = (stepIndex, funcIndex, fieldIndex, direction) => stepFunctionManager.moveCustomField(stepIndex, funcIndex, fieldIndex, direction);
window.updateCustomField = (stepIndex, funcIndex, fieldIndex, property, value) => stepFunctionManager.updateCustomField(stepIndex, funcIndex, fieldIndex, property, value);
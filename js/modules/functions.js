// ==========================================
// GESTIÓN DE FUNCIONES OPTIMIZADA
// ==========================================

class FunctionManager {
  constructor() {
    this.available = {};
    this.storageKey = 'functions';
  }

  // ==========================================
  // MÉTODOS DE INICIALIZACIÓN
  // ==========================================

  init() {
    this.load();
    if (Object.keys(this.available).length === 0) {
      this.loadDefaults();
    }
    this.render();
  }

  loadDefaults() {
    this.available = { ...defaults.defaultFunctions };
    this.save();
    this.render();
  }

  // ==========================================
  // OPERACIONES CRUD
  // ==========================================

  addFunction() {
    const name = prompt('Nombre clave de la función (ej: my_function):');
    if (!name || this.available[name]) {
      alert(this.available[name] ? 'Ya existe una función con ese nombre' : 'Nombre requerido');
      return;
    }

    const label = prompt('Nombre descriptivo:') || name;
    const description = prompt('Descripción de la función:') || '';

    this.available[name] = {
      name: label,
      description: description,
      params: []
    };

    this.save();
    this.render();
    this.editFunction(name);
  }

  editFunction(key) {
    const func = this.available[key];
    if (!func) return;

    const newName = prompt('Nombre descriptivo:', func.name);
    if (newName === null) return;

    const newDescription = prompt('Descripción:', func.description);
    if (newDescription === null) return;

    func.name = newName || func.name;
    func.description = newDescription || func.description;

    this.save();
    this.render();
    this.updatePrompt();
  }

  deleteFunction(key) {
    if (confirm(`¿Eliminar la función "${this.available[key].name}"?`)) {
      delete this.available[key];
      this.save();
      this.render();
      
      this.removeFromSteps(key);
      this.updateUI();
    }
  }

  duplicateFunction(functionKey) {
    const originalFunc = this.available[functionKey];
    if (!originalFunc) return;

    const newKey = this.generateUniqueKey(functionKey);
    const duplicatedFunc = this.duplicateWithSuffix(originalFunc);
    
    this.available[newKey] = duplicatedFunc;
    this.save();
    this.render();
    this.updatePrompt();
  }

  // ==========================================
  // GESTIÓN DE PARÁMETROS
  // ==========================================

  addParam(functionKey) {
    const func = this.available[functionKey];
    if (!func) return;

    const paramName = prompt('Nombre del parámetro (clave):');
    if (!paramName) return;

    const paramLabel = prompt('Etiqueta del parámetro:') || paramName;
    const paramType = prompt('Tipo (text/textarea/select):') || 'text';
    const param = this.createParam(paramName, paramLabel, paramType);

    func.params.push(param);
    this.save();
    this.render();
    this.updatePrompt();
  }

  deleteParam(functionKey, paramIndex) {
    const func = this.available[functionKey];
    if (!func || !confirm('¿Eliminar este parámetro?')) return;

    func.params.splice(paramIndex, 1);
    this.save();
    this.render();
    this.updatePrompt();
  }

  createParam(name, label, type) {
    const param = {
      name: name,
      label: label,
      type: type,
      required: confirm('¿Es requerido?')
    };

    if (type === 'select') {
      const options = prompt('Opciones separadas por coma:');
      if (options) {
        param.options = options.split(',').map(o => o.trim());
      }
    }

    return param;
  }

  // ==========================================
  // REORDENAMIENTO
  // ==========================================

  moveFunction(functionKey, direction) {
    const keys = Object.keys(this.available);
    const currentIndex = keys.indexOf(functionKey);
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < keys.length) {
      const newAvailable = {};
      const newKeys = [...keys];
      
      [newKeys[currentIndex], newKeys[newIndex]] = [newKeys[newIndex], newKeys[currentIndex]];
      
      newKeys.forEach(key => {
        newAvailable[key] = this.available[key];
      });
      
      this.available = newAvailable;
      this.save();
      this.render();
      this.updatePrompt();
    }
  }

  moveParam(functionKey, paramIndex, direction) {
    const func = this.available[functionKey];
    if (!func || !func.params) return;
    
    const newIndex = paramIndex + direction;
    
    if (newIndex >= 0 && newIndex < func.params.length) {
      [func.params[paramIndex], func.params[newIndex]] = [func.params[newIndex], func.params[paramIndex]];
      this.save();
      this.render();
      this.updatePrompt();
    }
  }

  // ==========================================
  // RENDERIZADO
  // ==========================================

  render() {
    const container = document.getElementById('functions-list');
    if (!container) return;

    const functionKeys = Object.keys(this.available);
    container.innerHTML = functionKeys.map((key, index) => 
      this.renderFunction(key, index, functionKeys.length)
    ).join('');
  }

  renderFunction(key, index, total) {
    const func = this.available[key];
    const functionControls = this.renderFunctionControls(key, index, total);
    
    return `
      <div class="function-definition ${this.isUsed(key) ? 'active' : ''}">
        <div class="function-header">
          <div>
            <strong>${func.name}</strong>
            <small style="color: var(--text-secondary); margin-left: 8px;">(${key})</small>
          </div>
          ${functionControls}
        </div>
        
        <div class="function-meta">
          <p style="margin-bottom: 8px; font-size: 13px;">${func.description}</p>
          <div><strong>Parámetros:</strong></div>
          <div class="function-params">
            ${this.renderParams(key, func.params)}
            <button class="btn-small" onclick="functions.addParam('${key}')">➕ Agregar Parámetro</button>
          </div>
        </div>
      </div>
    `;
  }

  renderFunctionControls(key, index, total) {
    return `
      <div style="display: flex; gap: 4px; align-items: center;">
        <button class="btn-small" onclick="functions.duplicateFunction('${key}')" title="Duplicar función">📄</button>
        ${index > 0 ? `<button class="btn-small" onclick="functions.moveFunction('${key}', -1)" title="Subir función">⬆️</button>` : ''}
        ${index < total - 1 ? `<button class="btn-small" onclick="functions.moveFunction('${key}', 1)" title="Bajar función">⬇️</button>` : ''}
        <button class="btn-small" onclick="functions.editFunction('${key}')">✏️ Editar</button>
        <button class="btn-small btn-danger" onclick="functions.deleteFunction('${key}')">🗑️</button>
      </div>
    `;
  }

  renderParams(functionKey, params) {
    return params.map((param, paramIndex) => {
      const paramControls = this.renderParamControls(functionKey, paramIndex, params.length);
      
      return `
        <div class="param-item" style="position: relative; overflow: hidden;">
          ${paramControls}
          <span><strong>${param.label}</strong> (${param.name})</span>
          <span style="margin-left: 8px; color: var(--text-secondary);">
            ${param.type}${param.required ? ' *' : ''}
            ${param.options ? ` [${param.options.join(', ')}]` : ''}
          </span>
        </div>
      `;
    }).join('');
  }

  renderParamControls(functionKey, paramIndex, total) {
    return `
      <div style="float: right; display: flex; gap: 4px; align-items: center; margin: -4px;">
        ${paramIndex > 0 ? `<button class="btn-small" onclick="functions.moveParam('${functionKey}', ${paramIndex}, -1)" title="Subir parámetro" style="padding: 2px 6px; font-size: 11px;">↑</button>` : ''}
        ${paramIndex < total - 1 ? `<button class="btn-small" onclick="functions.moveParam('${functionKey}', ${paramIndex}, 1)" title="Bajar parámetro" style="padding: 2px 6px; font-size: 11px;">↓</button>` : ''}
        <button class="btn-small btn-danger" onclick="functions.deleteParam('${functionKey}', ${paramIndex})" style="padding: 2px 6px; font-size: 11px;">×</button>
      </div>
    `;
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  isUsed(functionKey) {
    return state.flows.some(flow => 
      flow.steps.some(step => 
        step.functions.some(func => func.type === functionKey)
      )
    );
  }

  get(key) {
    return this.available[key];
  }

  getAll() {
    return this.available;
  }

  setAll(functions) {
    this.available = functions;
    this.save();
    this.render();
  }

  validateParams(functionKey, params) {
    const func = this.available[functionKey];
    if (!func) return { valid: false, errors: ['Función no encontrada'] };

    const errors = [];
    func.params.forEach(param => {
      if (param.required && (!params[param.name] || params[param.name].trim() === '')) {
        errors.push(`El parámetro "${param.label}" es requerido`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  // ==========================================
  // PERSISTENCIA
  // ==========================================

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.available));
  }

  load() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.available = JSON.parse(saved);
      } catch (e) {
        console.error('Error loading functions:', e);
        this.available = {};
      }
    } else {
      this.available = {};
    }
  }

  // ==========================================
  // MÉTODOS PRIVADOS
  // ==========================================

  generateUniqueKey(baseKey) {
    let newKey = baseKey + '_copia';
    let counter = 1;
    while (this.available[newKey]) {
      newKey = baseKey + '_copia_' + counter;
      counter++;
    }
    return newKey;
  }

  duplicateWithSuffix(func) {
    const duplicated = JSON.parse(JSON.stringify(func));
    
    if (duplicated.name && duplicated.name.trim()) {
      duplicated.name = duplicated.name + " - Copia";
    }
    
    if (duplicated.description && duplicated.description.trim()) {
      duplicated.description = duplicated.description + " - Copia";
    }
    
    if (duplicated.params && duplicated.params.length > 0) {
      duplicated.params.forEach(param => {
        if (param.label && param.label.trim()) {
          param.label = param.label + " - Copia";
        }
        
        if (param.options && Array.isArray(param.options)) {
          param.options = param.options.map(option => {
            if (typeof option === 'string' && option.trim()) {
              return option + " - Copia";
            }
            return option;
          });
        }
      });
    }
    
    return duplicated;
  }

  removeFromSteps(functionKey) {
    state.flows.forEach(flow => {
      flow.steps.forEach(step => {
        step.functions = step.functions.filter(f => f.type !== functionKey);
      });
    });
  }

  updateUI() {
    if (window.renderSteps) {
      window.renderSteps();
    }
  }

  updatePrompt() {
    if (window.updatePrompt) {
      window.updatePrompt();
    }
  }

  // ==========================================
  // IMPORTACIÓN/EXPORTACIÓN
  // ==========================================

  export() {
    const data = JSON.stringify(this.available, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'functions.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  import() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (confirm('¿Sobrescribir funciones actuales?')) {
            this.available = imported;
          } else {
            Object.assign(this.available, imported);
          }
          this.save();
          this.render();
          this.updatePrompt();
        } catch (error) {
          alert('Error al importar archivo: ' + error.message);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }
}

// Instancia global
const functions = new FunctionManager();

// Exportar globalmente
window.functions = functions;

// Configurar renderizado en RenderUtils
RenderUtils.renderFunctions = () => functions.render();
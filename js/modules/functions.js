// Gestión de funciones para el generador de flujos IA
const functions = {
  // Funciones disponibles
  available: {},
  
  // Inicializar funciones
  init() {
    this.load();
    // Solo cargar defaults si no hay funciones guardadas
    if (Object.keys(this.available).length === 0) {
      this.loadDefaults();
    }
    this.render();
  },

  // Cargar funciones predeterminadas
  loadDefaults() {
    this.available = {
      'formularios': {
        name: 'Formularios',
        description: 'Crea un formulario dinámico con campos personalizables',
        params: [
          { 
            name: 'nombre_formulario', 
            label: 'Nombre del formulario *', 
            type: 'text', 
            required: true 
          }
        ]
      },
      'manage_contact_tags': {
        name: 'Gestionar tags de contacto',
        description: 'Permite agregar o eliminar tags de contactos',
        params: [
          {
            name: 'operation',
            label: 'Operación *',
            type: 'select',
            required: true,
            options: ['ADD', 'DELETE']
          },
          {
            name: 'tagId',
            label: 'ID del Tag *',
            type: 'text',
            required: true
          }
        ]
      },
      'send_ai_match_rule_to_user': {
        name: 'Enviar regla de IA al usuario',
        description: 'Envía una regla de coincidencia específica de IA al usuario',
        params: [
          {
            name: 'match',
            label: 'Regla de coincidencia *',
            type: 'text',
            required: true
          }
        ]
      },
      'send_notification_message': {
        name: 'Enviar notificación',
        description: 'Envía una notificación por WhatsApp al encargado del negocio',
        params: [
          {
            name: 'whatsapp',
            label: 'Número de WhatsApp *',
            type: 'text',
            required: true
          },
          {
            name: 'message',
            label: 'Mensaje a enviar *',
            type: 'textarea',
            required: true
          }
        ]
      }
    };
    
    this.save();
    this.render();
  },

  // ==========================================
  // FUNCIONES DE REORDENAMIENTO
  // ==========================================
  
  // Mover función en la lista
  moveFunction(functionKey, direction) {
    const keys = Object.keys(this.available);
    const currentIndex = keys.indexOf(functionKey);
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < keys.length) {
      // Crear nuevo objeto con el orden actualizado
      const newAvailable = {};
      const newKeys = [...keys];
      
      // Intercambiar posiciones en el array de keys
      [newKeys[currentIndex], newKeys[newIndex]] = [newKeys[newIndex], newKeys[currentIndex]];
      
      // Reconstruir objeto con nuevo orden
      newKeys.forEach(key => {
        newAvailable[key] = this.available[key];
      });
      
      this.available = newAvailable;
      this.save();
      this.render();
      updatePrompt();
    }
  },

  // Mover parámetro dentro de una función
  moveParam(functionKey, paramIndex, direction) {
    const func = this.available[functionKey];
    if (!func || !func.params) return;
    
    const newIndex = paramIndex + direction;
    
    if (newIndex >= 0 && newIndex < func.params.length) {
      // Intercambiar parámetros
      [func.params[paramIndex], func.params[newIndex]] = [func.params[newIndex], func.params[paramIndex]];
      
      this.save();
      this.render();
      updatePrompt();
    }
  },

  // Agregar nueva función
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
  },

  // Duplicar función global (NUEVA FUNCIÓN)
  duplicateFunction(functionKey) {
    const originalFunc = this.available[functionKey];
    if (!originalFunc) return;

    // Generar nuevo nombre único
    let newKey = functionKey + '_copia';
    let counter = 1;
    while (this.available[newKey]) {
      newKey = functionKey + '_copia_' + counter;
      counter++;
    }

    // Crear copia profunda de la función con sufijos "- Copia"
    const duplicatedFunc = this.duplicateFunctionWithSuffix(originalFunc);
    
    // Guardar la función duplicada
    this.available[newKey] = duplicatedFunc;
    
    this.save();
    this.render();
    updatePrompt();
  },

  // Función auxiliar para duplicar función con sufijos "- Copia" recursivamente
  duplicateFunctionWithSuffix(func) {
    // Crear copia profunda de la función
    const duplicatedFunc = JSON.parse(JSON.stringify(func));
    
    // Agregar "- Copia" al nombre
    if (duplicatedFunc.name && duplicatedFunc.name.trim()) {
      duplicatedFunc.name = duplicatedFunc.name + " - Copia";
    }
    
    // Agregar "- Copia" a la descripción
    if (duplicatedFunc.description && duplicatedFunc.description.trim()) {
      duplicatedFunc.description = duplicatedFunc.description + " - Copia";
    }
    
    // Procesar parámetros
    if (duplicatedFunc.params && duplicatedFunc.params.length > 0) {
      duplicatedFunc.params.forEach(param => {
        // Agregar "- Copia" al label del parámetro
        if (param.label && param.label.trim()) {
          param.label = param.label + " - Copia";
        }
        
        // Si hay opciones, agregar "- Copia" a cada una
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
    
    return duplicatedFunc;
  },

  // Editar función existente
  editFunction(key) {
    const func = this.available[key];
    if (!func) return;

    // Abrir modal de edición (simulado con prompts)
    const newName = prompt('Nombre descriptivo:', func.name);
    if (newName === null) return;

    const newDescription = prompt('Descripción:', func.description);
    if (newDescription === null) return;

    func.name = newName || func.name;
    func.description = newDescription || func.description;

    this.save();
    this.render();
    
    // Actualizar prompt cuando se edita una función
    updatePrompt();
  },

  // Eliminar función
  deleteFunction(key) {
    if (confirm(`¿Eliminar la función "${this.available[key].name}"?`)) {
      delete this.available[key];
      this.save();
      this.render();
      
      // Actualizar steps que usen esta función
      state.flows.forEach(flow => {
        flow.steps.forEach(step => {
          step.functions = step.functions.filter(f => f.type !== key);
        });
      });
      
      renderSteps();
      updatePrompt();
    }
  },

  // Agregar parámetro a función
  addParam(functionKey) {
    const func = this.available[functionKey];
    if (!func) return;

    const paramName = prompt('Nombre del parámetro (clave):');
    if (!paramName) return;

    const paramLabel = prompt('Etiqueta del parámetro:') || paramName;
    const paramType = prompt('Tipo (text/textarea/select):') || 'text';

    const param = {
      name: paramName,
      label: paramLabel,
      type: paramType,
      required: confirm('¿Es requerido?')
    };

    if (paramType === 'select') {
      const options = prompt('Opciones separadas por coma:');
      if (options) {
        param.options = options.split(',').map(o => o.trim());
      }
    }

    func.params.push(param);
    this.save();
    this.render();
    updatePrompt();
  },

  // Eliminar parámetro
  deleteParam(functionKey, paramIndex) {
    const func = this.available[functionKey];
    if (!func || !confirm('¿Eliminar este parámetro?')) return;

    func.params.splice(paramIndex, 1);
    this.save();
    this.render();
    updatePrompt();
  },

  // Renderizar lista de funciones
  render() {
    const container = document.getElementById('functions-list');
    if (!container) return;

    const functionKeys = Object.keys(this.available);

    container.innerHTML = functionKeys.map((key, index) => {
      const func = this.available[key];
      
      // Controles de reordenamiento para funciones (ACTUALIZADO)
      const functionControls = `
        <div style="display: flex; gap: 4px; align-items: center;">
          <button class="btn-small" onclick="functions.duplicateFunction('${key}')" title="Duplicar función">📄</button>
          ${index > 0 ? `<button class="btn-small" onclick="functions.moveFunction('${key}', -1)" title="Subir función">⬆️</button>` : ''}
          ${index < functionKeys.length - 1 ? `<button class="btn-small" onclick="functions.moveFunction('${key}', 1)" title="Bajar función">⬇️</button>` : ''}
          <button class="btn-small" onclick="functions.editFunction('${key}')">✏️ Editar</button>
          <button class="btn-small btn-danger" onclick="functions.deleteFunction('${key}')">🗑️</button>
        </div>
      `;
      
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
              ${func.params.map((param, paramIndex) => {
                // Controles de reordenamiento para parámetros
                const paramControls = `
                  <div style="float: right; display: flex; gap: 4px; align-items: center; margin: -4px;">
                    ${paramIndex > 0 ? `<button class="btn-small" onclick="functions.moveParam('${key}', ${paramIndex}, -1)" title="Subir parámetro" style="padding: 2px 6px; font-size: 11px;">↑</button>` : ''}
                    ${paramIndex < func.params.length - 1 ? `<button class="btn-small" onclick="functions.moveParam('${key}', ${paramIndex}, 1)" title="Bajar parámetro" style="padding: 2px 6px; font-size: 11px;">↓</button>` : ''}
                    <button class="btn-small btn-danger" onclick="functions.deleteParam('${key}', ${paramIndex})" style="padding: 2px 6px; font-size: 11px;">×</button>
                  </div>
                `;
                
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
              }).join('')}
              <button class="btn-small" onclick="functions.addParam('${key}')">➕ Agregar Parámetro</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // Verificar si una función está siendo usada
  isUsed(functionKey) {
    return state.flows.some(flow => 
      flow.steps.some(step => 
        step.functions.some(func => func.type === functionKey)
      )
    );
  },

  // Obtener función por clave
  get(key) {
    return this.available[key];
  },

  // Obtener todas las funciones
  getAll() {
    return this.available;
  },

  // Establecer todas las funciones (usado por projects.js)
  setAll(functions) {
    this.available = functions;
    this.save();
    this.render();
  },

  // Validar parámetros de función
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
  },

  // Guardar en localStorage
  save() {
    localStorage.setItem('functions', JSON.stringify(this.available));
  },

  // Cargar desde localStorage
  load() {
    const saved = localStorage.getItem('functions');
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
  },

  // Exportar funciones
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
  },

  // Importar funciones
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
          updatePrompt();
        } catch (error) {
          alert('Error al importar archivo: ' + error.message);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }
};
// ==========================================
// MÓDULO DE GESTIÓN DE FUNCIONES
// ==========================================

const functions = {
  // Funciones disponibles
  available: {},
  
  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
  
  // Inicializar módulo de funciones
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
  // GESTIÓN DE FUNCIONES
  // ==========================================
  
  // Agregar nueva función
  add() {
    const name = utils.promptWithValidation(
      'Nombre clave de la función (ej: my_function):',
      '',
      (value) => value && !this.available[value] && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)
    );
    
    if (!name) return;
    
    if (this.available[name]) {
      alert('Ya existe una función con ese nombre');
      return;
    }

    const label = utils.promptWithValidation(
      'Nombre descriptivo:',
      name,
      (value) => value.length > 0
    );
    
    if (!label) return;

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

  // Editar función existente
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
    prompt.update();
  },

  // Eliminar función
  deleteFunction(key) {
    if (utils.confirmAction(`la función "${this.available[key].name}"`)) {
      delete this.available[key];
      this.save();
      this.render();
      
      // Actualizar steps que usen esta función
      state.flows.forEach(flow => {
        flow.steps.forEach(step => {
          step.functions = step.functions.filter(f => f.type !== key);
        });
      });
      
      if (flows.renderSteps) flows.renderSteps();
      prompt.update();
    }
  },

  // Duplicar función
  duplicateFunction(key) {
    const originalFunc = this.available[key];
    if (!originalFunc) return;

    const newKey = utils.promptWithValidation(
      'Nombre clave para la función duplicada:',
      `${key}_copy`,
      (value) => value && !this.available[value] && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)
    );

    if (newKey) {
      this.available[newKey] = JSON.parse(JSON.stringify(originalFunc));
      this.available[newKey].name = `${originalFunc.name} (copia)`;
      
      this.save();
      this.render();
      prompt.update();
    }
  },

  // ==========================================
  // GESTIÓN DE PARÁMETROS
  // ==========================================
  
  // Agregar parámetro a función
  addParam(functionKey) {
    const func = this.available[functionKey];
    if (!func) return;

    const paramName = utils.promptWithValidation(
      'Nombre del parámetro (clave):',
      '',
      (value) => value && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)
    );
    
    if (!paramName) return;

    const paramLabel = prompt('Etiqueta del parámetro:') || paramName;
    const paramType = prompt('Tipo (text/textarea/select):', 'text') || 'text';

    const param = {
      name: paramName,
      label: paramLabel,
      type: paramType,
      required: confirm('¿Es requerido?')
    };

    if (paramType === 'select') {
      const options = prompt('Opciones separadas por coma:');
      if (options) {
        param.options = options.split(',').map(o => o.trim()).filter(o => o);
      }
    }

    func.params.push(param);
    this.save();
    this.render();
    prompt.update();
  },

  // Eliminar parámetro
  deleteParam(functionKey, paramIndex) {
    const func = this.available[functionKey];
    if (!func || !utils.confirmAction('este parámetro')) return;

    func.params.splice(paramIndex, 1);
    this.save();
    this.render();
    prompt.update();
  },

  // Editar parámetro
  editParam(functionKey, paramIndex) {
    const func = this.available[functionKey];
    const param = func?.params[paramIndex];
    if (!param) return;

    const newLabel = prompt('Etiqueta del parámetro:', param.label);
    if (newLabel === null) return;

    const newType = prompt('Tipo (text/textarea/select):', param.type);
    if (newType === null) return;

    param.label = newLabel || param.label;
    param.type = newType || param.type;
    param.required = confirm('¿Es requerido?');

    if (param.type === 'select') {
      const currentOptions = param.options ? param.options.join(', ') : '';
      const options = prompt('Opciones separadas por coma:', currentOptions);
      if (options !== null) {
        param.options = options.split(',').map(o => o.trim()).filter(o => o);
      }
    } else {
      delete param.options;
    }

    this.save();
    this.render();
    prompt.update();
  },

  // ==========================================
  // RENDERIZADO
  // ==========================================
  
  // Renderizar lista de funciones
  render() {
    const container = utils.getElement('functions-list');
    if (!container) return;

    container.innerHTML = Object.keys(this.available).map(key => {
      const func = this.available[key];
      return this.renderFunction(key, func);
    }).join('');
  },

  // Renderizar una función individual
  renderFunction(key, func) {
    const isUsed = this.isUsed(key);
    
    return `
      <div class="function-definition ${isUsed ? 'active' : ''}">
        <div class="function-header">
          <div>
            <strong>${func.name}</strong>
            <small style="color: var(--text-secondary); margin-left: 8px;">(${key})</small>
            ${isUsed ? '<span style="color: var(--success); margin-left: 8px;">●</span>' : ''}
          </div>
          <div>
            <button class="btn-small" onclick="functions.editFunction('${key}')">✏️ Editar</button>
            <button class="btn-small" onclick="functions.duplicateFunction('${key}')">📋 Duplicar</button>
            <button class="btn-small btn-danger" onclick="functions.deleteFunction('${key}')">🗑️</button>
          </div>
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
  },

  // Renderizar parámetros de una función
  renderParams(functionKey, params) {
    if (!params || params.length === 0) {
      return '<p style="color: var(--text-secondary); font-style: italic; margin: 8px 0;">Sin parámetros</p>';
    }

    return params.map((param, index) => `
      <div class="param-item">
        <span><strong>${param.label}</strong> (${param.name})</span>
        <span style="margin-left: 8px; color: var(--text-secondary);">
          ${param.type}${param.required ? ' *' : ''}
          ${param.options ? ` [${param.options.join(', ')}]` : ''}
        </span>
        <div style="float: right;">
          <button class="btn-small" onclick="functions.editParam('${functionKey}', ${index})" style="margin: -2px 2px;">✏️</button>
          <button class="btn-small btn-danger" onclick="functions.deleteParam('${functionKey}', ${index})" style="margin: -2px;">×</button>
        </div>
      </div>
    `).join('');
  },

  // ==========================================
  // VALIDACIÓN
  // ==========================================
  
  // Verificar si una función está siendo usada
  isUsed(functionKey) {
    return state.flows.some(flow => 
      flow.steps.some(step => 
        step.functions.some(func => func.type === functionKey)
      )
    );
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
      
      // Validar opciones de select
      if (param.type === 'select' && param.options && params[param.name]) {
        if (!param.options.includes(params[param.name])) {
          errors.push(`El valor "${params[param.name]}" no es válido para "${param.label}"`);
        }
      }
    });

    return { valid: errors.length === 0, errors };
  },

  // Validar todas las funciones
  validateAll() {
    const results = Object.keys(this.available).map(key => {
      const func = this.available[key];
      const errors = [];
      
      if (!utils.cleanText(func.name)) {
        errors.push('La función debe tener un nombre');
      }
      
      func.params.forEach((param, index) => {
        if (!utils.cleanText(param.name)) {
          errors.push(`Parámetro ${index + 1}: debe tener un nombre`);
        }
        if (!utils.cleanText(param.label)) {
          errors.push(`Parámetro ${index + 1}: debe tener una etiqueta`);
        }
        if (param.type === 'select' && (!param.options || param.options.length === 0)) {
          errors.push(`Parámetro ${index + 1}: los selects deben tener opciones`);
        }
      });

      return {
        functionKey: key,
        functionName: func.name,
        isValid: errors.length === 0,
        errors: errors,
        isUsed: this.isUsed(key)
      };
    });

    return {
      isValid: results.every(r => r.isValid),
      total: results.length,
      valid: results.filter(r => r.isValid).length,
      used: results.filter(r => r.isUsed).length,
      results: results
    };
  },

  // ==========================================
  // ACCESO A DATOS
  // ==========================================
  
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
    this.available = functions || {};
    this.save();
    this.render();
  },

  // Obtener funciones utilizadas
  getUsedFunctions() {
    const usedKeys = new Set();
    
    state.flows.forEach(flow => {
      flow.steps.forEach(step => {
        step.functions.forEach(func => {
          usedKeys.add(func.type);
        });
      });
    });

    return Array.from(usedKeys).map(key => ({
      key,
      ...this.available[key]
    }));
  },

  // Obtener funciones no utilizadas
  getUnusedFunctions() {
    return Object.keys(this.available)
      .filter(key => !this.isUsed(key))
      .map(key => ({
        key,
        ...this.available[key]
      }));
  },

  // ==========================================
  // IMPORT/EXPORT
  // ==========================================
  
  // Exportar funciones
  export() {
    const data = JSON.stringify(this.available, null, 2);
    utils.downloadFile(data, 'functions.json');
  },

  // Importar funciones
  import() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const content = await utils.readFile(file);
        const imported = JSON.parse(content);
        
        // Validar estructura
        if (typeof imported !== 'object' || imported === null) {
          throw new Error('Formato de archivo inválido');
        }
        
        // Validar cada función
        const validFunctions = {};
        let validCount = 0;
        
        Object.keys(imported).forEach(key => {
          const func = imported[key];
          if (func && func.name && Array.isArray(func.params)) {
            validFunctions[key] = func;
            validCount++;
          }
        });
        
        if (validCount === 0) {
          throw new Error('No se encontraron funciones válidas');
        }
        
        const action = confirm(
          `Se encontraron ${validCount} funciones válidas.\n\n` +
          'OK = Sobrescribir todas las funciones\n' +
          'Cancelar = Fusionar con las existentes'
        );
        
        if (action) {
          this.available = validFunctions;
        } else {
          Object.assign(this.available, validFunctions);
        }
        
        this.save();
        this.render();
        prompt.update();
        
        alert(`${validCount} funciones importadas exitosamente`);
        
      } catch (error) {
        utils.error('Error al importar funciones:', error);
        alert('Error al importar archivo: ' + error.message);
      }
    };
    
    input.click();
  },

  // ==========================================
  // PLANTILLAS
  // ==========================================
  
  // Agregar plantillas comunes
  addCommonTemplates() {
    const templates = {
      'send_email': {
        name: 'Enviar Email',
        description: 'Envía un email a una dirección específica',
        params: [
          { name: 'to', label: 'Destinatario *', type: 'text', required: true },
          { name: 'subject', label: 'Asunto *', type: 'text', required: true },
          { name: 'body', label: 'Mensaje *', type: 'textarea', required: true }
        ]
      },
      'save_lead': {
        name: 'Guardar Lead',
        description: 'Guarda información de un prospecto',
        params: [
          { name: 'name', label: 'Nombre *', type: 'text', required: true },
          { name: 'phone', label: 'Teléfono', type: 'text', required: false },
          { name: 'email', label: 'Email', type: 'text', required: false },
          { name: 'source', label: 'Fuente', type: 'select', required: false, options: ['WhatsApp', 'Web', 'Referido'] }
        ]
      },
      'schedule_appointment': {
        name: 'Agendar Cita',
        description: 'Programa una cita en el calendario',
        params: [
          { name: 'date', label: 'Fecha *', type: 'text', required: true },
          { name: 'time', label: 'Hora *', type: 'text', required: true },
          { name: 'service', label: 'Servicio *', type: 'text', required: true },
          { name: 'notes', label: 'Notas', type: 'textarea', required: false }
        ]
      }
    };

    const selection = prompt(
      "Selecciona las plantillas a agregar (separadas por coma):\n" +
      Object.keys(templates).map((key, i) => `${i + 1}. ${templates[key].name}`).join('\n') +
      "\n\nEjemplo: 1,3"
    );

    if (selection) {
      const keys = Object.keys(templates);
      const indices = selection.split(',')
        .map(s => parseInt(s.trim()) - 1)
        .filter(i => i >= 0 && i < keys.length);

      if (indices.length > 0) {
        let added = 0;
        indices.forEach(i => {
          const key = keys[i];
          if (!this.available[key]) {
            this.available[key] = templates[key];
            added++;
          }
        });
        
        if (added > 0) {
          this.save();
          this.render();
          prompt.update();
          alert(`${added} plantillas agregadas exitosamente`);
        } else {
          alert('Todas las plantillas seleccionadas ya existen');
        }
      }
    }
  },

  // ==========================================
  // UTILIDADES
  // ==========================================
  
  // Obtener estadísticas
  getStats() {
    const total = Object.keys(this.available).length;
    const used = this.getUsedFunctions().length;
    const withParams = Object.values(this.available).filter(f => f.params.length > 0).length;
    const avgParams = total > 0 ? 
      Object.values(this.available).reduce((sum, f) => sum + f.params.length, 0) / total : 0;

    return {
      total,
      used,
      unused: total - used,
      withParams,
      withoutParams: total - withParams,
      avgParams: Math.round(avgParams * 10) / 10
    };
  },

  // Limpiar funciones no utilizadas
  cleanUnused() {
    const unused = this.getUnusedFunctions();
    
    if (unused.length === 0) {
      alert('No hay funciones sin usar');
      return;
    }

    if (utils.confirmAction(`${unused.length} funciones sin usar`, 'eliminar')) {
      unused.forEach(func => delete this.available[func.key]);
      this.save();
      this.render();
      alert(`${unused.length} funciones eliminadas`);
    }
  },

  // ==========================================
  // PERSISTENCIA
  // ==========================================
  
  // Guardar en localStorage
  save() {
    return utils.saveToStorage('functions', this.available);
  },

  // Cargar desde localStorage
  load() {
    this.available = utils.loadFromStorage('functions', {});
  }
};
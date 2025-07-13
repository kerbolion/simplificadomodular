// Gestión de proyectos para el generador de flujos IA
const projects = {
  // Proyectos guardados con versiones
  saved: {},
  current: null,
  currentVersion: null,

  // Inicializar
  init() {
    this.load();
    this.render();
  },

  // Guardar proyecto actual (ahora con versiones)
  saveProject(silent = false) {
    const name = document.getElementById('project-name').value.trim();
    if (!name) {
      if (!silent) {
        alert('Por favor, ingresa un nombre para el proyecto');
      }
      return false;
    }

    // Crear timestamp para la versión
    const now = new Date();
    const timestamp = now.toISOString();
    const displayTimestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

    // Inicializar proyecto si no existe
    if (!this.saved[name]) {
      this.saved[name] = {
        name: name,
        created: timestamp,
        versions: {}
      };
    }

    // Crear nueva versión
    const versionData = {
      created: timestamp,
      data: this.getCurrentState()
    };

    // Guardar versión
    this.saved[name].versions[timestamp] = versionData;
    this.saved[name].modified = timestamp;
    
    // Establecer como versión actual
    this.current = name;
    this.currentVersion = timestamp;
    
    this.save();
    this.render();
    this.renderVersions();
    
    if (!silent) {
      alert(`Proyecto "${name}" guardado exitosamente\nNueva versión: ${displayTimestamp}`);
    }
    
    return true;
  },

  // Cargar proyecto
  loadProject(name) {
    if (!name) {
      // Nuevo proyecto vacío
      this.current = null;
      this.currentVersion = null;
      document.getElementById('project-name').value = '';
      this.resetState();
      this.renderVersions();
      renderAll();
      updatePrompt();
      return;
    }

    const project = this.saved[name];
    if (!project) {
      alert('Proyecto no encontrado');
      return;
    }

    this.current = name;
    document.getElementById('project-name').value = name;
    
    // Cargar la versión más reciente por defecto
    const versions = Object.keys(project.versions);
    if (versions.length > 0) {
      const latestVersion = versions.sort().pop();
      this.currentVersion = latestVersion;
      this.loadState(project.versions[latestVersion].data);
    }
    
    // Actualizar UI
    this.renderVersions();
    renderAll();
    updatePrompt();
    
    console.log(`Proyecto "${name}" cargado exitosamente`);
  },

  // Cargar versión específica
  loadVersion(versionTimestamp) {
    if (!this.current || !versionTimestamp) {
      return;
    }

    const project = this.saved[this.current];
    const version = project?.versions[versionTimestamp];
    
    if (!version) {
      alert('Versión no encontrada');
      return;
    }

    this.currentVersion = versionTimestamp;
    this.loadState(version.data);
    
    // Actualizar UI
    renderAll();
    updatePrompt();
    
    const displayTime = new Date(versionTimestamp).toLocaleString();
    console.log(`Versión cargada: ${displayTime}`);
  },

  // Eliminar proyecto
  deleteProject() {
    if (!this.current || !this.saved[this.current]) {
      alert('No hay proyecto seleccionado para eliminar');
      return;
    }

    const versionCount = Object.keys(this.saved[this.current].versions || {}).length;
    if (confirm(`¿Eliminar el proyecto "${this.current}" con ${versionCount} versiones?`)) {
      delete this.saved[this.current];
      this.save();
      
      // Reset to new project
      this.current = null;
      this.currentVersion = null;
      document.getElementById('project-name').value = '';
      this.resetState();
      
      this.render();
      this.renderVersions();
      renderAll();
      updatePrompt();
      
      alert('Proyecto eliminado exitosamente');
    }
  },

  // Eliminar versión específica
  deleteVersion() {
    if (!this.current || !this.currentVersion) {
      alert('No hay versión seleccionada para eliminar');
      return;
    }

    const project = this.saved[this.current];
    const versionCount = Object.keys(project.versions || {}).length;
    
    if (versionCount <= 1) {
      alert('No se puede eliminar la única versión del proyecto');
      return;
    }

    const versionDate = new Date(this.currentVersion).toLocaleString();
    if (confirm(`¿Eliminar la versión del ${versionDate}?\n\nEsta acción no se puede deshacer.`)) {
      // Eliminar la versión
      delete project.versions[this.currentVersion];
      
      // Si no quedan versiones, crear una vacía
      const remainingVersions = Object.keys(project.versions);
      if (remainingVersions.length === 0) {
        const now = new Date().toISOString();
        project.versions[now] = {
          created: now,
          data: this.getEmptyProjectData()
        };
        this.currentVersion = now;
      } else {
        // Cargar la versión más reciente disponible
        const latestVersion = remainingVersions.sort().pop();
        this.currentVersion = latestVersion;
        this.loadState(project.versions[latestVersion].data);
      }
      
      this.save();
      this.renderVersions();
      renderAll();
      updatePrompt();
      
      alert('Versión eliminada exitosamente');
    }
  },

  // Eliminar múltiples versiones con modal y checkboxes
  deleteMultipleVersions() {
    if (!this.current || !this.saved[this.current]) {
      alert('No hay proyecto seleccionado');
      return;
    }

    const project = this.saved[this.current];
    const versions = Object.keys(project.versions || {}).sort().reverse(); // Más recientes primero
    
    if (versions.length <= 1) {
      alert('Este proyecto solo tiene una versión');
      return;
    }

    // Crear y mostrar modal
    this.showVersionSelectionModal(versions, project);
  },

  // Mostrar modal de selección de versiones
  showVersionSelectionModal(versions, project) {
    // Crear modal
    const modal = document.createElement('div');
    modal.id = 'version-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    // Crear contenido del modal
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: var(--bg-secondary);
      border-radius: 12px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      max-height: 70vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border-secondary);
    `;

    // Generar HTML del contenido
    modalContent.innerHTML = `
      <h3 style="margin: 0 0 20px 0; color: var(--text-primary); font-size: 1.3em;">
        🗑️ Eliminar Versiones del Proyecto
      </h3>
      
      <p style="margin: 0 0 16px 0; color: var(--text-secondary); font-size: 14px;">
        Selecciona las versiones que deseas eliminar. Debe quedar al menos una versión.
      </p>

      <div id="version-list" style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border-secondary); border-radius: 6px; margin-bottom: 16px;">
        ${versions.map((timestamp, index) => {
          const date = new Date(timestamp).toLocaleString();
          const isCurrent = timestamp === this.currentVersion;
          const isDisabled = versions.length === 1; // Solo deshabilitar si es la única
          
          return `
            <div style="display: flex; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-secondary); transition: background 0.2s; cursor: pointer;" 
                 onmouseover="this.style.background='var(--bg-tertiary)'" 
                 onmouseout="this.style.background='transparent'"
                 onclick="this.querySelector('input[type=checkbox]').click()">
              
              <div style="width: 20px; margin-right: 16px; display: flex; justify-content: center;">
                <input type="checkbox" 
                       value="${timestamp}" 
                       ${isDisabled ? 'disabled' : ''} 
                       style="transform: scale(1.3); cursor: pointer;"
                       onclick="event.stopPropagation()">
              </div>
              
              <div style="flex: 1; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; flex-direction: column;">
                  <div style="font-weight: ${isCurrent ? '600' : '400'}; color: var(--text-primary); font-size: 14px; margin-bottom: 2px;">
                    ${date}
                  </div>
                  <div style="font-size: 12px; color: var(--text-secondary);">
                    Versión ${index + 1} de ${versions.length}
                  </div>
                </div>
                
                ${isCurrent ? `
                  <div style="background: linear-gradient(90deg, #059669, #10b981); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                    ACTUAL
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 16px;">
        <button type="button" id="select-all-btn" class="btn-small" style="flex: 1;">
          ☑️ Seleccionar Todo
        </button>
        <button type="button" id="select-old-btn" class="btn-small" style="flex: 1;">
          🕒 Solo Antiguas
        </button>
        <button type="button" id="clear-selection-btn" class="btn-small" style="flex: 1;">
          ✖️ Limpiar
        </button>
      </div>

      <div id="selection-info" style="margin-bottom: 16px; padding: 8px; border-radius: 4px; background: var(--bg-tertiary); font-size: 13px; color: var(--text-secondary);">
        0 versiones seleccionadas
      </div>

      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button type="button" id="cancel-btn" class="btn-small" style="background: var(--bg-tertiary); color: var(--text-secondary);">
          Cancelar
        </button>
        <button type="button" id="delete-selected-btn" class="btn-small btn-danger" disabled>
          🗑️ Eliminar Seleccionadas
        </button>
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Agregar funcionalidad
    this.setupModalFunctionality(modal, versions);
  },

  // Configurar funcionalidad del modal
  setupModalFunctionality(modal, versions) {
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]:not([disabled])');
    const selectAllBtn = modal.querySelector('#select-all-btn');
    const selectOldBtn = modal.querySelector('#select-old-btn');
    const clearSelectionBtn = modal.querySelector('#clear-selection-btn');
    const deleteBtn = modal.querySelector('#delete-selected-btn');
    const cancelBtn = modal.querySelector('#cancel-btn');
    const selectionInfo = modal.querySelector('#selection-info');

    // Función para actualizar info de selección
    const updateSelectionInfo = () => {
      const selected = Array.from(checkboxes).filter(cb => cb.checked);
      const count = selected.length;
      
      selectionInfo.textContent = count === 0 ? '0 versiones seleccionadas' : 
        count === 1 ? '1 versión seleccionada' : `${count} versiones seleccionadas`;
      
      deleteBtn.disabled = count === 0;
      
      // Verificar que no se seleccionen todas las versiones
      if (count >= versions.length) {
        selectionInfo.textContent = '⚠️ Debe quedar al menos una versión';
        selectionInfo.style.color = 'var(--danger)';
        deleteBtn.disabled = true;
      } else {
        selectionInfo.style.color = 'var(--text-secondary)';
      }
    };

    // Listeners para checkboxes
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', updateSelectionInfo);
    });

    // Seleccionar todo
    selectAllBtn.addEventListener('click', () => {
      // Seleccionar todos excepto uno (para que no quede sin versiones)
      checkboxes.forEach((checkbox, index) => {
        checkbox.checked = index < checkboxes.length - 1;
      });
      updateSelectionInfo();
    });

    // Seleccionar solo versiones antiguas (mantener las 2 más recientes)
    selectOldBtn.addEventListener('click', () => {
      checkboxes.forEach((checkbox, index) => {
        checkbox.checked = index >= 2; // Mantener las 2 más recientes
      });
      updateSelectionInfo();
    });

    // Limpiar selección
    clearSelectionBtn.addEventListener('click', () => {
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
      updateSelectionInfo();
    });

    // Eliminar seleccionadas
    deleteBtn.addEventListener('click', () => {
      const selectedTimestamps = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

      if (selectedTimestamps.length === 0) return;
      if (selectedTimestamps.length >= versions.length) {
        alert('No se pueden eliminar todas las versiones');
        return;
      }

      // Mostrar confirmación
      const selectedDates = selectedTimestamps.map(ts => new Date(ts).toLocaleString());
      const confirmation = confirm(
        `¿Eliminar ${selectedTimestamps.length} versiones?\n\n${selectedDates.join('\n')}\n\nEsta acción no se puede deshacer.`
      );

      if (confirmation) {
        this.executeVersionDeletion(selectedTimestamps);
        this.closeModal(modal);
      }
    });

    // Cancelar
    cancelBtn.addEventListener('click', () => {
      this.closeModal(modal);
    });

    // Cerrar con ESC o click fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal(modal);
      }
    });

    // Inicializar info
    updateSelectionInfo();
  },

  // Ejecutar eliminación de versiones
  executeVersionDeletion(timestampsToDelete) {
    const project = this.saved[this.current];
    
    // Eliminar las versiones seleccionadas
    timestampsToDelete.forEach(timestamp => {
      delete project.versions[timestamp];
    });

    // Si la versión actual fue eliminada, cargar otra
    if (timestampsToDelete.includes(this.currentVersion)) {
      const remainingVersions = Object.keys(project.versions);
      const latestVersion = remainingVersions.sort().pop();
      this.currentVersion = latestVersion;
      this.loadState(project.versions[latestVersion].data);
    }

    this.save();
    this.renderVersions();
    renderAll();
    updatePrompt();
    
    alert(`${timestampsToDelete.length} versiones eliminadas exitosamente`);
  },

  // Cerrar modal
  closeModal(modal) {
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  },

  // Obtener datos vacíos para proyecto
  getEmptyProjectData() {
    return {
      businessName: '',
      sections: [
        {
          name: "Instrucciones Generales",
          fields: [
            { type: "text", label: "Configuración", items: ["Profesional, cordial y claro", "Respuestas breves, máximo 3 renglones"] },
            { type: "textarea", label: "Contexto", value: "Actúa como encargado de tomar pedidos por WhatsApp" }
          ]
        }
      ],
      faqs: [
        { question: "¿Cuáles son los horarios de atención?", answer: "Atendemos de lunes a domingo de 8:00 AM a 10:00 PM" },
        { question: "¿Hacen delivery?", answer: "Sí, hacemos delivery en un radio de 5km" }
      ],
      flows: [{
        name: "Flujo Principal",
        steps: [
          { text: "Saluda al cliente y pregúntale si desea retirar en tienda o envío a domicilio", functions: [] },
          { text: "Solicita el pedido (productos y cantidades) y, si aplica, la dirección para envío.", functions: [] }
        ]
      }],
      currentFlow: 0,
      currentSection: 0,
      functions: functions.getAll()
    };
  },

  // Exportar proyecto
  exportProject() {
    if (!this.current || !this.saved[this.current]) {
      alert('No hay proyecto seleccionado para exportar');
      return;
    }

    const project = this.saved[this.current];
    
    // Asegurar que el proyecto tenga el formato correcto antes de exportar
    const exportData = {
      name: project.name,
      created: project.created,
      modified: project.modified || new Date().toISOString(),
      versions: project.versions || {},
      // Metadatos adicionales para facilitar la importación
      exportedAt: new Date().toISOString(),
      exportVersion: '2.0'
    };
    
    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.current}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    const versionCount = Object.keys(project.versions || {}).length;
    console.log(`Proyecto "${this.current}" exportado con ${versionCount} versiones`);
  },

  // Importar proyecto
  importProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const project = JSON.parse(e.target.result);
          
          console.log('Estructura del archivo importado:', {
            hasName: !!project.name,
            hasVersions: !!project.versions,
            hasData: !!project.data,
            hasCreated: !!project.created,
            keys: Object.keys(project)
          });
          
          // Validar estructura del proyecto (compatible con formato nuevo y viejo)
          if (!project.name) {
            throw new Error('Archivo de proyecto inválido: falta el nombre del proyecto');
          }
          
          // Verificar si es formato nuevo (con versiones) o viejo (con data directa)
          const isNewFormat = project.versions && typeof project.versions === 'object';
          const isOldFormat = project.data && typeof project.data === 'object';
          
          console.log('Formato detectado:', { isNewFormat, isOldFormat });
          
          if (!isNewFormat && !isOldFormat) {
            throw new Error('Archivo de proyecto inválido: no se encontraron datos del proyecto ni versiones');
          }
          
          // Convertir formato viejo al nuevo si es necesario
          let projectToSave = project;
          if (isOldFormat && !isNewFormat) {
            console.log('Convirtiendo proyecto del formato anterior al nuevo...');
            const timestamp = project.modified || project.created || new Date().toISOString();
            projectToSave = {
              name: project.name,
              created: project.created || timestamp,
              modified: timestamp,
              versions: {
                [timestamp]: {
                  created: timestamp,
                  data: project.data
                }
              }
            };
          }
          
          let projectName = projectToSave.name;
          
          // Si ya existe, preguntar si sobrescribir o renombrar
          if (this.saved[projectName]) {
            const action = confirm(
              `Ya existe un proyecto llamado "${projectName}".\n\n` +
              'OK = Sobrescribir\n' +
              'Cancelar = Crear con nuevo nombre'
            );
            
            if (!action) {
              // Generar nuevo nombre
              let counter = 1;
              while (this.saved[`${projectName} (${counter})`]) {
                counter++;
              }
              projectName = `${projectName} (${counter})`;
              project.name = projectName;
            }
          }
          
          // Guardar proyecto
          this.saved[projectName] = {
            ...projectToSave,
            name: projectName, // Asegurar que el nombre esté actualizado
            modified: new Date().toISOString()
          };
          
          this.save();
          this.render();
          
          // Cargar el proyecto importado
          this.loadProject(projectName);
          
          const versionCount = Object.keys(projectToSave.versions || {}).length;
          alert(`Proyecto "${projectName}" importado exitosamente\n${versionCount} versiones disponibles`);
          
        } catch (error) {
          console.error('Error detallado:', error);
          alert('Error al importar proyecto:\n' + error.message + '\n\nVerifica que el archivo sea un proyecto válido exportado desde esta aplicación.');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  },

  // Obtener estado actual de la aplicación
  getCurrentState() {
    return {
      businessName: document.getElementById('business-name')?.value || '',
      sections: state.sections,
      faqs: state.faqs,
      flows: state.flows,
      currentFlow: state.currentFlow,
      currentSection: state.currentSection,
      // IMPORTANTE: Incluir las funciones en el estado del proyecto
      functions: functions.getAll()
    };
  },

  // Cargar estado en la aplicación
  loadState(data) {
    // Cargar campo del negocio
    if (data.businessName !== undefined) {
      document.getElementById('business-name').value = data.businessName;
    }
    
    // Cargar datos del estado
    if (data.sections) state.sections = data.sections;
    if (data.faqs) state.faqs = data.faqs;
    if (data.flows) state.flows = data.flows;
    if (data.currentFlow !== undefined) state.currentFlow = data.currentFlow;
    if (data.currentSection !== undefined) state.currentSection = data.currentSection;
    
    // IMPORTANTE: Cargar las funciones del proyecto
    if (data.functions) {
      functions.available = data.functions;
      functions.save();
      functions.render();
    }

    // Migrar datos del formato anterior si existen
    this.migrateOldConfigData(data);
  },

  // Migrar configuración del formato anterior al nuevo
  migrateOldConfigData(data) {
    // Si existen datos del formato anterior, migrarlos
    if (data.tone || data.format || data.rules) {
      console.log('Migrando configuración al nuevo formato...');
      
      // Encontrar o crear sección de "Instrucciones Generales"
      let generalSection = state.sections.find(s => s.name === "Instrucciones Generales");
      if (!generalSection) {
        generalSection = { name: "Instrucciones Generales", fields: [] };
        state.sections.unshift(generalSection);
      }
      
      // Migrar tono y formato al nuevo formato (como items en lugar de value)
      if (data.tone && !generalSection.fields.find(f => f.label === "Tono")) {
        generalSection.fields.push({ type: "text", label: "Tono", items: [data.tone] });
      }
      if (data.format && !generalSection.fields.find(f => f.label === "Formato")) {
        generalSection.fields.push({ type: "text", label: "Formato", items: [data.format] });
      }
      
      // Migrar reglas
      if (data.rules && data.rules.length > 0) {
        let rulesSection = state.sections.find(s => s.name === "Reglas de comportamiento");
        if (!rulesSection) {
          rulesSection = { name: "Reglas de comportamiento", fields: [] };
          state.sections.push(rulesSection);
        }
        
        // Solo migrar si no existe ya una lista de reglas
        if (!rulesSection.fields.find(f => f.type === "list" && f.label === "Reglas")) {
          rulesSection.fields.push({
            type: "list",
            label: "Reglas",
            items: data.rules
          });
        }
      }
    }

    // Migrar campos de texto del formato anterior (value) al nuevo (items)
    state.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.type === 'text' && field.value && !field.items) {
          // Convertir de formato anterior (value) a nuevo (items)
          field.items = [field.value];
          delete field.value;
        }
      });
    });
  },

  // Resetear estado a valores por defecto
  resetState() {
    // Limpiar formulario
    document.getElementById('business-name').value = '';
    
    // Resetear secciones a valores por defecto
    state.sections = [
      {
        name: "Instrucciones Generales",
        fields: [
          { type: "text", label: "Configuración", items: ["Profesional, cordial y claro", "Respuestas breves, máximo 3 renglones"] },
          { type: "textarea", label: "Contexto", value: "Actúa como encargado de tomar pedidos por WhatsApp" }
        ]
      },
      {
        name: "Reglas de comportamiento", 
        fields: [
          { 
            type: "list", 
            label: "Reglas", 
            items: [
              "Pregunta una cosa a la vez",
              "Envía los enlaces sin formato", 
              "No proporciones información fuera de este documento"
            ]
          }
        ]
      }
    ];
    
    state.faqs = [
      { question: "¿Cuáles son los horarios de atención?", answer: "Atendemos de lunes a domingo de 8:00 AM a 10:00 PM" },
      { question: "¿Hacen delivery?", answer: "Sí, hacemos delivery en un radio de 5km" }
    ];
    
    state.flows = [{
      name: "Flujo Principal",
      steps: [
        { text: "Saluda al cliente y pregúntale si desea retirar en tienda o envío a domicilio", functions: [] },
        { text: "Solicita el pedido (productos y cantidades) y, si aplica, la dirección para envío.", functions: [] }
      ]
    }];
    
    state.currentFlow = 0;
    state.currentSection = 0;
    state.currentTab = 0;
    
    // IMPORTANTE: Resetear funciones a las predeterminadas
    functions.loadDefaults();
  },

  // Renderizar selector de proyectos
  render() {
    const selector = document.getElementById('project-selector');
    if (!selector) return;

    selector.innerHTML = '<option value="">Nuevo proyecto...</option>';
    
    // Ordenar proyectos por fecha de modificación (más recientes primero)
    const sortedProjects = Object.keys(this.saved).sort((a, b) => {
      const dateA = new Date(this.saved[a].modified || this.saved[a].created);
      const dateB = new Date(this.saved[b].modified || this.saved[b].created);
      return dateB - dateA;
    });
    
    sortedProjects.forEach(name => {
      const project = this.saved[name];
      const versionCount = Object.keys(project.versions || {}).length;
      const option = document.createElement('option');
      option.value = name;
      option.textContent = `${name} (${versionCount} versiones)`;
      option.selected = name === this.current;
      selector.appendChild(option);
    });
  },

  // Renderizar selector de versiones
  renderVersions() {
    const selector = document.getElementById('version-selector');
    if (!selector) return;

    selector.innerHTML = '<option value="">Seleccionar versión...</option>';
    
    if (!this.current || !this.saved[this.current]) {
      return;
    }

    const project = this.saved[this.current];
    const versions = Object.keys(project.versions || {}).sort().reverse(); // Más recientes primero
    
    versions.forEach(timestamp => {
      const version = project.versions[timestamp];
      const date = new Date(timestamp);
      const option = document.createElement('option');
      option.value = timestamp;
      option.textContent = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      option.selected = timestamp === this.currentVersion;
      selector.appendChild(option);
    });

    // Agregar botones de gestión de versiones si hay más de una versión
    this.renderVersionControls();
  },

  // Renderizar controles de versiones
  renderVersionControls() {
    // Buscar si ya existe el contenedor de controles
    let controlsContainer = document.getElementById('version-controls');
    
    if (!controlsContainer) {
      // Crear el contenedor de controles de versiones
      controlsContainer = document.createElement('div');
      controlsContainer.id = 'version-controls';
      controlsContainer.style.marginTop = '8px';
      
      // Insertar después del selector de versiones
      const versionSelector = document.getElementById('version-selector');
      if (versionSelector && versionSelector.parentNode) {
        versionSelector.parentNode.appendChild(controlsContainer);
      }
    }

    // Limpiar controles existentes
    controlsContainer.innerHTML = '';

    if (!this.current || !this.saved[this.current]) {
      return;
    }

    const project = this.saved[this.current];
    const versionCount = Object.keys(project.versions || {}).length;

    if (versionCount > 1) {
      controlsContainer.innerHTML = `
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" class="btn-small btn-danger" onclick="projects.deleteVersion()" title="Eliminar versión actual">🗑️ Eliminar Versión</button>
          <button type="button" class="btn-small btn-warning" onclick="projects.deleteMultipleVersions()" title="Seleccionar versiones para eliminar">☑️ Seleccionar para Eliminar</button>
          <span style="font-size: 12px; color: var(--text-secondary); align-self: center;">${versionCount} versiones</span>
        </div>
      `;
    }
  },

  // Obtener lista de proyectos
  getProjectsList() {
    return Object.keys(this.saved).map(name => ({
      name,
      ...this.saved[name]
    }));
  },

  // Exportar todos los proyectos
  exportAll() {
    if (Object.keys(this.saved).length === 0) {
      alert('No hay proyectos para exportar');
      return;
    }

    const backup = {
      exported: new Date().toISOString(),
      version: '1.0',
      projects: this.saved
    };

    const data = JSON.stringify(backup, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-proyectos-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`Backup creado con ${Object.keys(this.saved).length} proyectos`);
  },

  // Importar backup completo
  importAll() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result);
          
          if (!backup.projects) {
            throw new Error('Archivo de backup inválido');
          }
          
          const action = confirm(
            `Se encontraron ${Object.keys(backup.projects).length} proyectos.\n\n` +
            'OK = Sobrescribir todos\n' +
            'Cancelar = Fusionar (mantener existentes)'
          );
          
          if (action) {
            this.saved = backup.projects;
          } else {
            Object.assign(this.saved, backup.projects);
          }
          
          this.save();
          this.render();
          
          alert(`Importados ${Object.keys(backup.projects).length} proyectos exitosamente`);
          
        } catch (error) {
          alert('Error al importar backup: ' + error.message);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  },

  // Guardar en localStorage
  save() {
    localStorage.setItem('projects', JSON.stringify(this.saved));
    localStorage.setItem('currentProject', this.current || '');
    localStorage.setItem('currentVersion', this.currentVersion || '');
  },

  // Cargar desde localStorage
  load() {
    const saved = localStorage.getItem('projects');
    if (saved) {
      try {
        this.saved = JSON.parse(saved);
        // Migrar proyectos antiguos al nuevo formato
        this.migrateOldProjects();
      } catch (e) {
        console.error('Error loading projects:', e);
        this.saved = {};
      }
    }
    
    this.current = localStorage.getItem('currentProject') || null;
    this.currentVersion = localStorage.getItem('currentVersion') || null;
    
    // Si hay un proyecto actual, cargarlo
    if (this.current && this.saved[this.current]) {
      setTimeout(() => {
        this.loadProject(this.current);
      }, 100);
    }
  },

  // Migrar proyectos del formato anterior al nuevo con versiones
  migrateOldProjects() {
    Object.keys(this.saved).forEach(projectName => {
      const project = this.saved[projectName];
      
      // Si el proyecto no tiene el formato nuevo, migrarlo
      if (project.data && !project.versions) {
        const oldData = project.data;
        const timestamp = project.modified || project.created || new Date().toISOString();
        
        this.saved[projectName] = {
          name: projectName,
          created: project.created || timestamp,
          modified: timestamp,
          versions: {
            [timestamp]: {
              created: timestamp,
              data: oldData
            }
          }
        };
        
        console.log(`Migrado proyecto: ${projectName}`);
      }
    });
  }
};
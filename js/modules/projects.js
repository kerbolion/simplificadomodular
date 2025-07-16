// ==========================================
// GESTIÓN DE PROYECTOS OPTIMIZADA
// ==========================================

class ProjectManager {
  constructor() {
    this.saved = {};
    this.current = null;
    this.currentVersion = null;
    this.storageKeys = {
      projects: 'projects',
      currentProject: 'currentProject',
      currentVersion: 'currentVersion'
    };
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  init() {
    this.load();
    this.render();
  }

  // ==========================================
  // OPERACIONES PRINCIPALES
  // ==========================================

  saveProject(silent = false) {
    const projectName = this.getProjectName();
    if (!projectName) {
      if (!silent) alert('Por favor, ingresa un nombre para el proyecto');
      return false;
    }

    const timestamp = new Date().toISOString();
    const displayTimestamp = new Date().toLocaleString();

    this.initializeProject(projectName, timestamp);
    const versionData = this.createVersionData(timestamp);
    
    this.saved[projectName].versions[timestamp] = versionData;
    this.saved[projectName].modified = timestamp;
    
    this.current = projectName;
    this.currentVersion = timestamp;
    
    this.save();
    this.render();
    this.renderVersions();
    
    if (!silent) {
      alert(`Proyecto "${projectName}" guardado exitosamente\nNueva versión: ${displayTimestamp}`);
    }
    
    return true;
  }

  loadProject(name) {
    if (!name) {
      this.loadEmptyProject();
      return;
    }

    const project = this.saved[name];
    if (!project) {
      alert('Proyecto no encontrado');
      return;
    }

    this.current = name;
    document.getElementById('project-name').value = name;
    
    const latestVersion = this.getLatestVersion(project);
    if (latestVersion) {
      this.currentVersion = latestVersion;
      this.loadState(project.versions[latestVersion].data);
    }
    
    this.renderVersions();
    RenderUtils.renderAll();
    this.updatePrompt();
    
    console.log(`Proyecto "${name}" cargado exitosamente`);
  }

  loadVersion(versionTimestamp) {
    if (!this.current || !versionTimestamp) return;

    const version = this.saved[this.current]?.versions[versionTimestamp];
    if (!version) {
      alert('Versión no encontrada');
      return;
    }

    this.currentVersion = versionTimestamp;
    this.loadState(version.data);
    
    RenderUtils.renderAll();
    this.updatePrompt();
    
    console.log(`Versión cargada: ${new Date(versionTimestamp).toLocaleString()}`);
  }

  deleteProject() {
    if (!this.current || !this.saved[this.current]) {
      alert('No hay proyecto seleccionado para eliminar');
      return;
    }

    const versionCount = Object.keys(this.saved[this.current].versions || {}).length;
    if (confirm(`¿Eliminar el proyecto "${this.current}" con ${versionCount} versiones?`)) {
      delete this.saved[this.current];
      this.save();
      
      this.loadEmptyProject();
      this.render();
      this.renderVersions();
      RenderUtils.renderAll();
      this.updatePrompt();
      
      alert('Proyecto eliminado exitosamente');
    }
  }

  // ==========================================
  // GESTIÓN DE VERSIONES
  // ==========================================

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
      delete project.versions[this.currentVersion];
      
      const remainingVersions = Object.keys(project.versions);
      if (remainingVersions.length === 0) {
        this.createEmptyVersion(project);
      } else {
        const latestVersion = this.getLatestVersion(project);
        this.currentVersion = latestVersion;
        this.loadState(project.versions[latestVersion].data);
      }
      
      this.save();
      this.renderVersions();
      RenderUtils.renderAll();
      this.updatePrompt();
      
      alert('Versión eliminada exitosamente');
    }
  }

  deleteMultipleVersions() {
    if (!this.current || !this.saved[this.current]) {
      alert('No hay proyecto seleccionado');
      return;
    }

    const project = this.saved[this.current];
    const versions = Object.keys(project.versions || {}).sort().reverse();
    
    if (versions.length <= 1) {
      alert('Este proyecto solo tiene una versión');
      return;
    }

    this.showVersionSelectionModal(versions, project);
  }

  // ==========================================
  // IMPORTACIÓN/EXPORTACIÓN
  // ==========================================

  exportProject() {
    if (!this.current || !this.saved[this.current]) {
      alert('No hay proyecto seleccionado para exportar');
      return;
    }

    const project = this.saved[this.current];
    const exportData = {
      name: project.name,
      created: project.created,
      modified: project.modified || new Date().toISOString(),
      versions: project.versions || {},
      exportedAt: new Date().toISOString(),
      exportVersion: '2.0'
    };
    
    this.downloadFile(JSON.stringify(exportData, null, 2), `${this.current}.json`, 'application/json');
    
    const versionCount = Object.keys(project.versions || {}).length;
    console.log(`Proyecto "${this.current}" exportado con ${versionCount} versiones`);
  }

  importProject() {
    this.selectFile('.json', (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const project = JSON.parse(e.target.result);
          this.processImportedProject(project);
        } catch (error) {
          console.error('Error detallado:', error);
          alert('Error al importar proyecto:\n' + error.message + '\n\nVerifica que el archivo sea válido.');
        }
      };
      reader.readAsText(file);
    });
  }

  // ==========================================
  // RENDERIZADO
  // ==========================================

  render() {
    const selector = document.getElementById('project-selector');
    if (!selector) return;

    selector.innerHTML = '<option value="">Nuevo proyecto...</option>';
    
    const sortedProjects = this.getSortedProjects();
    sortedProjects.forEach(name => {
      const project = this.saved[name];
      const versionCount = Object.keys(project.versions || {}).length;
      const option = document.createElement('option');
      option.value = name;
      option.textContent = `${name} (${versionCount} versiones)`;
      option.selected = name === this.current;
      selector.appendChild(option);
    });
  }

  renderVersions() {
    const selector = document.getElementById('version-selector');
    if (!selector) return;

    selector.innerHTML = '<option value="">Seleccionar versión...</option>';
    
    if (!this.current || !this.saved[this.current]) {
      this.renderVersionControls();
      return;
    }

    const project = this.saved[this.current];
    const versions = Object.keys(project.versions || {}).sort().reverse();
    
    versions.forEach(timestamp => {
      const date = new Date(timestamp);
      const option = document.createElement('option');
      option.value = timestamp;
      option.textContent = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      option.selected = timestamp === this.currentVersion;
      selector.appendChild(option);
    });

    this.renderVersionControls();
  }

  renderVersionControls() {
    const mainControls = document.getElementById('main-project-controls');
    if (!mainControls) return;

    // Remover botones existentes
    mainControls.querySelectorAll('.version-btn').forEach(btn => btn.remove());

    if (!this.current || !this.saved[this.current]) return;

    const project = this.saved[this.current];
    const versionCount = Object.keys(project.versions || {}).length;

    if (versionCount > 1) {
      const deleteVersionBtn = this.createButton('🗑️ Eliminar Versión', 'btn-small btn-danger version-btn', 
        () => this.deleteVersion(), 'Eliminar versión actual');

      const selectVersionsBtn = this.createButton('☑️ Seleccionar', 'btn-small btn-warning version-btn',
        () => this.deleteMultipleVersions(), 'Seleccionar versiones para eliminar');

      mainControls.appendChild(deleteVersionBtn);
      mainControls.appendChild(selectVersionsBtn);
    }
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD PRIVADOS
  // ==========================================

  getProjectName() {
    return document.getElementById('project-name')?.value?.trim();
  }

  initializeProject(name, timestamp) {
    if (!this.saved[name]) {
      this.saved[name] = {
        name: name,
        created: timestamp,
        versions: {}
      };
    }
  }

  createVersionData(timestamp) {
    return {
      created: timestamp,
      data: this.getCurrentState()
    };
  }

  getCurrentState() {
    return {
      businessName: document.getElementById('business-name')?.value || '',
      sections: state.sections,
      faqs: state.faqs,
      flows: state.flows,
      currentFlow: state.currentFlow,
      currentSection: state.currentSection,
      functions: functions.getAll(),
      orderingEnabled: true,
      globalOrder: state.globalOrder || []
    };
  }

  loadState(data) {
    // Cargar datos básicos
    if (data.businessName !== undefined) {
      document.getElementById('business-name').value = data.businessName;
    }
    
    if (data.sections) state.sections = data.sections;
    if (data.faqs) state.faqs = data.faqs;
    if (data.flows) state.flows = data.flows;
    if (data.currentFlow !== undefined) state.currentFlow = data.currentFlow;
    if (data.currentSection !== undefined) state.currentSection = data.currentSection;
    
    // Cargar funciones
    if (data.functions) {
      functions.available = data.functions;
      functions.save();
      functions.render();
    }

    // Configurar ordenamiento global
    state.orderingEnabled = true;
    
    if (data.globalOrder && Array.isArray(data.globalOrder)) {
      state.globalOrder = data.globalOrder;
    } else {
      state.globalOrder = this.generateDefaultOrder();
    }
    
    // Sincronizar cambios
    if (window.syncElementChanges) {
      window.syncElementChanges();
    }
    
    // Actualizar UI
    setTimeout(() => {
      if (window.renderGlobalOrderTab) {
        window.renderGlobalOrderTab();
      }
    }, 100);

    this.migrateOldConfigData(data);
  }

  loadEmptyProject() {
    this.current = null;
    this.currentVersion = null;
    document.getElementById('project-name').value = '';
    this.resetState();
    this.renderVersions();
    RenderUtils.renderAll();
    this.updatePrompt();
  }

  resetState() {
    // Resetear a valores por defecto
    document.getElementById('business-name').value = '';
    
    state.sections = [...defaults.initialSections];
    state.faqs = [...defaults.initialFaqs];
    state.flows = [...defaults.initialFlows];
    state.currentFlow = 0;
    state.currentSection = 0;
    state.currentTab = 0;
    
    state.orderingEnabled = true;
    state.globalOrder = this.generateDefaultOrder();
    
    functions.loadDefaults();
    
    setTimeout(() => {
      if (window.renderGlobalOrderTab) {
        window.renderGlobalOrderTab();
      }
    }, 100);
  }

  generateDefaultOrder() {
    return [
      { type: 'section', id: 0, name: 'Instrucciones Generales', visible: true },
      { type: 'section', id: 1, name: 'Reglas de comportamiento', visible: true },
      { type: 'flow', id: 0, name: 'Flujo Principal', visible: true },
      { type: 'faqs', id: 'all', name: 'Preguntas Frecuentes', visible: true }
    ];
  }

  getLatestVersion(project) {
    const versions = Object.keys(project.versions || {});
    return versions.length > 0 ? versions.sort().pop() : null;
  }

  getSortedProjects() {
    return Object.keys(this.saved).sort((a, b) => {
      const dateA = new Date(this.saved[a].modified || this.saved[a].created);
      const dateB = new Date(this.saved[b].modified || this.saved[b].created);
      return dateB - dateA;
    });
  }

  createEmptyVersion(project) {
    const now = new Date().toISOString();
    project.versions[now] = {
      created: now,
      data: this.getEmptyProjectData()
    };
    this.currentVersion = now;
  }

  getEmptyProjectData() {
    return {
      businessName: '',
      sections: [...defaults.initialSections],
      faqs: [...defaults.initialFaqs],
      flows: [...defaults.initialFlows],
      currentFlow: 0,
      currentSection: 0,
      functions: functions.getAll(),
      orderingEnabled: true,
      globalOrder: this.generateDefaultOrder()
    };
  }

  createButton(text, className, onClick, title) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.onclick = onClick;
    button.title = title;
    button.innerHTML = text;
    return button;
  }

  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  selectFile(accept, callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) callback(file);
    };
    
    input.click();
  }

  processImportedProject(project) {
    if (!project.name) {
      throw new Error('Archivo de proyecto inválido: falta el nombre del proyecto');
    }
    
    const isNewFormat = project.versions && typeof project.versions === 'object';
    const isOldFormat = project.data && typeof project.data === 'object';
    
    if (!isNewFormat && !isOldFormat) {
      throw new Error('Archivo de proyecto inválido: no se encontraron datos válidos');
    }
    
    let projectToSave = project;
    if (isOldFormat && !isNewFormat) {
      projectToSave = this.convertOldFormat(project);
    }
    
    let projectName = projectToSave.name;
    
    if (this.saved[projectName]) {
      const action = confirm(
        `Ya existe un proyecto llamado "${projectName}".\n\n` +
        'OK = Sobrescribir\n' +
        'Cancelar = Crear con nuevo nombre'
      );
      
      if (!action) {
        projectName = this.generateUniqueProjectName(projectName);
        projectToSave.name = projectName;
      }
    }
    
    this.saved[projectName] = {
      ...projectToSave,
      name: projectName,
      modified: new Date().toISOString()
    };
    
    this.save();
    this.render();
    this.loadProject(projectName);
    
    const versionCount = Object.keys(projectToSave.versions || {}).length;
    alert(`Proyecto "${projectName}" importado exitosamente\n${versionCount} versiones disponibles`);
  }

  convertOldFormat(project) {
    const timestamp = project.modified || project.created || new Date().toISOString();
    return {
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

  generateUniqueProjectName(baseName) {
    let counter = 1;
    let newName = `${baseName} (${counter})`;
    while (this.saved[newName]) {
      counter++;
      newName = `${baseName} (${counter})`;
    }
    return newName;
  }

  migrateOldConfigData(data) {
    if (data.tone || data.format || data.rules) {
      console.log('Migrando configuración al nuevo formato...');
      
      let generalSection = state.sections.find(s => s.name === "Instrucciones Generales");
      if (!generalSection) {
        generalSection = { name: "Instrucciones Generales", fields: [] };
        state.sections.unshift(generalSection);
      }
      
      if (data.tone && !generalSection.fields.find(f => f.label === "Tono")) {
        generalSection.fields.push({ type: "text", label: "Tono", items: [data.tone] });
      }
      if (data.format && !generalSection.fields.find(f => f.label === "Formato")) {
        generalSection.fields.push({ type: "text", label: "Formato", items: [data.format] });
      }
      
      if (data.rules && data.rules.length > 0) {
        let rulesSection = state.sections.find(s => s.name === "Reglas de comportamiento");
        if (!rulesSection) {
          rulesSection = { name: "Reglas de comportamiento", fields: [] };
          state.sections.push(rulesSection);
        }
        
        if (!rulesSection.fields.find(f => f.type === "list" && f.label === "Reglas")) {
          rulesSection.fields.push({
            type: "list",
            label: "Reglas",
            items: data.rules
          });
        }
      }
    }

    // Migrar campos de texto del formato anterior
    state.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.type === 'text' && field.value && !field.items) {
          field.items = [field.value];
          delete field.value;
        }
      });
    });
  }

  updatePrompt() {
    if (window.updatePrompt) {
      window.updatePrompt();
    }
  }

  // ==========================================
  // MODAL DE SELECCIÓN DE VERSIONES
  // ==========================================

  showVersionSelectionModal(versions, project) {
    const modal = this.createModal();
    const modalContent = this.createModalContent(versions);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    this.setupModalFunctionality(modal, versions);
  }

  createModal() {
    const modal = document.createElement('div');
    modal.id = 'version-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.5); display: flex; align-items: center;
      justify-content: center; z-index: 1000;
    `;
    return modal;
  }

  createModalContent(versions) {
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: var(--bg-secondary); border-radius: 12px; padding: 24px;
      max-width: 500px; width: 90%; max-height: 70vh; overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); border: 1px solid var(--border-secondary);
    `;

    modalContent.innerHTML = `
      <h3 style="margin: 0 0 20px 0; color: var(--text-primary); font-size: 1.3em;">
        🗑️ Eliminar Versiones del Proyecto
      </h3>
      
      <p style="margin: 0 0 16px 0; color: var(--text-secondary); font-size: 14px;">
        Selecciona las versiones que deseas eliminar. Debe quedar al menos una versión.
      </p>

      <div id="version-list" style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border-secondary); border-radius: 6px; margin-bottom: 16px;">
        ${this.renderVersionList(versions)}
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 16px;">
        <button type="button" id="select-all-btn" class="btn-small" style="flex: 1;">☑️ Seleccionar Todo</button>
        <button type="button" id="select-old-btn" class="btn-small" style="flex: 1;">🕒 Solo Antiguas</button>
        <button type="button" id="clear-selection-btn" class="btn-small" style="flex: 1;">✖️ Limpiar</button>
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

    return modalContent;
  }

  renderVersionList(versions) {
    return versions.map((timestamp, index) => {
      const date = new Date(timestamp).toLocaleString();
      const isCurrent = timestamp === this.currentVersion;
      
      return `
        <div style="display: flex; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-secondary); transition: background 0.2s; cursor: pointer;" 
             onmouseover="this.style.background='var(--bg-tertiary)'" 
             onmouseout="this.style.background='transparent'"
             onclick="this.querySelector('input[type=checkbox]').click()">
          
          <div style="width: 20px; margin-right: 16px; display: flex; justify-content: center;">
            <input type="checkbox" value="${timestamp}" style="transform: scale(1.3); cursor: pointer;" onclick="event.stopPropagation()">
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
    }).join('');
  }

  setupModalFunctionality(modal, versions) {
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
    const selectionInfo = modal.querySelector('#selection-info');
    const deleteBtn = modal.querySelector('#delete-selected-btn');

    const updateSelectionInfo = () => {
      const selected = Array.from(checkboxes).filter(cb => cb.checked);
      const count = selected.length;
      
      selectionInfo.textContent = count === 0 ? '0 versiones seleccionadas' : 
        count === 1 ? '1 versión seleccionada' : `${count} versiones seleccionadas`;
      
      deleteBtn.disabled = count === 0 || count >= versions.length;
      
      if (count >= versions.length) {
        selectionInfo.textContent = '⚠️ Debe quedar al menos una versión';
        selectionInfo.style.color = 'var(--danger)';
      } else {
        selectionInfo.style.color = 'var(--text-secondary)';
      }
    };

    // Event listeners
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', updateSelectionInfo);
    });

    modal.querySelector('#select-all-btn').addEventListener('click', () => {
      checkboxes.forEach((checkbox, index) => {
        checkbox.checked = index < checkboxes.length - 1;
      });
      updateSelectionInfo();
    });

    modal.querySelector('#select-old-btn').addEventListener('click', () => {
      checkboxes.forEach((checkbox, index) => {
        checkbox.checked = index >= 2;
      });
      updateSelectionInfo();
    });

    modal.querySelector('#clear-selection-btn').addEventListener('click', () => {
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
      updateSelectionInfo();
    });

    modal.querySelector('#delete-selected-btn').addEventListener('click', () => {
      const selectedTimestamps = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

      if (selectedTimestamps.length === 0) return;
      if (selectedTimestamps.length >= versions.length) {
        alert('No se pueden eliminar todas las versiones');
        return;
      }

      const selectedDates = selectedTimestamps.map(ts => new Date(ts).toLocaleString());
      const confirmation = confirm(
        `¿Eliminar ${selectedTimestamps.length} versiones?\n\n${selectedDates.join('\n')}\n\nEsta acción no se puede deshacer.`
      );

      if (confirmation) {
        this.executeVersionDeletion(selectedTimestamps);
        this.closeModal(modal);
      }
    });

    modal.querySelector('#cancel-btn').addEventListener('click', () => {
      this.closeModal(modal);
    });

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

    updateSelectionInfo();
  }

  executeVersionDeletion(timestampsToDelete) {
    const project = this.saved[this.current];
    
    timestampsToDelete.forEach(timestamp => {
      delete project.versions[timestamp];
    });

    if (timestampsToDelete.includes(this.currentVersion)) {
      const remainingVersions = Object.keys(project.versions);
      const latestVersion = remainingVersions.sort().pop();
      this.currentVersion = latestVersion;
      this.loadState(project.versions[latestVersion].data);
    }

    this.save();
    this.renderVersions();
    RenderUtils.renderAll();
    this.updatePrompt();
    
    alert(`${timestampsToDelete.length} versiones eliminadas exitosamente`);
  }

  closeModal(modal) {
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }

  // ==========================================
  // PERSISTENCIA
  // ==========================================

  save() {
    localStorage.setItem(this.storageKeys.projects, JSON.stringify(this.saved));
    localStorage.setItem(this.storageKeys.currentProject, this.current || '');
    localStorage.setItem(this.storageKeys.currentVersion, this.currentVersion || '');
  }

  load() {
    const saved = localStorage.getItem(this.storageKeys.projects);
    if (saved) {
      try {
        this.saved = JSON.parse(saved);
        this.migrateOldProjects();
      } catch (e) {
        console.error('Error loading projects:', e);
        this.saved = {};
      }
    }
    
    this.current = localStorage.getItem(this.storageKeys.currentProject) || null;
    this.currentVersion = localStorage.getItem(this.storageKeys.currentVersion) || null;
    
    if (this.current && this.saved[this.current]) {
      setTimeout(() => {
        this.loadProject(this.current);
      }, 100);
    }
  }

  migrateOldProjects() {
    Object.keys(this.saved).forEach(projectName => {
      const project = this.saved[projectName];
      
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
}

// Instancia global
const projects = new ProjectManager();

// Exportar globalmente
window.projects = projects;
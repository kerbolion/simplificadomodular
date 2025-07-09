// ==========================================
// MÓDULO DE GESTIÓN DE PROYECTOS
// ==========================================

const projects = {
  // Estado del módulo
  saved: {},
  current: null,
  currentVersion: null,

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
  
  // Inicializar módulo de proyectos
  init() {
    this.load();
    this.render();
    this.renderVersions();
    
    // Si hay un proyecto actual, cargarlo
    if (this.current && this.saved[this.current]) {
      setTimeout(() => {
        this.loadProject(this.current);
      }, 100);
    }
  },

  // ==========================================
  // GESTIÓN DE PROYECTOS
  // ==========================================
  
  // Guardar proyecto actual
  saveProject(silent = false) {
    const name = utils.getInputValue('project-name');
    if (!name) {
      if (!silent) {
        alert('Por favor, ingresa un nombre para el proyecto');
      }
      return false;
    }

    // Crear timestamp para la versión
    const now = new Date();
    const timestamp = now.toISOString();
    const displayTimestamp = utils.formatDate(now);

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
      data: getState.getAllData()
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
      utils.setInputValue('project-name', '');
      setState.reset();
      this.renderVersions();
      ui.render.all();
      prompt.update();
      return;
    }

    const project = this.saved[name];
    if (!project) {
      alert('Proyecto no encontrado');
      return;
    }

    this.current = name;
    utils.setInputValue('project-name', name);
    
    // Cargar la versión más reciente por defecto
    const versions = Object.keys(project.versions);
    if (versions.length > 0) {
      const latestVersion = versions.sort().pop();
      this.currentVersion = latestVersion;
      this.loadState(project.versions[latestVersion].data);
    }
    
    // Actualizar UI
    this.renderVersions();
    ui.render.all();
    prompt.update();
    
    utils.log(`Proyecto "${name}" cargado exitosamente`);
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
    ui.render.all();
    prompt.update();
    
    const displayTime = utils.formatDate(versionTimestamp);
    utils.log(`Versión cargada: ${displayTime}`);
  },

  // Eliminar proyecto
  deleteProject() {
    if (!this.current || !this.saved[this.current]) {
      alert('No hay proyecto seleccionado para eliminar');
      return;
    }

    const versionCount = Object.keys(this.saved[this.current].versions || {}).length;
    if (utils.confirmAction(`el proyecto "${this.current}" con ${versionCount} versiones`, 'eliminar')) {
      delete this.saved[this.current];
      this.save();
      
      // Reset to new project
      this.current = null;
      this.currentVersion = null;
      utils.setInputValue('project-name', '');
      setState.reset();
      
      this.render();
      this.renderVersions();
      ui.render.all();
      prompt.update();
      
      alert('Proyecto eliminado exitosamente');
    }
  },

  // ==========================================
  // IMPORT/EXPORT
  // ==========================================
  
  // Exportar proyecto actual
  exportProject() {
    if (!this.current || !this.saved[this.current]) {
      alert('No hay proyecto seleccionado para exportar');
      return;
    }

    const project = this.saved[this.current];
    const data = JSON.stringify(project, null, 2);
    utils.downloadFile(data, `${this.current}.json`);
  },

  // Importar proyecto
  importProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const content = await utils.readFile(file);
        const project = JSON.parse(content);
        
        // Validar estructura del proyecto
        if (!project.name || !project.versions) {
          throw new Error('Archivo de proyecto inválido');
        }
        
        let projectName = project.name;
        
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
          ...project,
          modified: utils.now()
        };
        
        this.save();
        this.render();
        
        // Cargar el proyecto importado
        this.loadProject(projectName);
        
        alert(`Proyecto "${projectName}" importado exitosamente`);
        
      } catch (error) {
        utils.error('Error al importar proyecto:', error);
        alert('Error al importar proyecto: ' + error.message);
      }
    };
    
    input.click();
  },

  // ==========================================
  // GESTIÓN DE ESTADO
  // ==========================================
  
  // Cargar estado en la aplicación
  loadState(data) {
    // Usar setState para cargar los datos
    setState.setAllData(data);
    
    // Migrar datos antiguos si es necesario
    this.migrateLegacyData(data);
  },

  // Migrar datos del formato anterior
  migrateLegacyData(data) {
    // Delegar la migración al módulo de secciones
    if (sections.migrateLegacyData) {
      sections.migrateLegacyData(data);
    }
  },

  // ==========================================
  // RENDERIZADO
  // ==========================================
  
  // Renderizar selector de proyectos
  render() {
    const selector = utils.getElement('project-selector');
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
    const selector = utils.getElement('version-selector');
    if (!selector) return;

    selector.innerHTML = '<option value="">Seleccionar versión...</option>';
    
    if (!this.current || !this.saved[this.current]) {
      return;
    }

    const project = this.saved[this.current];
    const versions = Object.keys(project.versions || {}).sort().reverse(); // Más recientes primero
    
    versions.forEach(timestamp => {
      const option = document.createElement('option');
      option.value = timestamp;
      option.textContent = utils.formatDate(timestamp);
      option.selected = timestamp === this.currentVersion;
      selector.appendChild(option);
    });
  },

  // ==========================================
  // BACKUP Y RESTAURACIÓN
  // ==========================================
  
  // Exportar todos los proyectos
  exportAll() {
    if (Object.keys(this.saved).length === 0) {
      alert('No hay proyectos para exportar');
      return;
    }

    const backup = {
      exported: utils.now(),
      version: '1.0',
      projects: this.saved
    };

    const data = JSON.stringify(backup, null, 2);
    const filename = `backup-proyectos-${new Date().toISOString().slice(0,10)}.json`;
    utils.downloadFile(data, filename);

    alert(`Backup creado con ${Object.keys(this.saved).length} proyectos`);
  },

  // Importar backup completo
  importAll() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const content = await utils.readFile(file);
        const backup = JSON.parse(content);
        
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
        utils.error('Error al importar backup:', error);
        alert('Error al importar backup: ' + error.message);
      }
    };
    
    input.click();
  },

  // ==========================================
  // PERSISTENCIA
  // ==========================================
  
  // Guardar en localStorage
  save() {
    const success = utils.saveToStorage('projects', this.saved) &&
                   utils.saveToStorage('currentProject', this.current || '') &&
                   utils.saveToStorage('currentVersion', this.currentVersion || '');
    
    if (!success) {
      utils.error('Error guardando proyectos en localStorage');
    }
    
    return success;
  },

  // Cargar desde localStorage
  load() {
    this.saved = utils.loadFromStorage('projects', {});
    this.current = utils.loadFromStorage('currentProject', null);
    this.currentVersion = utils.loadFromStorage('currentVersion', null);
    
    // Migrar proyectos antiguos al nuevo formato
    this.migrateOldProjects();
  },

  // Migrar proyectos del formato anterior al nuevo con versiones
  migrateOldProjects() {
    let migrated = false;
    
    Object.keys(this.saved).forEach(projectName => {
      const project = this.saved[projectName];
      
      // Si el proyecto no tiene el formato nuevo, migrarlo
      if (project.data && !project.versions) {
        const oldData = project.data;
        const timestamp = project.modified || project.created || utils.now();
        
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
        
        migrated = true;
        utils.log(`Migrado proyecto: ${projectName}`);
      }
    });
    
    if (migrated) {
      this.save();
    }
  },

  // ==========================================
  // UTILIDADES
  // ==========================================
  
  // Obtener lista de proyectos
  getProjectsList() {
    return Object.keys(this.saved).map(name => ({
      name,
      ...this.saved[name]
    }));
  },

  // Obtener estadísticas de proyectos
  getStats() {
    const totalProjects = Object.keys(this.saved).length;
    const totalVersions = Object.values(this.saved).reduce(
      (total, project) => total + Object.keys(project.versions || {}).length, 0
    );
    
    return {
      totalProjects,
      totalVersions,
      averageVersionsPerProject: totalProjects > 0 ? (totalVersions / totalProjects).toFixed(1) : 0,
      currentProject: this.current,
      currentVersion: this.currentVersion
    };
  }
};
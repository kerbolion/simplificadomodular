// ==========================================
// MÓDULO DE GESTIÓN DE TEMAS
// ==========================================

ui.themes = {
  // ==========================================
  // GESTIÓN DE TEMAS
  // ==========================================
  
  // Alternar entre temas
  toggle() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    this.setTheme(newTheme);
  },

  // Establecer tema específico
  setTheme(theme) {
    const validThemes = ['light', 'dark'];
    if (!validThemes.includes(theme)) {
      utils.error('Tema inválido:', theme);
      return;
    }

    document.documentElement.setAttribute('data-theme', theme);
    utils.saveToStorage('theme', theme);
    
    // Trigger evento personalizado
    this.onThemeChange(theme);
    
    utils.log(`Tema cambiado a: ${theme}`);
  },

  // Obtener tema actual
  getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },

  // Inicializar tema
  init() {
    const savedTheme = utils.loadFromStorage('theme', 'light');
    this.setTheme(savedTheme);
    
    // Detectar preferencia del sistema si no hay tema guardado
    if (!utils.loadFromStorage('theme')) {
      this.detectSystemPreference();
    }
    
    // Escuchar cambios en la preferencia del sistema
    this.watchSystemPreference();
  },

  // Detectar preferencia del sistema
  detectSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }
  },

  // Monitorear cambios en la preferencia del sistema
  watchSystemPreference() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (e) => {
        // Solo cambiar automáticamente si el usuario no ha seleccionado manualmente
        const hasManualSelection = utils.loadFromStorage('theme');
        if (!hasManualSelection) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  },

  // ==========================================
  // EVENTOS Y CALLBACKS
  // ==========================================
  
  // Manejar cambio de tema
  onThemeChange(newTheme) {
    // Actualizar meta theme-color para móviles
    this.updateMetaThemeColor(newTheme);
    
    // Disparar evento personalizado
    const event = new CustomEvent('themeChanged', { 
      detail: { theme: newTheme } 
    });
    document.dispatchEvent(event);
    
    // Callback para otros módulos
    this.notifyModules(newTheme);
  },

  // Notificar a otros módulos sobre el cambio
  notifyModules(theme) {
    // Actualizar gráficos o visualizaciones que dependan del tema
    if (typeof prompt !== 'undefined' && prompt.update) {
      // Re-renderizar el prompt con los nuevos colores
      setTimeout(() => prompt.update(), 100);
    }
  },

  // ==========================================
  // CONFIGURACIÓN AVANZADA
  // ==========================================
  
  // Actualizar meta theme-color
  updateMetaThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    const colors = {
      light: '#f6f8fa',
      dark: '#1e1e1e'
    };
    
    metaThemeColor.content = colors[theme] || colors.light;
  },

  // ==========================================
  // CONFIGURACIÓN PERSONALIZADA
  // ==========================================
  
  // Configurar tema personalizado
  setCustomColors(customColors) {
    const root = document.documentElement;
    
    Object.keys(customColors).forEach(property => {
      if (property.startsWith('--')) {
        root.style.setProperty(property, customColors[property]);
      }
    });
    
    // Guardar colores personalizados
    utils.saveToStorage('customColors', customColors);
  },

  // Cargar colores personalizados
  loadCustomColors() {
    const customColors = utils.loadFromStorage('customColors');
    if (customColors) {
      this.setCustomColors(customColors);
    }
  },

  // Resetear a colores por defecto
  resetToDefaults() {
    const root = document.documentElement;
    const customColors = utils.loadFromStorage('customColors');
    
    if (customColors) {
      Object.keys(customColors).forEach(property => {
        if (property.startsWith('--')) {
          root.style.removeProperty(property);
        }
      });
      
      localStorage.removeItem('customColors');
    }
  },

  // ==========================================
  // UTILIDADES DE TEMA
  // ==========================================
  
  // Verificar si es tema oscuro
  isDark() {
    return this.getCurrentTheme() === 'dark';
  },

  // Verificar si es tema claro
  isLight() {
    return this.getCurrentTheme() === 'light';
  },

  // Obtener valor de variable CSS del tema actual
  getCSSVariable(variableName) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();
  },

  // Obtener colores del tema actual
  getCurrentColors() {
    const cssVars = [
      '--bg-primary',
      '--bg-secondary', 
      '--bg-tertiary',
      '--text-primary',
      '--text-secondary',
      '--text-accent',
      '--border-primary',
      '--border-secondary',
      '--success',
      '--danger',
      '--warning'
    ];
    
    const colors = {};
    cssVars.forEach(varName => {
      colors[varName] = this.getCSSVariable(varName);
    });
    
    return colors;
  },

  // ==========================================
  // ANIMACIONES DE TRANSICIÓN
  // ==========================================
  
  // Animar cambio de tema
  animateThemeChange(callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${this.isDark() ? '#fff' : '#000'};
      opacity: 0;
      pointer-events: none;
      z-index: 9999;
      transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(overlay);
    
    // Fade in
    setTimeout(() => {
      overlay.style.opacity = '0.1';
    }, 10);
    
    // Cambiar tema en el medio de la animación
    setTimeout(() => {
      if (callback) callback();
    }, 150);
    
    // Fade out
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 300);
    }, 300);
  },

  // ==========================================
  // EXPORTAR/IMPORTAR CONFIGURACIÓN
  // ==========================================
  
  // Exportar configuración de tema
  exportConfig() {
    const config = {
      theme: this.getCurrentTheme(),
      customColors: utils.loadFromStorage('customColors'),
      timestamp: utils.now()
    };
    
    utils.downloadFile(
      JSON.stringify(config, null, 2),
      'theme-config.json'
    );
  },

  // Importar configuración de tema
  importConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const content = await utils.readFile(file);
        const config = JSON.parse(content);
        
        if (config.theme) {
          this.setTheme(config.theme);
        }
        
        if (config.customColors) {
          this.setCustomColors(config.customColors);
        }
        
        ui.render.showToast('Configuración de tema importada exitosamente', 'success');
        
      } catch (error) {
        utils.error('Error al importar configuración:', error);
        ui.render.showToast('Error al importar configuración de tema', 'error');
      }
    };
    
    input.click();
  },

  // ==========================================
  // DEBUG Y DESARROLLO
  // ==========================================
  
  // Mostrar información del tema actual
  debugInfo() {
    const info = {
      currentTheme: this.getCurrentTheme(),
      systemPreference: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      savedTheme: utils.loadFromStorage('theme'),
      customColors: utils.loadFromStorage('customColors'),
      cssVariables: this.getCurrentColors()
    };
    
    console.table(info);
    return info;
  }
};

// ==========================================
// FUNCIÓN GLOBAL PARA COMPATIBILIDAD
// ==========================================

// Mantener la función global para compatibilidad con HTML
function toggleTheme() {
  ui.themes.toggle();
}
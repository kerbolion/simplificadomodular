// ==========================================
// UTILIDADES CORREGIDAS
// ==========================================

// Utilidades de texto y HTML
const TextUtils = {
  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  truncate(text, maxLength, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }
};

// Utilidades de debounce y throttle
const TimingUtils = {
  debounceTimers: new Map(),
  
  debounce(key, callback, delay = 300) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    this.debounceTimers.set(key, setTimeout(() => {
      callback();
      this.debounceTimers.delete(key);
    }, delay));
  },

  throttle(callback, delay = 100) {
    let throttled = false;
    return function(...args) {
      if (!throttled) {
        callback.apply(this, args);
        throttled = true;
        setTimeout(() => throttled = false, delay);
      }
    };
  }
};

// Utilidades de renderizado con fallbacks seguros
const RenderUtils = {
  // Renderizar todos los componentes
  renderAll() {
    try {
      this.safeRender('renderFAQs');
      this.safeRender('renderFlows');
      this.safeRender('renderSteps');
      this.safeRender('renderSections');
      this.safeRender('renderSectionContent');
      this.safeRender('renderGlobalOrder');
    } catch (error) {
      console.warn('Error en renderAll:', error);
    }
  },

  // Renderizar componente específico
  renderComponent(componentName) {
    this.safeRender(componentName);
  },

  // Renderizado seguro con fallback
  safeRender(methodName) {
    try {
      if (this[methodName] && typeof this[methodName] === 'function') {
        this[methodName]();
      }
    } catch (error) {
      console.warn(`Error en ${methodName}:`, error);
    }
  },

  // Referencias a funciones de renderizado (se asignan desde otros módulos)
  renderFAQs() {
    if (window.faqManager && window.faqManager.renderFAQs) {
      window.faqManager.renderFAQs();
    }
  },

  renderFlows() {
    if (window.flowManager && window.flowManager.renderFlows) {
      window.flowManager.renderFlows();
    }
  },

  renderSteps() {
    if (window.flowManager && window.flowManager.renderSteps) {
      window.flowManager.renderSteps();
    }
  },

  renderSections() {
    if (window.sectionManager && window.sectionManager.renderSections) {
      window.sectionManager.renderSections();
    }
  },

  renderSectionContent() {
    if (window.sectionManager && window.sectionManager.renderSectionContent) {
      window.sectionManager.renderSectionContent();
    }
  },

  renderGlobalOrder() {
    if (window.globalOrderingUI && window.globalOrderingUI.renderOrder) {
      window.globalOrderingUI.renderOrder();
    }
  }
};

// Utilidades de copia
const CopyUtils = {
  async copyPrompt(event) {
    try {
      const outputElement = document.getElementById('output');
      const text = outputElement.textContent || outputElement.innerText;
      
      await navigator.clipboard.writeText(text);
      
      const btn = event ? event.target.closest('.copy-btn') : document.querySelector('.copy-btn');
      this.showCopyFeedback(btn);
    } catch (err) {
      console.error('Error al copiar:', err);
      alert('Error al copiar al portapapeles');
    }
  },

  showCopyFeedback(btn) {
    if (!btn) return;
    
    const originalHTML = btn.innerHTML;
    const originalBg = btn.style.background;
    
    btn.innerHTML = '<span>✅</span><span>¡Copiado!</span>';
    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = originalBg || 'linear-gradient(135deg, var(--success), #059669)';
    }, 2000);
  }
};

// Utilidades de tema
const ThemeUtils = {
  getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },

  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  },

  initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  },

  detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
};

// Utilidades de auto-guardado
const AutoSaveUtils = {
  timeout: null,
  
  schedule() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      const projectName = document.getElementById('project-name')?.value?.trim();
      if (projectName && window.projects) {
        console.log('Auto-guardando proyecto...');
        const success = window.projects.saveProject(true); // modo silencioso
        if (success) {
          this.showIndicator();
        }
      }
    }, 3600000); // 5 segundos
  },

  showIndicator() {
    const saveBtn = document.querySelector('button[onclick="projects.saveProject()"]');
    if (!saveBtn) return;
    
    const originalText = saveBtn.innerHTML;
    const originalBg = saveBtn.style.background;
    const originalColor = saveBtn.style.color;

    saveBtn.innerHTML = '✅ Guardado';
    saveBtn.style.background = 'linear-gradient(90deg, #10b981, #059669)';
    saveBtn.style.color = '#fff';

    setTimeout(() => {
      saveBtn.innerHTML = originalText;
      saveBtn.style.background = originalBg;
      saveBtn.style.color = originalColor;
    }, 2000);
  }
};

// Utilidades de validación
const ValidationUtils = {
  validateProject(projectName) {
    if (window.defaults && window.defaults.validation && window.defaults.validation.projectName) {
      const config = window.defaults.validation.projectName;
      if (!projectName || projectName.length < config.minLength || projectName.length > config.maxLength) {
        return { valid: false, message: config.message };
      }
      if (config.pattern && !config.pattern.test(projectName)) {
        return { valid: false, message: config.message };
      }
    }
    return { valid: true };
  },

  validateBusinessName(businessName) {
    if (window.defaults && window.defaults.validation && window.defaults.validation.businessName) {
      const config = window.defaults.validation.businessName;
      if (!businessName || businessName.length < config.minLength || businessName.length > config.maxLength) {
        return { valid: false, message: config.message };
      }
    }
    return { valid: true };
  },

  validateSectionName(sectionName) {
    if (window.defaults && window.defaults.validation && window.defaults.validation.sectionName) {
      const config = window.defaults.validation.sectionName;
      if (!sectionName || sectionName.length < config.minLength || sectionName.length > config.maxLength) {
        return { valid: false, message: config.message };
      }
    }
    return { valid: true };
  }
};

// Exportar utilidades globalmente
window.TextUtils = TextUtils;
window.TimingUtils = TimingUtils;
window.RenderUtils = RenderUtils;
window.CopyUtils = CopyUtils;
window.ThemeUtils = ThemeUtils;
window.AutoSaveUtils = AutoSaveUtils;
window.ValidationUtils = ValidationUtils;

// Funciones legacy para compatibilidad
window.renderAll = () => RenderUtils.renderAll();
window.escapeHtml = (text) => TextUtils.escapeHtml(text);
window.copyPrompt = (event) => CopyUtils.copyPrompt(event);
window.toggleTheme = () => ThemeUtils.toggleTheme();
window.scheduleAutoSave = () => AutoSaveUtils.schedule();

// Inicializar tema al cargar
ThemeUtils.initTheme();
// ==========================================
// UTILIDADES GENERALES
// ==========================================

const utils = {
  // ==========================================
  // MANIPULACIÓN DE TEXTO
  // ==========================================
  
  // Escapar HTML para prevenir XSS
  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Limpiar y validar texto
  cleanText(text) {
    return typeof text === 'string' ? text.trim() : '';
  },

  // Generar ID único
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // ==========================================
  // MANIPULACIÓN DE ARRAYS
  // ==========================================
  
  // Mover elemento en array
  moveArrayItem(array, fromIndex, toIndex) {
    if (toIndex >= 0 && toIndex < array.length && fromIndex !== toIndex) {
      const item = array.splice(fromIndex, 1)[0];
      array.splice(toIndex, 0, item);
      return true;
    }
    return false;
  },

  // Filtrar items válidos
  filterValidItems(items) {
    return Array.isArray(items) ? items.filter(item => this.cleanText(item)) : [];
  },

  // ==========================================
  // PROMPTS Y DIÁLOGOS
  // ==========================================
  
  // Prompt con validación
  promptWithValidation(message, defaultValue = '', validator = null) {
    let value = prompt(message, defaultValue);
    if (value === null) return null; // Usuario canceló
    
    value = this.cleanText(value);
    
    if (validator && !validator(value)) {
      alert('Valor inválido. Por favor, intenta nuevamente.');
      return this.promptWithValidation(message, defaultValue, validator);
    }
    
    return value;
  },

  // Confirmar con mensaje personalizado
  confirmAction(message, actionType = 'eliminar') {
    return confirm(`¿${actionType.charAt(0).toUpperCase() + actionType.slice(1)} ${message}?`);
  },

  // ==========================================
  // MANIPULACIÓN DEL DOM
  // ==========================================
  
  // Obtener elemento por ID con validación
  getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Elemento no encontrado: ${id}`);
    }
    return element;
  },

  // Obtener valor de input
  getInputValue(id) {
    const element = this.getElement(id);
    return element ? this.cleanText(element.value) : '';
  },

  // Establecer valor de input
  setInputValue(id, value) {
    const element = this.getElement(id);
    if (element) {
      element.value = value || '';
    }
  },

  // ==========================================
  // PORTAPAPELES
  // ==========================================
  
  // Copiar texto al portapapeles
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Error al copiar:', err);
      // Fallback para navegadores más antiguos
      return this.copyToClipboardFallback(text);
    }
  },

  // Fallback para copiar
  copyToClipboardFallback(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  },

  // Copiar prompt con feedback visual
  async copyPrompt(event) {
    const outputElement = this.getElement('output');
    if (!outputElement) return;

    const text = outputElement.textContent || outputElement.innerText;
    const success = await this.copyToClipboard(text);
    
    if (success) {
      this.showCopySuccess(event);
    } else {
      alert('Error al copiar al portapapeles');
    }
  },

  // Mostrar feedback de copiado exitoso
  showCopySuccess(event) {
    const btn = event ? event.target.closest('.copy-btn') : this.getElement('copy-btn');
    if (!btn) return;

    const originalHTML = btn.innerHTML;
    
    btn.innerHTML = '<span>✅</span><span>¡Copiado!</span>';
    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = 'linear-gradient(135deg, var(--success), #059669)';
    }, 2000);
  },

  // ==========================================
  // ARCHIVOS
  // ==========================================
  
  // Descargar contenido como archivo
  downloadFile(content, filename, mimeType = 'application/json') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Leer archivo
  async readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(e);
      reader.readAsText(file);
    });
  },

  // ==========================================
  // FECHAS Y TIEMPO
  // ==========================================
  
  // Formatear fecha para mostrar
  formatDate(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  },

  // Generar timestamp
  now() {
    return new Date().toISOString();
  },

  // ==========================================
  // ALMACENAMIENTO
  // ==========================================
  
  // Guardar en localStorage con manejo de errores
  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
      return false;
    }
  },

  // Cargar desde localStorage con manejo de errores
  loadFromStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error cargando desde localStorage:', error);
      return defaultValue;
    }
  },

  // ==========================================
  // DEBUGGING
  // ==========================================
  
  // Log con timestamp
  log(message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${message}`, data || '');
  },

  // Log de errores
  error(message, error = null) {
    const timestamp = new Date().toLocaleTimeString();
    console.error(`[${timestamp}] ERROR: ${message}`, error || '');
  }
};
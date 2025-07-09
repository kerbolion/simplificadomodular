// ==========================================
// CONFIGURACIÓN POR DEFECTO
// ==========================================

const defaults = {
  // ==========================================
  // CONFIGURACIÓN DE LA APLICACIÓN
  // ==========================================
  
  app: {
    name: 'Generador de Flujos IA',
    version: '2.0.0',
    author: 'Tu Nombre',
    autoSaveInterval: 5000, // 5 segundos
    theme: 'light',
    language: 'es'
  },

  // ==========================================
  // DATOS INICIALES
  // ==========================================
  
  // Estado inicial de secciones
  initialSections: [
    {
      name: "Instrucciones Generales",
      fields: [
        { 
          type: "text", 
          label: "Configuración", 
          items: [
            "Profesional, cordial y claro", 
            "Respuestas breves, máximo 3 renglones"
          ] 
        },
        { 
          type: "textarea", 
          label: "Contexto", 
          value: "Actúa como encargado de tomar pedidos por WhatsApp" 
        }
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
  ],

  // FAQs iniciales
  initialFaqs: [
    { 
      question: "¿Cuáles son los horarios de atención?", 
      answer: "Atendemos de lunes a domingo de 8:00 AM a 10:00 PM" 
    },
    { 
      question: "¿Hacen delivery?", 
      answer: "Sí, hacemos delivery en un radio de 5km" 
    }
  ],

  // Flujos iniciales
  initialFlows: [
    {
      name: "Flujo Principal",
      steps: [
        { 
          text: "Saluda al cliente y pregúntale si desea retirar en tienda o envío a domicilio", 
          functions: [] 
        },
        { 
          text: "Solicita el pedido (productos y cantidades) y, si aplica, la dirección para envío.", 
          functions: [] 
        }
      ]
    }
  ],

  // ==========================================
  // FUNCIONES POR DEFECTO
  // ==========================================
  
  defaultFunctions: {
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
  },

  // ==========================================
  // CONFIGURACIÓN DE UI
  // ==========================================
  
  ui: {
    // Configuración de pestañas
    tabs: [
      { id: 'config', label: '⚙️ Config', icon: '⚙️' },
      { id: 'flows', label: '🔄 Flujos', icon: '🔄' },
      { id: 'faqs', label: '❓ FAQ', icon: '❓' },
      { id: 'functions', label: '⚡ Funciones', icon: '⚡' }
    ],

    // Configuración de formularios
    form: {
      autoSave: true,
      autoSaveDelay: 1000,
      validateOnInput: true,
      showValidationErrors: true
    },

    // Configuración de notificaciones
    notifications: {
      duration: 3000,
      position: 'top-right',
      showCopyFeedback: true,
      showAutoSaveFeedback: true
    },

    // Configuración de modales
    modals: {
      closeOnEscape: true,
      closeOnOverlayClick: true,
      showCloseButton: true
    }
  },

  // ==========================================
  // CONFIGURACIÓN DE VALIDACIÓN
  // ==========================================
  
  validation: {
    // Límites de texto
    limits: {
      projectName: { min: 2, max: 50 },
      businessName: { min: 2, max: 100 },
      sectionName: { min: 1, max: 50 },
      flowName: { min: 1, max: 50 },
      stepText: { min: 1, max: 500 },
      faqQuestion: { min: 1, max: 200 },
      faqAnswer: { min: 1, max: 1000 },
      functionName: { min: 1, max: 50 },
      functionDescription: { max: 200 }
    },

    // Patrones de validación
    patterns: {
      functionKey: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      parameterName: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      whatsappNumber: /^\+?[\d\s\-\(\)]{10,15}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    // Mensajes de error
    messages: {
      required: 'Este campo es requerido',
      minLength: 'Debe tener al menos {min} caracteres',
      maxLength: 'No puede tener más de {max} caracteres',
      pattern: 'Formato inválido',
      duplicate: 'Ya existe un elemento con este nombre'
    }
  },

  // ==========================================
  // CONFIGURACIÓN DE EXPORTACIÓN
  // ==========================================
  
  export: {
    // Formatos disponibles
    formats: {
      json: { extension: 'json', mimeType: 'application/json' },
      txt: { extension: 'txt', mimeType: 'text/plain' },
      html: { extension: 'html', mimeType: 'text/html' },
      csv: { extension: 'csv', mimeType: 'text/csv' }
    },

    // Configuración de nombres de archivo
    fileNames: {
      project: '{name}_{timestamp}',
      prompt: '{businessName}_prompt',
      functions: 'functions_{timestamp}',
      faqs: 'faqs_{timestamp}',
      backup: 'backup_{timestamp}'
    }
  },

  // ==========================================
  // CONFIGURACIÓN DE TEMAS
  // ==========================================
  
  themes: {
    // Tema por defecto
    default: 'light',
    
    // Detectar preferencia del sistema
    detectSystemPreference: true,
    
    // Animar cambios de tema
    animateTransitions: true,
    
    // Colores personalizables
    customizable: [
      '--text-accent',
      '--success',
      '--danger',
      '--warning'
    ]
  },

  // ==========================================
  // CONFIGURACIÓN DE ATAJOS
  // ==========================================
  
  shortcuts: {
    // Habilitar atajos por defecto
    enableDefaults: true,
    
    // Mostrar feedback visual
    showFeedback: true,
    
    // Permitir personalización
    allowCustomization: true,
    
    // Atajos deshabilitados por defecto
    disabled: []
  },

  // ==========================================
  // CONFIGURACIÓN DE DESARROLLO
  // ==========================================
  
  development: {
    // Nivel de logging
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    
    // Mostrar información de debug
    showDebugInfo: false,
    
    // Habilitar modo debug
    debugMode: false,
    
    // Guardar logs en localStorage
    saveLogs: false
  },

  // ==========================================
  // PLANTILLAS PREDEFINIDAS
  // ==========================================
  
  templates: {
    // Plantillas de negocio
    business: {
      restaurant: {
        name: 'Restaurante',
        sections: [
          {
            name: 'Información del Restaurante',
            fields: [
              { type: 'text', label: 'Horarios', items: ['Lunes a Domingo 11:00 AM - 10:00 PM'] },
              { type: 'text', label: 'Delivery', items: ['Disponible en radio de 5km'] }
            ]
          }
        ],
        faqs: [
          { question: '¿Cuáles son los horarios?', answer: 'Atendemos de 11:00 AM a 10:00 PM todos los días' },
          { question: '¿Hacen delivery?', answer: 'Sí, hacemos delivery en un radio de 5km' }
        ]
      },
      
      ecommerce: {
        name: 'E-commerce',
        sections: [
          {
            name: 'Información de Ventas',
            fields: [
              { type: 'text', label: 'Formas de pago', items: ['Efectivo', 'Tarjetas', 'Transferencias'] },
              { type: 'text', label: 'Envíos', items: ['Envío gratis por compras mayores a $50'] }
            ]
          }
        ],
        faqs: [
          { question: '¿Qué formas de pago aceptan?', answer: 'Aceptamos efectivo, tarjetas y transferencias' },
          { question: '¿Cuánto cuesta el envío?', answer: 'Envío gratis por compras mayores a $50, sino $5' }
        ]
      }
    },

    // Plantillas de funciones
    functions: {
      crm: [
        {
          key: 'save_lead',
          name: 'Guardar Lead',
          description: 'Guarda información de prospecto en CRM',
          params: [
            { name: 'name', label: 'Nombre *', type: 'text', required: true },
            { name: 'phone', label: 'Teléfono', type: 'text', required: false },
            { name: 'email', label: 'Email', type: 'text', required: false }
          ]
        }
      ],
      
      calendar: [
        {
          key: 'schedule_appointment',
          name: 'Agendar Cita',
          description: 'Programa una cita en el calendario',
          params: [
            { name: 'date', label: 'Fecha *', type: 'text', required: true },
            { name: 'time', label: 'Hora *', type: 'text', required: true },
            { name: 'service', label: 'Servicio *', type: 'text', required: true }
          ]
        }
      ]
    }
  },

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================
  
  // Obtener configuración específica
  get(path, defaultValue = null) {
    const keys = path.split('.');
    let current = this;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    
    return current;
  },

  // Establecer configuración
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = this;
    
    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  },

  // Fusionar configuración personalizada
  merge(customConfig) {
    return this.deepMerge(this, customConfig);
  },

  // Merge profundo de objetos
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  },

  // Resetear a valores por defecto
  reset() {
    // Limpiar localStorage
    const keysToKeep = ['theme', 'customShortcuts'];
    const currentStorage = {};
    
    keysToKeep.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) currentStorage[key] = value;
    });
    
    localStorage.clear();
    
    // Restaurar configuración que queremos mantener
    Object.keys(currentStorage).forEach(key => {
      localStorage.setItem(key, currentStorage[key]);
    });
    
    // Recargar página para aplicar defaults
    window.location.reload();
  },

  // Exportar configuración actual
  exportConfig() {
    const config = {
      app: this.app,
      ui: this.ui,
      validation: this.validation,
      themes: this.themes,
      shortcuts: this.shortcuts,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-config-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Importar configuración
  async importConfig(file) {
    try {
      const content = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
      });
      
      const config = JSON.parse(content);
      
      // Validar y aplicar configuración
      if (config.app) Object.assign(this.app, config.app);
      if (config.ui) Object.assign(this.ui, config.ui);
      if (config.validation) Object.assign(this.validation, config.validation);
      if (config.themes) Object.assign(this.themes, config.themes);
      if (config.shortcuts) Object.assign(this.shortcuts, config.shortcuts);
      
      return true;
    } catch (error) {
      console.error('Error importando configuración:', error);
      return false;
    }
  }
};
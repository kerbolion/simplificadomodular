// ==========================================
// CONFIGURACIÓN POR DEFECTO OPTIMIZADA CON TEXT ELEMENTS
// ==========================================

const defaults = {
  // Configuración de la aplicación
  app: {
    name: 'Generador de Flujos IA',
    version: '2.1.0',
    author: 'Tu Nombre',
    autoSaveInterval: 3600000,
    theme: 'light',
    language: 'es'
  },

  // Estados iniciales
  initialSections: [
    {
      name: "Instrucciones Generales",
      fields: [
        { 
          type: "text", 
          label: "Configuración", 
          items: ["Profesional, cordial y claro", "Respuestas breves, máximo 3 renglones"] 
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

  initialFlows: [
    {
      name: "Flujo Principal",
      steps: [
        { 
          text: "Saluda al cliente y pregúntale si desea retirar en tienda o envío a domicilio", 
          functions: [],
          textElements: [],
          elementOrder: []
        },
        { 
          text: "Solicita el pedido (productos y cantidades) y, si aplica, la dirección para envío.",
          functions: [],
          textElements: [],
          elementOrder: []
        }
      ]
    }
  ],

  // Tipos de campos disponibles
  fieldTypes: {
    h1: { name: 'Encabezado H1', icon: '📰', description: 'Título principal de sección', color: '#2563eb' },
    h2: { name: 'Encabezado H2', icon: '📝', description: 'Subtítulo de sección', color: '#7c3aed' },
    h3: { name: 'Encabezado H3', icon: '📄', description: 'Encabezado menor', color: '#059669' },
    text: { name: 'Campo de Texto', icon: '📝', description: 'Lista de elementos de texto', color: '#6b7280' },
    textarea: { name: 'Área de Texto', icon: '📄', description: 'Texto largo o párrafos', color: '#6b7280' },
    list: { name: 'Lista Numerada', icon: '📋', description: 'Lista con numeración automática', color: '#6b7280' }
  },

  // Tipos de elementos en pasos
  stepElementTypes: {
    function: { name: 'Función', icon: '⚡', description: 'Función a ejecutar', color: '#7c3aed' },
    text: { name: 'Texto', icon: '📝', description: 'Texto adicional', color: '#059669' }
  },

  // Funciones predeterminadas
  defaultFunctions: {
    'formularios': {
      name: 'Formularios',
      description: 'Crea un formulario dinámico con campos personalizables',
      params: [
        { name: 'nombre_formulario', label: 'Nombre del formulario *', type: 'text', required: true }
      ]
    },
    'manage_contact_tags': {
      name: 'Gestionar tags de contacto',
      description: 'Permite agregar o eliminar tags de contactos',
      params: [
        { name: 'operation', label: 'Operación *', type: 'select', required: true, options: ['ADD', 'DELETE'] },
        { name: 'tagId', label: 'ID del Tag *', type: 'text', required: true }
      ]
    },
    'send_ai_match_rule_to_user': {
      name: 'Enviar regla de IA al usuario',
      description: 'Envía una regla de coincidencia específica de IA al usuario',
      params: [
        { name: 'match', label: 'Regla de coincidencia *', type: 'text', required: true }
      ]
    },
    'send_notification_message': {
      name: 'Enviar notificación',
      description: 'Envía una notificación por WhatsApp al encargado del negocio',
      params: [
        { name: 'whatsapp', label: 'Número de WhatsApp *', type: 'text', required: true },
        { name: 'message', label: 'Mensaje a enviar *', type: 'textarea', required: true }
      ]
    }
  },

  // Configuración de UI
  ui: {
    tabs: [
      { id: 'config', label: '⚙️ Config', icon: '⚙️' },
      { id: 'flows', label: '🔄 Flujos', icon: '🔄' },
      { id: 'faqs', label: '❓ FAQ', icon: '❓' },
      { id: 'functions', label: '⚡ Funciones', icon: '⚡' }
    ],
    stepElements: {
      emptyStateMessage: 'No hay elementos en este paso. Agrega funciones o textos usando los botones de abajo.',
      emptyStateIcon: '📋',
      addFunctionText: 'Agregar Función',
      addTextText: 'Agregar Texto',
      confirmDeleteFunction: '¿Eliminar esta función?',
      confirmDeleteText: '¿Eliminar este texto?',
      duplicateSuffix: ' - Copia'
    },
    messages: {
      confirmDelete: '¿Estás seguro de que quieres eliminar este elemento?',
      saveSuccess: 'Guardado exitosamente',
      saveError: 'Error al guardar',
      loadError: 'Error al cargar',
      emptyProject: 'Por favor, ingresa un nombre para el proyecto',
      projectSaved: 'Proyecto guardado exitosamente',
      projectDeleted: 'Proyecto eliminado exitosamente',
      importSuccess: 'Importado exitosamente',
      exportSuccess: 'Exportado exitosamente',
      noChanges: 'No hay cambios para guardar',
      invalidData: 'Datos inválidos',
      textElementAdded: 'Elemento de texto agregado',
      functionAdded: 'Función agregada',
      elementDuplicated: 'Elemento duplicado',
      elementMoved: 'Elemento reordenado'
    },
    notifications: {
      duration: 3000,
      position: 'top-right',
      maxVisible: 5
    },
    animations: {
      fadeInDuration: 300,
      slideInDuration: 250,
      hoverTransition: 200,
      scrollDuration: 500
    }
  },

  // Configuración de validación
  validation: {
    projectName: {
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9\s\-_]+$/,
      message: 'El nombre del proyecto debe tener entre 2 y 50 caracteres'
    },
    businessName: {
      minLength: 2,
      maxLength: 100,
      message: 'El nombre del negocio debe tener entre 2 y 100 caracteres'
    },
    sectionName: {
      minLength: 1,
      maxLength: 100,
      message: 'El nombre de la sección debe tener entre 1 y 100 caracteres'
    },
    flowName: {
      minLength: 1,
      maxLength: 100,
      message: 'El nombre del flujo debe tener entre 1 y 100 caracteres'
    },
    stepText: {
      minLength: 1,
      maxLength: 1000,
      message: 'El texto del paso debe tener entre 1 y 1000 caracteres'
    },
    textElement: {
      maxLength: 500,
      message: 'El elemento de texto no puede superar los 500 caracteres'
    },
    functionName: {
      minLength: 1,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_]+$/,
      message: 'El nombre de la función debe ser alfanumérico y usar solo guiones bajos'
    }
  },

  // Configuración de exportación
  export: {
    formats: ['json', 'txt', 'html', 'csv'],
    defaultFormat: 'txt',
    includeMetadata: true,
    compression: false,
    fileNamePattern: '{projectName}_{timestamp}',
    textElementsInPrompt: true,
    includeElementTypes: true
  },

  // Configuración de backup
  backup: {
    autoBackup: true,
    interval: 300000,
    maxBackups: 10,
    includeVersions: true,
    compressBackups: false,
    backupTextElements: true
  },

  // Configuración de rendimiento
  performance: {
    debounceDelay: 300,
    throttleDelay: 100,
    maxHistoryEntries: 50,
    lazyLoadThreshold: 100,
    textElementRenderBatch: 10,
    autoResizeDelay: 150
  },

  // Configuración de accesibilidad
  accessibility: {
    enableKeyboardNavigation: true,
    enableScreenReader: true,
    highContrast: false,
    reducedMotion: false,
    focusRingVisible: true
  },

  // Configuración de ordenamiento global
  globalOrdering: {
    enabled: true,
    dragAndDrop: true,
    animations: true,
    confirmReorder: false,
    includeTextElements: true,
    defaultOrder: [
      { type: 'section', id: 0, name: 'Instrucciones Generales', visible: true },
      { type: 'section', id: 1, name: 'Reglas de comportamiento', visible: true },
      { type: 'flow', id: 0, name: 'Flujo Principal', visible: true },
      { type: 'faqs', id: 'all', name: 'Preguntas Frecuentes', visible: true }
    ]
  },

  // Configuración de temas
  themes: {
    light: {
      name: 'Claro',
      primary: '#5a40c6',
      secondary: '#059669',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981',
      functionColor: '#7c3aed',
      textElementColor: '#059669'
    },
    dark: {
      name: 'Oscuro',
      primary: '#569cd6',
      secondary: '#4ec9b0',
      danger: '#f87171',
      warning: '#fbbf24',
      success: '#34d399',
      functionColor: '#c586c0',
      textElementColor: '#4ec9b0'
    }
  },

  // Métodos de utilidad
  get(path, defaultValue = null) {
    const keys = path.split('.');
    let current = this;
    
    for (const key of keys) {
      if (current[key] === undefined) {
        return defaultValue;
      }
      current = current[key];
    }
    
    return current;
  },

  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = this;
    
    for (const key of keys) {
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  },

  merge(customConfig) {
    return this.deepMerge(this, customConfig);
  },

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

  // Métodos específicos para elementos de texto
  getStepElementConfig(type) {
    return this.stepElementTypes[type] || this.stepElementTypes.text;
  },

  getUIMessage(key) {
    return this.get(`ui.messages.${key}`) || this.get(`ui.stepElements.${key}`) || key;
  },

  validateTextElement(text) {
    const config = this.validation.textElement;
    if (!text) return { valid: true };
    
    if (text.length > config.maxLength) {
      return { 
        valid: false, 
        message: config.message 
      };
    }
    
    return { valid: true };
  },

  validateStepText(text) {
    const config = this.validation.stepText;
    if (!text || text.trim().length === 0) {
      return { 
        valid: false, 
        message: 'El texto del paso no puede estar vacío' 
      };
    }
    
    if (text.length < config.minLength || text.length > config.maxLength) {
      return { 
        valid: false, 
        message: config.message 
      };
    }
    
    return { valid: true };
  },

  // Configuración de migración de datos
  migration: {
    version: '2.1.0',
    autoMigrate: true,
    backupBeforeMigration: true,
    migrations: {
      '2.0.0_to_2.1.0': {
        description: 'Agregar textElements a pasos existentes',
        transform: (data) => {
          if (data.flows) {
            data.flows.forEach(flow => {
              if (flow.steps) {
                flow.steps.forEach(step => {
                  if (!step.textElements) {
                    step.textElements = [];
                  }
                  if (!step.functions) {
                    step.functions = [];
                  }
                });
              }
            });
          }
          return data;
        }
      }
    }
  }
};
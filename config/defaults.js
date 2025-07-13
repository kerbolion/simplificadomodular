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
    autoSaveInterval: 3600000, // 5 segundos
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
  // TIPOS DE CAMPOS DISPONIBLES
  // ==========================================
  
  fieldTypes: {
    h1: {
      name: 'Encabezado H1',
      icon: '📰',
      description: 'Título principal de sección',
      color: '#2563eb', // Azul
      render: (field) => `**${field.value}**`
    },
    h2: {
      name: 'Encabezado H2',
      icon: '📝',
      description: 'Subtítulo de sección',
      color: '#7c3aed', // Púrpura
      render: (field) => `**${field.value}**`
    },
    h3: {
      name: 'Encabezado H3',
      icon: '📄',
      description: 'Encabezado menor',
      color: '#059669', // Verde
      render: (field) => `**${field.value}**`
    },
    text: {
      name: 'Campo de Texto',
      icon: '📝',
      description: 'Lista de elementos de texto',
      color: '#6b7280', // Gris
      render: (field) => field.items?.map(item => `- ${item}`).join('\n') || ''
    },
    textarea: {
      name: 'Área de Texto',
      icon: '📄',
      description: 'Texto largo o párrafos',
      color: '#6b7280', // Gris
      render: (field) => field.value || ''
    },
    list: {
      name: 'Lista Numerada',
      icon: '📋',
      description: 'Lista con numeración automática',
      color: '#6b7280', // Gris
      render: (field) => field.items?.map((item, index) => `${index + 1}. ${item}`).join('\n') || ''
    }
  },

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

    // Mensajes por defecto
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
      invalidData: 'Datos inválidos'
    },

    // Configuración de notificaciones
    notifications: {
      duration: 3000,
      position: 'top-right',
      maxVisible: 5
    },

    // Configuración de modales
    modals: {
      defaultWidth: '500px',
      defaultHeight: 'auto',
      backdrop: true,
      closeOnEscape: true,
      closeOnBackdrop: true
    }
  },

  // ==========================================
  // CONFIGURACIÓN DE VALIDACIÓN
  // ==========================================
  
  validation: {
    projectName: {
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9\s\-_]+$/,
      message: 'El nombre del proyecto debe tener entre 2 y 50 caracteres y solo puede contener letras, números, espacios, guiones y guiones bajos'
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
    
    headerValue: {
      minLength: 1,
      maxLength: 200,
      message: 'El encabezado debe tener entre 1 y 200 caracteres'
    },
    
    faqQuestion: {
      minLength: 5,
      maxLength: 200,
      message: 'La pregunta debe tener entre 5 y 200 caracteres'
    },
    
    faqAnswer: {
      minLength: 5,
      maxLength: 1000,
      message: 'La respuesta debe tener entre 5 y 1000 caracteres'
    },
    
    stepText: {
      minLength: 10,
      maxLength: 500,
      message: 'El texto del paso debe tener entre 10 y 500 caracteres'
    },
    
    functionName: {
      pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      message: 'El nombre de la función debe empezar con letra o guión bajo y solo contener letras, números y guiones bajos'
    }
  },

  // ==========================================
  // CONFIGURACIÓN DE EXPORTACIÓN
  // ==========================================
  
  export: {
    formats: ['json', 'txt', 'html', 'csv'],
    defaultFormat: 'txt',
    includeMetadata: true,
    compression: false,
    
    // Plantillas de exportación
    templates: {
      json: {
        extension: 'json',
        mimeType: 'application/json',
        pretty: true
      },
      txt: {
        extension: 'txt',
        mimeType: 'text/plain',
        encoding: 'utf-8'
      },
      html: {
        extension: 'html',
        mimeType: 'text/html',
        includeStyles: true
      },
      csv: {
        extension: 'csv',
        mimeType: 'text/csv',
        delimiter: ',',
        quote: '"'
      }
    }
  },

  // ==========================================
  // CONFIGURACIÓN DE BACKUP
  // ==========================================
  
  backup: {
    autoBackup: true,
    interval: 300000, // 5 minutos
    maxBackups: 10,
    includeVersions: true,
    compressBackups: false
  },

  // ==========================================
  // CONFIGURACIÓN DE RENDIMIENTO
  // ==========================================
  
  performance: {
    debounceDelay: 300,
    throttleDelay: 100,
    maxHistoryEntries: 50,
    lazyLoadThreshold: 100,
    virtualScrollThreshold: 1000
  },

  // ==========================================
  // CONFIGURACIÓN DE ACCESIBILIDAD
  // ==========================================
  
  accessibility: {
    enableKeyboardNavigation: true,
    announceChanges: true,
    highContrast: false,
    largeText: false,
    reduceMotion: false
  },

  // ==========================================
  // PLANTILLAS Y EJEMPLOS
  // ==========================================
  
  templates: {
    // Plantillas de proyectos
    projects: {
      'restaurante': {
        name: 'Restaurante',
        description: 'Plantilla para toma de pedidos de restaurante',
        data: {
          businessName: 'Mi Restaurante',
          sections: [
            {
              name: "Configuración del Restaurante",
              fields: [
                { type: "text", label: "Horarios", items: ["Lunes a Domingo 11:00 AM - 10:00 PM"] },
                { type: "text", label: "Delivery", items: ["Disponible en radio de 5km", "Tiempo estimado: 30-45 min"] }
              ]
            }
          ],
          faqs: [
            { question: "¿Cuál es el tiempo de entrega?", answer: "El tiempo estimado de entrega es de 30 a 45 minutos" },
            { question: "¿Cuál es el monto mínimo para delivery?", answer: "El monto mínimo para delivery es de $15" }
          ]
        }
      },
      
      'servicios': {
        name: 'Servicios Profesionales',
        description: 'Plantilla para agendamiento de servicios',
        data: {
          businessName: 'Mi Empresa de Servicios',
          sections: [
            {
              name: "Información de Servicios",
              fields: [
                { type: "list", label: "Servicios disponibles", items: ["Consultoría", "Mantenimiento", "Soporte técnico"] }
              ]
            }
          ]
        }
      }
    },

    // Plantillas de funciones comunes
    functionTemplates: {
      'ecommerce': [
        {
          key: 'add_to_cart',
          name: 'Agregar al carrito',
          description: 'Agrega un producto al carrito de compras',
          params: [
            { name: 'product_id', label: 'ID del producto *', type: 'text', required: true },
            { name: 'quantity', label: 'Cantidad', type: 'text', required: false }
          ]
        }
      ],
      
      'appointments': [
        {
          key: 'schedule_appointment',
          name: 'Agendar cita',
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
  // CONFIGURACIÓN DE DESARROLLO
  // ==========================================
  
  development: {
    debug: false,
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    enableDevTools: false,
    mockData: false,
    simulateNetworkDelay: false
  },

  // ==========================================
  // CONFIGURACIÓN DE INTEGRACIÓN
  // ==========================================
  
  integration: {
    webhooks: {
      enabled: false,
      endpoints: [],
      retryAttempts: 3,
      timeout: 5000
    },
    
    apis: {
      timeout: 10000,
      retries: 2,
      baseUrl: ''
    }
  },

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================
  
  // Obtener configuración por clave
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

  // Establecer configuración
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

  // Fusionar configuración personalizada
  merge(customConfig) {
    return this.deepMerge(this, customConfig);
  },

  // Fusión profunda de objetos
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

  // Validar configuración
  validate() {
    const errors = [];
    
    // Validar estructura básica
    if (!this.app || !this.app.name) {
      errors.push('Falta configuración de la aplicación');
    }
    
    if (!this.initialSections || !Array.isArray(this.initialSections)) {
      errors.push('Secciones iniciales inválidas');
    }
    
    if (!this.defaultFunctions || typeof this.defaultFunctions !== 'object') {
      errors.push('Funciones por defecto inválidas');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Exportar configuración actual
  export() {
    return JSON.stringify(this, null, 2);
  },

  // Cargar configuración desde JSON
  load(configJson) {
    try {
      const config = JSON.parse(configJson);
      Object.assign(this, config);
      return true;
    } catch (error) {
      console.error('Error cargando configuración:', error);
      return false;
    }
  }
};
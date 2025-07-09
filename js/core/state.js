// ==========================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================

const state = {
  // Pestañas y navegación
  currentTab: 0,
  currentFlow: 0,
  currentSection: 0,

  // Flujos de conversación
  flows: [{
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
  }],

  // Secciones de configuración
  sections: [
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

  // Preguntas frecuentes
  faqs: [
    { 
      question: "¿Cuáles son los horarios de atención?", 
      answer: "Atendemos de lunes a domingo de 8:00 AM a 10:00 PM" 
    },
    { 
      question: "¿Hacen delivery?", 
      answer: "Sí, hacemos delivery en un radio de 5km" 
    }
  ]
};

// ==========================================
// GETTERS DEL ESTADO
// ==========================================

const getState = {
  // Obtener el flujo actual
  currentFlow() {
    return state.flows[state.currentFlow];
  },

  // Obtener la sección actual
  currentSection() {
    return state.sections[state.currentSection];
  },

  // Obtener todos los datos para guardar
  getAllData() {
    return {
      businessName: document.getElementById('business-name')?.value || '',
      sections: state.sections,
      faqs: state.faqs,
      flows: state.flows,
      currentFlow: state.currentFlow,
      currentSection: state.currentSection,
      functions: functions.getAll()
    };
  },

  // Verificar si hay datos válidos para guardar
  hasValidData() {
    return document.getElementById('business-name')?.value?.trim() || 
           state.sections.some(s => s.fields.length > 0) ||
           state.flows.some(f => f.steps.some(step => step.text.trim()));
  }
};

// ==========================================
// SETTERS DEL ESTADO
// ==========================================

const setState = {
  // Establecer datos completos (usado al cargar proyectos)
  setAllData(data) {
    if (data.businessName !== undefined) {
      document.getElementById('business-name').value = data.businessName;
    }
    
    if (data.sections) state.sections = data.sections;
    if (data.faqs) state.faqs = data.faqs;
    if (data.flows) state.flows = data.flows;
    if (data.currentFlow !== undefined) state.currentFlow = data.currentFlow;
    if (data.currentSection !== undefined) state.currentSection = data.currentSection;
    
    if (data.functions) {
      functions.setAll(data.functions);
    }
  },

  // Resetear a valores por defecto
  reset() {
    document.getElementById('business-name').value = '';
    
    state.sections = [
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
    ];
    
    state.faqs = [
      { 
        question: "¿Cuáles son los horarios de atención?", 
        answer: "Atendemos de lunes a domingo de 8:00 AM a 10:00 PM" 
      },
      { 
        question: "¿Hacen delivery?", 
        answer: "Sí, hacemos delivery en un radio de 5km" 
      }
    ];
    
    state.flows = [{
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
    }];
    
    state.currentFlow = 0;
    state.currentSection = 0;
    state.currentTab = 0;
    
    functions.loadDefaults();
  }
};

// ==========================================
// VALIDACIONES
// ==========================================

const validate = {
  // Validar índices
  flowIndex(index) {
    return index >= 0 && index < state.flows.length;
  },

  sectionIndex(index) {
    return index >= 0 && index < state.sections.length;
  },

  stepIndex(flowIndex, stepIndex) {
    return this.flowIndex(flowIndex) && 
           stepIndex >= 0 && 
           stepIndex < state.flows[flowIndex].steps.length;
  },

  // Validar contenido
  hasContent(text) {
    return text && typeof text === 'string' && text.trim().length > 0;
  },

  hasItems(items) {
    return Array.isArray(items) && items.some(item => this.hasContent(item));
  }
};
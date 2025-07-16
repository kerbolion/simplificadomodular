// ==========================================
// ESTADO GLOBAL OPTIMIZADO
// ==========================================

const state = {
  // Estado de la interfaz
  currentTab: 0,
  currentFlow: 0,
  currentSection: 0,
  
  // Datos principales
  flows: [{
    name: "Flujo Principal",
    steps: [
      { text: "Saluda al cliente y pregúntale si desea retirar en tienda o envío a domicilio", functions: [] },
      { text: "Solicita el pedido (productos y cantidades) y, si aplica, la dirección para envío.", functions: [] }
    ]
  }],
  
  sections: [
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
  ],
  
  faqs: [
    { question: "¿Cuáles son los horarios de atención?", answer: "Atendemos de lunes a domingo de 8:00 AM a 10:00 PM" },
    { question: "¿Hacen delivery?", answer: "Sí, hacemos delivery en un radio de 5km" }
  ],
  
  // Ordenamiento global SIEMPRE activo
  orderingEnabled: true,
  globalOrder: [
    { type: 'section', id: 0, name: 'Instrucciones Generales', visible: true },
    { type: 'section', id: 1, name: 'Reglas de comportamiento', visible: true },
    { type: 'flow', id: 0, name: 'Flujo Principal', visible: true },
    { type: 'faqs', id: 'all', name: 'Preguntas Frecuentes', visible: true }
  ]
};

// ==========================================
// OBSERVADORES DE ESTADO (Para optimizar renders)
// ==========================================

class StateObserver {
  constructor() {
    this.listeners = new Map();
    this.debounceTimers = new Map();
  }

  // Suscribirse a cambios de una propiedad
  subscribe(property, callback, debounceTime = 0) {
    if (!this.listeners.has(property)) {
      this.listeners.set(property, new Set());
    }
    this.listeners.get(property).add(callback);

    return () => {
      this.listeners.get(property).delete(callback);
    };
  }

  // Notificar cambio en propiedad
  notify(property, value, oldValue) {
    const listeners = this.listeners.get(property);
    if (!listeners) return;

    const debounceKey = `${property}_notification`;
    
    if (this.debounceTimers.has(debounceKey)) {
      clearTimeout(this.debounceTimers.get(debounceKey));
    }

    this.debounceTimers.set(debounceKey, setTimeout(() => {
      listeners.forEach(callback => {
        try {
          callback(value, oldValue, property);
        } catch (error) {
          console.error(`Error en listener de ${property}:`, error);
        }
      });
      this.debounceTimers.delete(debounceKey);
    }, 100));
  }
}

// Instancia global del observador
const stateObserver = new StateObserver();

// ==========================================
// PROXY PARA ESTADO REACTIVO
// ==========================================

const reactiveState = new Proxy(state, {
  set(target, property, value) {
    const oldValue = target[property];
    target[property] = value;
    
    // Notificar cambio
    stateObserver.notify(property, value, oldValue);
    
    return true;
  },
  
  get(target, property) {
    return target[property];
  }
});

// Exportar el estado reactivo como estado principal
window.state = reactiveState;
window.stateObserver = stateObserver;
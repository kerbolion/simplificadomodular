// Estado global de la aplicación
const state = {
  currentTab: 0,
  currentFlow: 0,
  currentSection: 0,
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
  ]
};
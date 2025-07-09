// ==========================================
// GENERACIÓN DE PROMPTS ACTUALIZADA
// ==========================================
function updatePrompt() {
  const businessName = document.getElementById('business-name')?.value || '[Nombre negocio]';

  let html = '';
  
  // Título principal con color
  html += `<span class="output-title">Prompt para Asistente IA – "${businessName}"</span>\n\n`;

  // Secciones dinámicas
  state.sections.forEach(section => {
    const validFields = section.fields.filter(field => {
      if (field.type === 'text') return field.items && field.items.some(item => item.trim());
      if (field.type === 'textarea') return field.value && field.value.trim();
      if (field.type === 'list') return field.items && field.items.some(item => item.trim());
      return false;
    });
    
    if (validFields.length > 0) {
      html += `<span class="output-section">**${section.name}:**</span>\n`;
      
      validFields.forEach(field => {
        if (field.type === 'text') {
          const validItems = field.items.filter(item => item.trim());
          if (validItems.length > 0) {
            validItems.forEach((item) => {
              html += `- ${item}\n`;
            });
          }
        } else if (field.type === 'textarea') {
          html += `${field.value}\n`;
        } else if (field.type === 'list') {
          const validItems = field.items.filter(item => item.trim());
          if (validItems.length > 0) {
            validItems.forEach((item, index) => {
              html += `<span class="output-step-number">${index + 1}.</span> ${item}\n`;
            });
          }
        }
      });
      html += '\n';
    }
  });

  // Flujos
  state.flows.forEach((flow, flowIndex) => {
    const title = state.flows.length === 1 ? "**Flujo principal:**" : `**${flow.name}:**`;
    html += `<span class="output-section">${title}</span>\n\n`;
    
    flow.steps.forEach((step, stepIndex) => {
      html += `<span class="output-step-number">${stepIndex + 1}.</span> ${step.text}`;
      
      // Agregar funciones del paso con colores
      if (step.functions && step.functions.length > 0) {
        step.functions.forEach(func => {
          const funcDef = functions.get(func.type);
          if (funcDef) {
            const customFields = func.customFields || [];
            const params = func.params || {};
            
            // Determinar el nombre de la función a mostrar
            let functionName = func.type; // Usar el nombre técnico por defecto
            let displayParams = [];
            
            // Para la función "formularios", usar el parámetro nombre_formulario como nombre
            if (func.type === 'formularios' && params.nombre_formulario) {
              functionName = params.nombre_formulario;
              // Solo agregar campos personalizados como parámetros
              displayParams = customFields
                .filter(field => field.name && field.value)
                .map(field => `<span class="output-keyword">${field.name}</span>: <span class="output-string">"${field.value}"</span>`);
            } else {
              // Para otras funciones, usar el nombre técnico y agregar todos los parámetros
              const predefinedParams = Object.entries(params)
                .filter(([key, value]) => value)
                .map(([key, value]) => `<span class="output-keyword">${key}</span>: <span class="output-string">"${value}"</span>`);
              
              const customParams = customFields
                .filter(field => field.name && field.value)
                .map(field => `<span class="output-keyword">${field.name}</span>: <span class="output-string">"${field.value}"</span>`);
              
              displayParams = [...predefinedParams, ...customParams];
            }
            
            const allParams = displayParams.join(', ');
            html += `\n    <span class="output-function">Ejecuta la función: ${functionName}({${allParams}})</span>`;
          }
        });
      }
      html += '\n\n';
    });
  });

  // Preguntas frecuentes (movidas al final)
  const validFaqs = state.faqs.filter(f => f.question.trim() && f.answer.trim());
  if (validFaqs.length > 0) {
    html += `<span class="output-section">**Preguntas Frecuentes:**</span>\n`;
    validFaqs.forEach(faq => {
      html += `- <span class="output-question">**${faq.question}**</span>\n`;
      html += `  <span class="output-answer">${faq.answer}</span>\n`;
    });
    html += '\n';
  }

  // Actualizar output con HTML coloreado
  document.getElementById('output').innerHTML = html.trim();
}
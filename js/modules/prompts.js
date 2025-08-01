// ==========================================
// GENERACIÓN DE PROMPTS OPTIMIZADA CON ELEMENTOS DE TEXTO
// ==========================================

class PromptGenerator {
  constructor() {
    this.isUsingGlobalOrder = false;
  }

  // ==========================================
  // FUNCIÓN PRINCIPAL DE GENERACIÓN
  // ==========================================

  updatePrompt() {
    const businessName = document.getElementById('business-name')?.value || '[Nombre negocio]';
    
    let html = '';
    html += `<span class="output-title">Prompt para Asistente IA – "${businessName}"</span>\n\n`;

    // Verificar si usar orden global o por defecto
    if (this.shouldUseGlobalOrder()) {
      html += this.generateWithGlobalOrder();
    } else {
      html += this.generateWithDefaultOrder();
    }

    // Actualizar output con HTML coloreado
    document.getElementById('output').innerHTML = html.trim();
  }

  // ==========================================
  // GENERACIÓN CON ORDEN GLOBAL
  // ==========================================

  generateWithGlobalOrder() {
    let html = '';
    
    if (state.globalOrder && state.globalOrder.length > 0) {
      state.globalOrder.forEach(item => {
        if (item.visible !== false) {
          const content = this.generateElementContent(item);
          if (content) {
            html += content + '\n';
          }
        }
      });
    }
    
    return html;
  }

  generateElementContent(item) {
    switch (item.type) {
      case 'section':
        return this.generateSectionContent(item.id);
      case 'flow':
        return this.generateFlowContent(item.id);
      case 'faqs':
        return this.generateFAQsContent();
      default:
        return '';
    }
  }

  // ==========================================
  // GENERACIÓN CON ORDEN POR DEFECTO
  // ==========================================

  generateWithDefaultOrder() {
    let html = '';
    
    // Secciones dinámicas
    state.sections.forEach((section, index) => {
      const content = this.generateSectionContent(index);
      if (content) {
        html += content + '\n';
      }
    });

    // Flujos
    state.flows.forEach((flow, flowIndex) => {
      const content = this.generateFlowContent(flowIndex);
      if (content) {
        html += content;
      }
    });

    // Preguntas frecuentes (al final)
    const faqContent = this.generateFAQsContent();
    if (faqContent) {
      html += faqContent + '\n';
    }
    
    return html;
  }

  // ==========================================
  // GENERADORES DE CONTENIDO ESPECÍFICO
  // ==========================================

  generateSectionContent(sectionIndex) {
    const section = state.sections[sectionIndex];
    if (!section) return '';
    
    const validFields = this.getValidFields(section.fields);
    if (validFields.length === 0) return '';
    
    let html = `<span class="output-section">${section.name}:</span>\n`;
    
    validFields.forEach(field => {
      html += this.renderField(field);
    });
    
    return html;
  }

  generateFlowContent(flowIndex) {
    const flow = state.flows[flowIndex];
    if (!flow || !flow.steps || flow.steps.length === 0) return '';
    
    const title = state.flows.length === 1 ? "Flujo principal:" : `${flow.name}:`;
    let html = `<span class="output-section">${title}</span>\n`;
    
    flow.steps.forEach((step, stepIndex) => {
      if (!step.text || !step.text.trim()) return;
      
      html += `<span class="output-step-number">${stepIndex + 1}.</span> ${step.text}`;
      
      // Agregar funciones y elementos de texto del paso
      html += this.renderStepElements(step);
      
      html += '\n';
    });
    
    return html;
  }

  renderStepElements(step) {
    let html = '';
    
    // Verificar si el paso tiene el nuevo sistema de orden
    if (step.elementOrder && step.elementOrder.length > 0) {
      // Usar el orden definido en elementOrder
      step.elementOrder.forEach(orderItem => {
        if (orderItem.type === 'function' && step.functions && step.functions[orderItem.index]) {
          const func = step.functions[orderItem.index];
          html += this.renderStepFunction(func);
        } else if (orderItem.type === 'text' && step.textElements && step.textElements[orderItem.index]) {
          const textEl = step.textElements[orderItem.index];
          if (textEl.text && textEl.text.trim()) {
            html += `\n    <span class="output-comment">${textEl.text}</span>`;
          }
        }
      });
    } else {
      // Sistema legacy: renderizar funciones primero, luego textos
      // Renderizar funciones
      if (step.functions && step.functions.length > 0) {
        step.functions.forEach(func => {
          html += this.renderStepFunction(func);
        });
      }
      
      // Renderizar elementos de texto
      if (step.textElements && step.textElements.length > 0) {
        step.textElements.forEach(textEl => {
          if (textEl.text && textEl.text.trim()) {
            html += `\n    <span class="output-comment">${textEl.text}</span>`;
          }
        });
      }
    }
    
    return html;
  }

  generateFAQsContent() {
    const validFaqs = state.faqs.filter(f => f.question.trim());
    if (validFaqs.length === 0) return '';
    
    let html = `<span class="output-section">Preguntas Frecuentes:</span>\n`;
    validFaqs.forEach(faq => {
      html += `- <span class="output-question">${faq.question}</span>\n`;
      if (faq.answer.trim()) {
        html += `  <span class="output-answer">${faq.answer}</span>\n`;
      }
    });
    
    return html;
  }

  // ==========================================
  // RENDERIZADORES DE CAMPOS
  // ==========================================

  renderField(field) {
    const fieldRenderers = {
      'h1': () => `<span class="output-h1">${field.value}</span>\n`,
      'h2': () => `<span class="output-h2">${field.value}</span>\n`,
      'h3': () => `<span class="output-h3">${field.value}</span>\n`,
      'text': () => this.renderTextField(field),
      'textarea': () => `${field.value}\n`,
      'list': () => this.renderListField(field)
    };

    const renderer = fieldRenderers[field.type];
    return renderer ? renderer() : '';
  }

  renderTextField(field) {
    const validItems = field.items.filter(item => item.trim());
    if (validItems.length === 0) return '';
    
    return validItems.map(item => `- ${item}\n`).join('');
  }

  renderListField(field) {
    const validItems = field.items.filter(item => item.trim());
    if (validItems.length === 0) return '';
    
    return validItems.map((item, index) => 
      `<span class="output-step-number">${index + 1}.</span> ${item}\n`
    ).join('');
  }

  renderStepFunction(func) {
    const funcDef = functions.get(func.type);
    if (!funcDef) return '';

    const customFields = func.customFields || [];
    const params = func.params || {};
    
    let functionName = func.type;
    let displayParams = [];
    
    // Lógica especial para la función "formularios"
    if (func.type === 'formularios' && params.nombre_formulario) {
      functionName = params.nombre_formulario;
      displayParams = this.getCustomFieldParams(customFields);
    } else {
      const predefinedParams = this.getPredefinedParams(params);
      const customParams = this.getCustomFieldParams(customFields);
      displayParams = [...predefinedParams, ...customParams];
    }
    
    const allParams = displayParams.join(', ');
    return `\n    <span class="output-function">Ejecuta la función: ${functionName}({${allParams}})</span>`;
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  shouldUseGlobalOrder() {
    return state.orderingEnabled && state.globalOrder && state.globalOrder.length > 0;
  }

  getValidFields(fields) {
    return fields.filter(field => {
      if (field.type === 'h1' || field.type === 'h2' || field.type === 'h3') {
        return field.value && field.value.trim();
      }
      if (field.type === 'text') return field.items && field.items.some(item => item.trim());
      if (field.type === 'textarea') return field.value && field.value.trim();
      if (field.type === 'list') return field.items && field.items.some(item => item.trim());
      return false;
    });
  }

  getPredefinedParams(params) {
    return Object.entries(params)
      .filter(([key, value]) => value)
      .map(([key, value]) => `<span class="output-keyword">${key}</span>: <span class="output-string">"${value}"</span>`);
  }

  getCustomFieldParams(customFields) {
    return customFields
      .filter(field => field.name && field.value)
      .map(field => `<span class="output-keyword">${field.name}</span>: <span class="output-string">"${field.value}"</span>`);
  }
}

// Instancia global
const promptGenerator = new PromptGenerator();

// Exportar globalmente
window.promptGenerator = promptGenerator;

// Función principal para actualizar el prompt
window.updatePrompt = () => promptGenerator.updatePrompt();

// Función para versiones con orden global (compatibilidad)
window.updatePromptWithGlobalOrder = () => promptGenerator.updatePrompt();
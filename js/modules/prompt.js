// ==========================================
// MÓDULO DE GENERACIÓN DE PROMPTS
// ==========================================

const prompt = {
  // ==========================================
  // GENERACIÓN PRINCIPAL
  // ==========================================
  
  // Actualizar prompt completo
  update() {
    const businessName = utils.getInputValue('business-name') || '[Nombre negocio]';
    
    let html = '';
    
    // Título principal
    html += this.renderTitle(businessName);
    
    // Secciones dinámicas
    html += this.renderSections();
    
    // Flujos
    html += this.renderFlows();
    
    // Preguntas frecuentes (al final)
    html += this.renderFAQs();
    
    // Actualizar el DOM
    const outputElement = utils.getElement('output');
    if (outputElement) {
      outputElement.innerHTML = html.trim();
    }
  },

  // ==========================================
  // RENDERIZADO DE COMPONENTES
  // ==========================================
  
  // Renderizar título principal
  renderTitle(businessName) {
    return `<span class="output-title">Prompt para Asistente IA – "${businessName}"</span>\n\n`;
  },

  // Renderizar todas las secciones
  renderSections() {
    let html = '';
    
    state.sections.forEach(section => {
      const validFields = this.getValidFields(section);
      
      if (validFields.length > 0) {
        html += `<span class="output-section">**${section.name}:**</span>\n`;
        html += this.renderSectionFields(validFields);
        html += '\n';
      }
    });
    
    return html;
  },

  // Renderizar campos de una sección
  renderSectionFields(fields) {
    let html = '';
    
    fields.forEach(field => {
      switch (field.type) {
        case 'text':
          html += this.renderTextFieldOutput(field);
          break;
        case 'textarea':
          html += this.renderTextAreaFieldOutput(field);
          break;
        case 'list':
          html += this.renderListFieldOutput(field);
          break;
      }
    });
    
    return html;
  },

  // Renderizar campo de texto en el output
  renderTextFieldOutput(field) {
    const validItems = utils.filterValidItems(field.items);
    return validItems.map(item => `- ${item}\n`).join('');
  },

  // Renderizar textarea en el output
  renderTextAreaFieldOutput(field) {
    return utils.cleanText(field.value) ? `${field.value}\n` : '';
  },

  // Renderizar lista en el output
  renderListFieldOutput(field) {
    const validItems = utils.filterValidItems(field.items);
    return validItems.map((item, index) => 
      `<span class="output-step-number">${index + 1}.</span> ${item}\n`
    ).join('');
  },

  // Renderizar todos los flujos
  renderFlows() {
    let html = '';
    
    state.flows.forEach((flow, flowIndex) => {
      const title = state.flows.length === 1 ? "**Flujo principal:**" : `**${flow.name}:**`;
      html += `<span class="output-section">${title}</span>\n\n`;
      
      flow.steps.forEach((step, stepIndex) => {
        html += `<span class="output-step-number">${stepIndex + 1}.</span> ${step.text}`;
        html += this.renderStepFunctions(step);
        html += '\n\n';
      });
    });
    
    return html;
  },

  // Renderizar funciones de un paso
  renderStepFunctions(step) {
    if (!step.functions || step.functions.length === 0) {
      return '';
    }
    
    let html = '';
    
    step.functions.forEach(func => {
      const funcDef = functions.get(func.type);
      if (funcDef) {
        const functionCall = this.renderFunctionCall(func, funcDef);
        html += `\n    <span class="output-function">Ejecuta la función: ${functionCall}</span>`;
      }
    });
    
    return html;
  },

  // Renderizar llamada a función
  renderFunctionCall(func, funcDef) {
    const customFields = func.customFields || [];
    const params = func.params || {};
    
    let functionName = func.type;
    let displayParams = [];
    
    // Caso especial para formularios
    if (func.type === 'formularios' && params.nombre_formulario) {
      functionName = params.nombre_formulario;
      displayParams = customFields
        .filter(field => field.name && field.value)
        .map(field => `<span class="output-keyword">${field.name}</span>: <span class="output-string">"${field.value}"</span>`);
    } else {
      // Otras funciones
      const predefinedParams = Object.entries(params)
        .filter(([key, value]) => value)
        .map(([key, value]) => `<span class="output-keyword">${key}</span>: <span class="output-string">"${value}"</span>`);
      
      const customParams = customFields
        .filter(field => field.name && field.value)
        .map(field => `<span class="output-keyword">${field.name}</span>: <span class="output-string">"${field.value}"</span>`);
      
      displayParams = [...predefinedParams, ...customParams];
    }
    
    const allParams = displayParams.join(', ');
    return `${functionName}({${allParams}})`;
  },

  // Renderizar FAQs
  renderFAQs() {
    const validFaqs = state.faqs.filter(faq => 
      utils.cleanText(faq.question) && utils.cleanText(faq.answer)
    );
    
    if (validFaqs.length === 0) {
      return '';
    }
    
    let html = `<span class="output-section">**Preguntas Frecuentes:**</span>\n`;
    
    validFaqs.forEach(faq => {
      html += `- <span class="output-question">**${faq.question}**</span>\n`;
      html += `  <span class="output-answer">${faq.answer}</span>\n`;
    });
    
    return html + '\n';
  },

  // ==========================================
  // UTILIDADES
  // ==========================================
  
  // Obtener campos válidos de una sección
  getValidFields(section) {
    return section.fields.filter(field => {
      switch (field.type) {
        case 'text':
          return field.items && validate.hasItems(field.items);
        case 'textarea':
          return validate.hasContent(field.value);
        case 'list':
          return field.items && validate.hasItems(field.items);
        default:
          return false;
      }
    });
  },

  // ==========================================
  // EXPORTACIÓN
  // ==========================================
  
  // Obtener texto plano del prompt
  getPlainText() {
    const outputElement = utils.getElement('output');
    return outputElement ? (outputElement.textContent || outputElement.innerText) : '';
  },

  // Obtener HTML del prompt
  getHTML() {
    const outputElement = utils.getElement('output');
    return outputElement ? outputElement.innerHTML : '';
  },

  // Exportar prompt como archivo
  exportAsFile(format = 'txt') {
    const content = format === 'html' ? this.getHTML() : this.getPlainText();
    const businessName = utils.getInputValue('business-name') || 'prompt';
    const filename = `${businessName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_prompt.${format}`;
    const mimeType = format === 'html' ? 'text/html' : 'text/plain';
    
    utils.downloadFile(content, filename, mimeType);
  },

  // ==========================================
  // VALIDACIÓN
  // ==========================================
  
  // Validar que el prompt tenga contenido mínimo
  validate() {
    const businessName = utils.getInputValue('business-name');
    const hasValidSections = state.sections.some(section => this.getValidFields(section).length > 0);
    const hasValidFlows = state.flows.some(flow => 
      flow.steps.some(step => utils.cleanText(step.text))
    );
    
    return {
      isValid: !!(businessName && (hasValidSections || hasValidFlows)),
      errors: {
        noBusinessName: !businessName,
        noContent: !hasValidSections && !hasValidFlows,
        noSections: !hasValidSections,
        noFlows: !hasValidFlows
      }
    };
  },

  // Obtener estadísticas del prompt
  getStats() {
    const plainText = this.getPlainText();
    const words = plainText.split(/\s+/).filter(word => word.length > 0);
    const lines = plainText.split('\n').filter(line => line.trim().length > 0);
    
    return {
      characters: plainText.length,
      words: words.length,
      lines: lines.length,
      sections: state.sections.length,
      flows: state.flows.length,
      steps: state.flows.reduce((total, flow) => total + flow.steps.length, 0),
      faqs: state.faqs.filter(faq => utils.cleanText(faq.question) && utils.cleanText(faq.answer)).length
    };
  },

  // ==========================================
  // PREVIEW Y TESTING
  // ==========================================
  
  // Generar vista previa para testing
  generatePreview() {
    const stats = this.getStats();
    const validation = this.validate();
    
    return {
      content: this.getPlainText(),
      stats: stats,
      isValid: validation.isValid,
      errors: validation.errors,
      timestamp: utils.now()
    };
  }
};
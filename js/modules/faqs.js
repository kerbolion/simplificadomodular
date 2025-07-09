// ==========================================
// MÓDULO DE GESTIÓN DE FAQS
// ==========================================

const faqs = {
  // ==========================================
  // GESTIÓN DE FAQS
  // ==========================================
  
  // Agregar nueva FAQ
  add() {
    state.faqs.push({ question: '', answer: '' });
    this.render();
    events.scheduleAutoSave();
  },

  // Eliminar FAQ
  remove(index) {
    if (utils.confirmAction('esta pregunta frecuente')) {
      state.faqs.splice(index, 1);
      this.render();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Actualizar FAQ
  update(index, field, value) {
    if (validate.hasContent(field) && state.faqs[index]) {
      state.faqs[index][field] = value;
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Mover FAQ
  move(index, direction) {
    const newIndex = index + direction;
    
    if (utils.moveArrayItem(state.faqs, index, newIndex)) {
      this.render();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // ==========================================
  // RENDERIZADO
  // ==========================================
  
  // Renderizar todas las FAQs
  render() {
    const container = utils.getElement('faq-container');
    if (!container) return;

    container.innerHTML = state.faqs.map((faq, index) => 
      this.renderFAQ(faq, index, state.faqs.length)
    ).join('');
  },

  // Renderizar una FAQ individual
  renderFAQ(faq, index, totalFaqs) {
    return `
      <div class="list-item" style="flex-direction: column; align-items: stretch; background: var(--bg-tertiary); padding: 12px; border-radius: 6px; border: 1px solid var(--border-secondary); position: relative; margin-bottom: 12px;">
        <div class="faq-controls" style="position: absolute; top: 8px; right: 8px; display: flex; gap: 4px;">
          ${index > 0 ? `<button class="btn-small" onclick="faqs.move(${index}, -1)" title="Subir">↑</button>` : ''}
          ${index < totalFaqs - 1 ? `<button class="btn-small" onclick="faqs.move(${index}, 1)" title="Bajar">↓</button>` : ''}
          <button class="delete-btn" onclick="faqs.remove(${index})">×</button>
        </div>
        
        <label>Pregunta:</label>
        <input type="text" value="${utils.escapeHtml(faq.question)}" placeholder="Pregunta frecuente..."
               oninput="faqs.update(${index}, 'question', this.value)" style="margin-bottom: 8px;">
        
        <label>Respuesta:</label>
        <textarea placeholder="Respuesta..." 
                  oninput="faqs.update(${index}, 'answer', this.value)">${utils.escapeHtml(faq.answer)}</textarea>
      </div>
    `;
  },

  // ==========================================
  // VALIDACIÓN
  // ==========================================
  
  // Validar FAQ individual
  validateFAQ(index) {
    const faq = state.faqs[index];
    if (!faq) return { isValid: false, errors: ['FAQ no encontrada'] };

    const errors = [];
    
    if (!utils.cleanText(faq.question)) {
      errors.push('La pregunta no puede estar vacía');
    }
    
    if (!utils.cleanText(faq.answer)) {
      errors.push('La respuesta no puede estar vacía');
    }
    
    if (faq.question && faq.question.length > 200) {
      errors.push('La pregunta es demasiado larga (máximo 200 caracteres)');
    }
    
    if (faq.answer && faq.answer.length > 1000) {
      errors.push('La respuesta es demasiado larga (máximo 1000 caracteres)');
    }

    return { isValid: errors.length === 0, errors };
  },

  // Validar todas las FAQs
  validateAll() {
    const results = state.faqs.map((faq, index) => ({
      faqIndex: index,
      question: faq.question,
      ...this.validateFAQ(index)
    }));

    const validFaqs = results.filter(result => result.isValid);
    const invalidFaqs = results.filter(result => !result.isValid);

    return {
      isValid: invalidFaqs.length === 0,
      total: state.faqs.length,
      valid: validFaqs.length,
      invalid: invalidFaqs.length,
      results: results
    };
  },

  // ==========================================
  // UTILIDADES
  // ==========================================
  
  // Obtener FAQs válidas
  getValidFaqs() {
    return state.faqs.filter(faq => 
      utils.cleanText(faq.question) && utils.cleanText(faq.answer)
    );
  },

  // Buscar FAQ por pregunta
  searchByQuestion(searchTerm) {
    const term = utils.cleanText(searchTerm).toLowerCase();
    if (!term) return [];

    return state.faqs
      .map((faq, index) => ({ ...faq, index }))
      .filter(faq => 
        faq.question.toLowerCase().includes(term) || 
        faq.answer.toLowerCase().includes(term)
      );
  },

  // Duplicar FAQ
  duplicate(index) {
    if (index >= 0 && index < state.faqs.length) {
      const originalFaq = state.faqs[index];
      const duplicatedFaq = {
        question: `${originalFaq.question} (copia)`,
        answer: originalFaq.answer
      };
      
      state.faqs.splice(index + 1, 0, duplicatedFaq);
      this.render();
      prompt.update();
      events.scheduleAutoSave();
    }
  },

  // Obtener estadísticas
  getStats() {
    const total = state.faqs.length;
    const valid = this.getValidFaqs().length;
    const avgQuestionLength = total > 0 ? 
      state.faqs.reduce((sum, faq) => sum + (faq.question?.length || 0), 0) / total : 0;
    const avgAnswerLength = total > 0 ? 
      state.faqs.reduce((sum, faq) => sum + (faq.answer?.length || 0), 0) / total : 0;

    return {
      total,
      valid,
      invalid: total - valid,
      completeness: total > 0 ? (valid / total) * 100 : 0,
      avgQuestionLength: Math.round(avgQuestionLength),
      avgAnswerLength: Math.round(avgAnswerLength)
    };
  },

  // ==========================================
  // IMPORT/EXPORT
  // ==========================================
  
  // Exportar FAQs como JSON
  exportAsJSON() {
    const data = JSON.stringify(this.getValidFaqs(), null, 2);
    const filename = 'faqs.json';
    utils.downloadFile(data, filename);
  },

  // Exportar FAQs como CSV
  exportAsCSV() {
    const validFaqs = this.getValidFaqs();
    if (validFaqs.length === 0) {
      alert('No hay FAQs válidas para exportar');
      return;
    }

    let csv = 'Pregunta,Respuesta\n';
    validFaqs.forEach(faq => {
      const question = `"${faq.question.replace(/"/g, '""')}"`;
      const answer = `"${faq.answer.replace(/"/g, '""')}"`;
      csv += `${question},${answer}\n`;
    });

    const filename = 'faqs.csv';
    utils.downloadFile(csv, filename, 'text/csv');
  },

  // Importar FAQs desde JSON
  importFromJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const content = await utils.readFile(file);
        const importedFaqs = JSON.parse(content);
        
        // Validar que sea un array de FAQs
        if (!Array.isArray(importedFaqs)) {
          throw new Error('El archivo debe contener un array de FAQs');
        }
        
        // Validar estructura de cada FAQ
        const validFaqs = importedFaqs.filter(faq => 
          faq && 
          typeof faq === 'object' && 
          utils.cleanText(faq.question) && 
          utils.cleanText(faq.answer)
        );
        
        if (validFaqs.length === 0) {
          throw new Error('No se encontraron FAQs válidas en el archivo');
        }
        
        // Preguntar si agregar o reemplazar
        const action = confirm(
          `Se encontraron ${validFaqs.length} FAQs válidas.\n\n` +
          'OK = Agregar a las existentes\n' +
          'Cancelar = Reemplazar todas'
        );
        
        if (action) {
          // Agregar a las existentes
          state.faqs.push(...validFaqs);
        } else {
          // Reemplazar todas
          state.faqs = validFaqs;
        }
        
        this.render();
        prompt.update();
        events.scheduleAutoSave();
        
        alert(`${validFaqs.length} FAQs importadas exitosamente`);
        
      } catch (error) {
        utils.error('Error al importar FAQs:', error);
        alert('Error al importar FAQs: ' + error.message);
      }
    };
    
    input.click();
  },

  // ==========================================
  // PLANTILLAS Y SUGERENCIAS
  // ==========================================
  
  // Agregar FAQs de plantilla común
  addCommonTemplate() {
    const templates = [
      {
        question: "¿Cuáles son los horarios de atención?",
        answer: "Atendemos de lunes a domingo de 8:00 AM a 10:00 PM"
      },
      {
        question: "¿Hacen delivery?",
        answer: "Sí, hacemos delivery en un radio de 5km"
      },
      {
        question: "¿Cuáles son las formas de pago?",
        answer: "Aceptamos efectivo, tarjetas de débito/crédito y transferencias"
      },
      {
        question: "¿Cuánto tiempo tarda el delivery?",
        answer: "El tiempo promedio de entrega es de 30-45 minutos"
      },
      {
        question: "¿Tienen promociones?",
        answer: "Sí, consultanos por nuestras promociones vigentes"
      }
    ];

    const selection = prompt(
      "Selecciona las FAQs a agregar (separadas por coma):\n" +
      templates.map((t, i) => `${i + 1}. ${t.question}`).join('\n') +
      "\n\nEjemplo: 1,3,5"
    );

    if (selection) {
      const indices = selection.split(',')
        .map(s => parseInt(s.trim()) - 1)
        .filter(i => i >= 0 && i < templates.length);

      if (indices.length > 0) {
        indices.forEach(i => state.faqs.push({ ...templates[i] }));
        this.render();
        prompt.update();
        events.scheduleAutoSave();
        alert(`${indices.length} FAQs agregadas exitosamente`);
      }
    }
  },

  // Limpiar FAQs vacías
  cleanEmpty() {
    const initialCount = state.faqs.length;
    state.faqs = state.faqs.filter(faq => 
      utils.cleanText(faq.question) && utils.cleanText(faq.answer)
    );
    
    const removed = initialCount - state.faqs.length;
    
    if (removed > 0) {
      this.render();
      prompt.update();
      events.scheduleAutoSave();
      alert(`${removed} FAQs vacías eliminadas`);
    } else {
      alert('No se encontraron FAQs vacías');
    }
  }
};
// ==========================================
// GESTIÓN DE FAQS OPTIMIZADA
// ==========================================

class FAQManager {
  constructor() {
    this.scrollFeedbackTimeout = null;
  }

  // ==========================================
  // OPERACIONES PRINCIPALES
  // ==========================================

  addFAQ() {
    state.faqs.push({ question: '', answer: '' });
    this.renderFAQs();
    this.scheduleAutoSave();
  }

  duplicateFAQ(index) {
    const faqToDuplicate = state.faqs[index];
    const duplicatedFAQ = this.duplicateFAQWithSuffix(faqToDuplicate);
    
    state.faqs.splice(index + 1, 0, duplicatedFAQ);
    this.renderFAQs();
    this.updatePrompt();
    this.scheduleAutoSave();
  }

  removeFAQ(index) {
    if (confirm('¿Eliminar esta pregunta frecuente?')) {
      state.faqs.splice(index, 1);
      this.renderFAQs();
      this.updatePrompt();
      this.scheduleAutoSave();
    }
  }

  moveFAQ(index, direction) {
    const faqs = state.faqs;
    const newIndex = index + direction;
    
    if (newIndex >= 0 && newIndex < faqs.length) {
      [faqs[index], faqs[newIndex]] = [faqs[newIndex], faqs[index]];
      this.renderFAQs();
      this.updatePrompt();
      this.scheduleAutoSave();
    }
  }

  updateFAQ(index, field, value) {
    state.faqs[index][field] = value;
    TimingUtils.debounce('faqUpdate', () => {
      this.updatePrompt();
      this.scheduleAutoSave();
    }, 300);
  }

  // ==========================================
  // FUNCIONES DE SCROLL
  // ==========================================

  scrollToFAQInOutput() {
    const outputPanel = document.querySelector('.panel.output');
    const outputElement = document.getElementById('output');
    
    if (!outputPanel || !outputElement) {
      console.warn('No se encontró el panel de salida');
      return;
    }
    
    const outputContent = outputElement.innerHTML;
    const faqPattern = /<span class="output-section">Preguntas Frecuentes:<\/span>/i;
    const match = faqPattern.exec(outputContent);
    
    if (match) {
      this.scrollToMatch(outputPanel, outputElement, match);
      this.showFAQFeedback('Preguntas Frecuentes', true);
    } else {
      outputPanel.scrollTo({
        top: outputPanel.scrollHeight,
        behavior: 'smooth'
      });
      this.showFAQFeedback('Preguntas Frecuentes', false);
    }
  }

  // ==========================================
  // RENDERIZADO
  // ==========================================

  renderFAQs() {
    const container = document.getElementById('faq-container');
    container.innerHTML = state.faqs.map((faq, index) => 
      this.renderFAQ(faq, index, state.faqs.length)
    ).join('');

    // Aplicar auto-resize si está disponible
    if (window.autoResizeSystem) {
      setTimeout(() => window.autoResizeSystem.resizeAll(), 10);
    }
  }

  renderFAQ(faq, index, totalFAQs) {
    const faqControls = this.renderFAQControls(index, totalFAQs);
    
    return `
      <div class="list-item" style="flex-direction: column; align-items: stretch; background: var(--bg-tertiary); padding: 12px; border-radius: 6px; border: 1px solid var(--border-secondary); position: relative; margin-bottom: 12px;">
        ${faqControls}
        <button class="delete-btn" onclick="faqManager.removeFAQ(${index})">×</button>
        
        <label>Pregunta:</label>
        <input type="text" value="${TextUtils.escapeForAttribute(faq.question)}" placeholder="Pregunta frecuente..."
               oninput="faqManager.updateFAQ(${index}, 'question', this.value)" style="margin-bottom: 8px;">
        
        <label>Respuesta:</label>
        <textarea class="autoresize max-height" 
                  placeholder="Respuesta..." 
                  oninput="faqManager.updateFAQ(${index}, 'answer', this.value)">${TextUtils.escapeForInputValue(faq.answer)}</textarea>
      </div>
    `;
  }

  renderFAQControls(index, totalFAQs) {
    return `
      <div class="step-controls" style="position: absolute; top: 8px; right: 40px; display: flex; gap: 4px;">
        <button class="step-btn" onclick="faqManager.duplicateFAQ(${index})" title="Duplicar FAQ">📄</button>
        ${index > 0 ? `<button class="step-btn" onclick="faqManager.moveFAQ(${index}, -1)" title="Subir">↑</button>` : ''}
        ${index < totalFAQs - 1 ? `<button class="step-btn" onclick="faqManager.moveFAQ(${index}, 1)" title="Bajar">↓</button>` : ''}
        <button class="step-btn" onclick="faqManager.scrollToFAQInOutput()" title="Ir a las FAQ en el resultado" style="background: #f59e0b; color: white;">📍</button>
      </div>
    `;
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD PRIVADOS
  // ==========================================

  duplicateFAQWithSuffix(faq) {
    const duplicated = JSON.parse(JSON.stringify(faq));
    
    if (duplicated.question && duplicated.question.trim()) {
      duplicated.question = duplicated.question + " - Copia";
    }
    
    if (duplicated.answer && duplicated.answer.trim()) {
      duplicated.answer = duplicated.answer + " - Copia";
    }
    
    return duplicated;
  }

  scrollToMatch(outputPanel, outputElement, match) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = outputElement.innerHTML.substring(0, match.index);
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.fontFamily = outputElement.style.fontFamily || "'Consolas', 'Monaco', 'Courier New', monospace";
    tempDiv.style.fontSize = outputElement.style.fontSize || '14px';
    tempDiv.style.lineHeight = outputElement.style.lineHeight || '1.6';
    tempDiv.style.width = outputElement.offsetWidth + 'px';
    
    document.body.appendChild(tempDiv);
    const targetHeight = tempDiv.offsetHeight;
    document.body.removeChild(tempDiv);
    
    outputPanel.scrollTo({
      top: Math.max(0, targetHeight),
      behavior: 'smooth'
    });
  }

  showFAQFeedback(elementName, found = true) {
    // Limpiar timeout anterior
    if (this.scrollFeedbackTimeout) {
      clearTimeout(this.scrollFeedbackTimeout);
    }

    const outputPanel = document.querySelector('.panel.output');
    if (!outputPanel) return;
    
    const panelRect = outputPanel.getBoundingClientRect();
    const textPosition = panelRect.top + 30;
    const leftPosition = panelRect.left + 20;
    
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed; top: ${textPosition}px; left: ${leftPosition}px;
      background: ${found ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)'};
      color: white; padding: 8px 12px; border-radius: 6px; font-size: 11px; font-weight: 600;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); z-index: 1000; opacity: 0;
      transition: all 0.3s ease; max-width: 240px; text-align: left; line-height: 1.2;
      transform: translateY(-10px);
    `;
    
    feedback.innerHTML = `
      ${found ? '❓ <strong>Aquí:</strong>' : '🔍 <strong>No visible:</strong>'}<br>
      <span style="font-size: 10px;">${elementName}</span>
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.opacity = '1';
      feedback.style.transform = 'translateY(0)';
    }, 10);
    
    this.scrollFeedbackTimeout = setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 300);
    }, 3000);
  }

  updatePrompt() {
    if (window.updatePrompt) {
      window.updatePrompt();
    }
  }

  scheduleAutoSave() {
    if (window.scheduleAutoSave) {
      window.scheduleAutoSave();
    }
  }
}

// Instancia global
const faqManager = new FAQManager();

// Exportar globalmente
window.faqManager = faqManager;

// Configurar renderizado en RenderUtils
RenderUtils.renderFAQs = () => faqManager.renderFAQs();

// Funciones legacy para compatibilidad
window.addFAQ = () => faqManager.addFAQ();
window.duplicateFAQ = (index) => faqManager.duplicateFAQ(index);
window.removeFAQ = (index) => faqManager.removeFAQ(index);
window.moveFAQ = (index, direction) => faqManager.moveFAQ(index, direction);
window.updateFAQ = (index, field, value) => faqManager.updateFAQ(index, field, value);
window.scrollToFAQInOutput = () => faqManager.scrollToFAQInOutput();
window.renderFAQs = () => faqManager.renderFAQs();
function moveFAQ(index, direction) {
  const faqs = state.faqs;
  const newIndex = index + direction;
  
  if (newIndex >= 0 && newIndex < faqs.length) {
    // Intercambiar FAQs
    [faqs[index], faqs[newIndex]] = [faqs[newIndex], faqs[index]];
    
    // Re-renderizar
    renderFAQs();
    updatePrompt();
    scheduleAutoSave();
  }
}// ==========================================
// GESTIÓN DE FAQ
// ==========================================
function addFAQ() {
  state.faqs.push({ question: '', answer: '' });
  renderFAQs();
  scheduleAutoSave();
}

function removeFAQ(index) {
  if (confirm('¿Eliminar esta pregunta frecuente?')) {
    state.faqs.splice(index, 1);
    renderFAQs();
    updatePrompt();
    scheduleAutoSave();
  }
}

function updateFAQ(index, field, value) {
  state.faqs[index][field] = value;
  // Usar debounce para evitar llamadas excesivas
  clearTimeout(window.faqTimeout);
  window.faqTimeout = setTimeout(() => {
    updatePrompt();
    scheduleAutoSave();
  }, 300);
}

function renderFAQs() {
  const container = document.getElementById('faq-container');
  container.innerHTML = state.faqs.map((faq, index) => `
    <div class="list-item" style="flex-direction: column; align-items: stretch; background: var(--bg-tertiary); padding: 12px; border-radius: 6px; border: 1px solid var(--border-secondary); position: relative; margin-bottom: 12px;">
      <div class="step-controls" style="position: absolute; top: 8px; right: 40px; display: flex; gap: 4px;">
        ${index > 0 ? `<button class="step-btn" onclick="moveFAQ(${index}, -1)" title="Subir">↑</button>` : ''}
        ${index < state.faqs.length - 1 ? `<button class="step-btn" onclick="moveFAQ(${index}, 1)" title="Bajar">↓</button>` : ''}
      </div>
      <button class="delete-btn" onclick="removeFAQ(${index})">×</button>
      <label>Pregunta:</label>
      <input type="text" value="${escapeHtml(faq.question)}" placeholder="Pregunta frecuente..."
             oninput="updateFAQ(${index}, 'question', this.value)" style="margin-bottom: 8px;">
      <label>Respuesta:</label>
      <textarea placeholder="Respuesta..." oninput="updateFAQ(${index}, 'answer', this.value)">${escapeHtml(faq.answer)}</textarea>
    </div>
  `).join('');
}
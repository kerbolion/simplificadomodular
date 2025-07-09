// ==========================================
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
  updatePrompt();
  scheduleAutoSave();
}

function renderFAQs() {
  const container = document.getElementById('faq-container');
  container.innerHTML = state.faqs.map((faq, index) => `
    <div class="list-item" style="flex-direction: column; align-items: stretch; background: var(--bg-tertiary); padding: 12px; border-radius: 6px; border: 1px solid var(--border-secondary); position: relative; margin-bottom: 12px;">
      <button class="delete-btn" onclick="removeFAQ(${index})">×</button>
      <label>Pregunta:</label>
      <input type="text" value="${escapeHtml(faq.question)}" placeholder="Pregunta frecuente..."
             oninput="updateFAQ(${index}, 'question', this.value)" style="margin-bottom: 8px;">
      <label>Respuesta:</label>
      <textarea placeholder="Respuesta..." oninput="updateFAQ(${index}, 'answer', this.value)">${escapeHtml(faq.answer)}</textarea>
    </div>
  `).join('');
}
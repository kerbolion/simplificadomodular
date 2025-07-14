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
}

// ==========================================
// FUNCIÓN DE SCROLL A FAQ EN EL OUTPUT
// ==========================================
function scrollToFAQInOutput() {
  const outputPanel = document.querySelector('.panel.output');
  const outputElement = document.getElementById('output');
  
  if (!outputPanel || !outputElement) {
    console.warn('No se encontró el panel de salida');
    return;
  }
  
  // Buscar el texto de FAQ en el output
  const outputContent = outputElement.innerHTML;
  const faqPattern = /<span class="output-section">Preguntas Frecuentes:<\/span>/i;
  const match = faqPattern.exec(outputContent);
  
  if (match) {
    // Crear un elemento temporal para medir la posición
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = outputContent.substring(0, match.index);
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.fontFamily = outputElement.style.fontFamily || "'Consolas', 'Monaco', 'Courier New', monospace";
    tempDiv.style.fontSize = outputElement.style.fontSize || '14px';
    tempDiv.style.lineHeight = outputElement.style.lineHeight || '1.6';
    tempDiv.style.width = outputElement.offsetWidth + 'px';
    
    document.body.appendChild(tempDiv);
    
    // Calcular la altura hasta las FAQs
    const targetHeight = tempDiv.offsetHeight;
    
    // Limpiar elemento temporal
    document.body.removeChild(tempDiv);
    
    // Hacer scroll al panel - FAQs al inicio
    outputPanel.scrollTo({
      top: Math.max(0, targetHeight),
      behavior: 'smooth'
    });
    
    // Mostrar feedback visual
    showFAQFeedback('Preguntas Frecuentes', true);
  } else {
    // Si no se encuentran FAQs, hacer scroll al final
    outputPanel.scrollTo({
      top: outputPanel.scrollHeight,
      behavior: 'smooth'
    });
    
    // Mostrar feedback visual
    showFAQFeedback('Preguntas Frecuentes', false);
  }
}

// Función de feedback específica para FAQs
function showFAQFeedback(elementName, found = true) {
  const outputPanel = document.querySelector('.panel.output');
  if (!outputPanel) return;
  
  // Calcular la posición del panel
  const panelRect = outputPanel.getBoundingClientRect();
  
  // Posicionar la notificación DENTRO del panel derecho, en el borde izquierdo
  const textPosition = panelRect.top + 30;
  const leftPosition = panelRect.left + 20;
  
  // Crear elemento de feedback
  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed;
    top: ${textPosition}px;
    left: ${leftPosition}px;
    background: ${found ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)'};
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    opacity: 0;
    transition: all 0.3s ease;
    max-width: 240px;
    text-align: left;
    line-height: 1.2;
    transform: translateY(-10px);
  `;
  
  // Sin flecha, ya que está dentro del panel
  feedback.innerHTML = `
    ${found ? '❓ <strong>Aquí:</strong>' : '🔍 <strong>No visible:</strong>'}<br><span style="font-size: 10px;">${elementName}</span>
  `;
  
  document.body.appendChild(feedback);
  
  // Animar entrada
  setTimeout(() => {
    feedback.style.opacity = '1';
    feedback.style.transform = 'translateY(0)';
  }, 10);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    feedback.style.opacity = '0';
    feedback.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 300);
  }, 3000);
}

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
        <button class="step-btn" onclick="scrollToFAQInOutput()" title="Ir a las FAQ en el resultado" style="background: #f59e0b; color: white;">📍</button>
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
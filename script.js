const START_DATE = "2026-08-03"; 
const TOTAL_DAYS = 30;

let completedDays = JSON.parse(localStorage.getItem('ramadan_completed_days')) || [];
let activeDaySelected = null;

const welcomeScreen = document.getElementById('welcomeScreen');
const startBtn = document.getElementById('startBtn');
const appContainer = document.getElementById('appContainer');
const cardsGrid = document.getElementById('cardsGrid');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const modalOverlay = document.querySelector('.modal-overlay');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.getElementById('closeBtn');

function initApp() {
  checkFirstVisit();
  renderGrid();
  updateProgress();
  setupEventListeners();
}

function checkFirstVisit() {
  const hasVisited = localStorage.getItem('ramadan_has_visited');
  if (hasVisited) {
    if (welcomeScreen) welcomeScreen.classList.add('hidden');
    if (appContainer) appContainer.classList.remove('hidden');
  } else {
    if (welcomeScreen) welcomeScreen.classList.remove('hidden');
    if (appContainer) appContainer.classList.add('hidden');
  }
}

function isDayUnlocked(dayNumber) {
  const startDate = new Date(START_DATE);
  startDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = today - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return dayNumber <= diffDays;
}

function renderGrid() {
  if (!cardsGrid) return;
  cardsGrid.innerHTML = '';

  const startDate = new Date(START_DATE);
  startDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = today - startDate;
  const currentDayNum = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  for (let i = 1; i <= TOTAL_DAYS; i++) {
    const card = document.createElement('div');
    card.classList.add('card');

    const unlocked = isDayUnlocked(i);
    const isCompleted = completedDays.includes(i);
    const isToday = (i === currentDayNum);

    if (isToday) card.classList.add('active-day');
    if (isCompleted) card.classList.add('completed');

    let dayData = null;
    if (typeof ramadanData !== 'undefined') {
      if (Array.isArray(ramadanData)) {
        dayData = ramadanData.find(d => d.day === i);
      } else {
        dayData = ramadanData[i];
      }
    }

    const cardTitle = dayData && dayData.title ? dayData.title : `Jour ${i}`;

    if (!unlocked) {
      card.style.opacity = '0.5';
      card.style.cursor = 'not-allowed';
      card.innerHTML = `
        <span class="card-number">${i}</span>
        <span class="card-title">Verrouillé</span>
        <span class="status-badge">🔒</span>
      `;
    } else {
      card.innerHTML = `
        <span class="card-number">${i}</span>
        <span class="card-title">${cardTitle}</span>
        ${isCompleted ? '<span class="status-badge">✓</span>' : ''}
      `;
      card.onclick = () => handleDayClick(i);
    }

    cardsGrid.appendChild(card);
  }
}

function updateProgress() {
  const count = completedDays.length;
  const percentage = (count / TOTAL_DAYS) * 100;
  if (progressBar) progressBar.style.width = `${percentage}%`;
  if (progressText) progressText.textContent = `${count} / ${TOTAL_DAYS} accomplis`;
}

// Règle d'ouverture : J1 avant, les autres normalement
function handleDayClick(dayNumber) {
  activeDaySelected = dayNumber;

  if (dayNumber === 1) {
    const goalsSaved = localStorage.getItem("ramadan_goals");
    if (!goalsSaved) {
      showGoalSettingModal();
      return;
    }
  }

  openStandardDayModal(dayNumber);
}

function showGoalSettingModal() {
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="modal-section">
        <h3>🎯 Tes objectifs du Ramadan</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 15px;">Fixe 3 objectifs pour guider ton mois.</p>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
          <input type="text" id="g1" placeholder="Objectif 1..." />
          <input type="text" id="g2" placeholder="Objectif 2..." />
          <input type="text" id="g3" placeholder="Objectif 3..." />
        </div>
      </div>
      <button id="saveGoalsBtn" class="validate-btn">Valider et commencer ✨</button>
    `;

    document.getElementById("saveGoalsBtn").onclick = () => {
      const g1 = document.getElementById("g1").value.trim();
      const g2 = document.getElementById("g2").value.trim();
      const g3 = document.getElementById("g3").value.trim();

      if (!g1 || !g2 || !g3) {
        alert("Merci de remplir les 3 objectifs.");
        return;
      }

      localStorage.setItem("ramadan_goals", JSON.stringify([g1, g2, g3]));
      openStandardDayModal(1);
    };
  }
  if (modalOverlay) modalOverlay.classList.add('active');
}

function showDay15CheckinModal(goals) {
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="modal-section">
        <h3>🌙 Mi-parcours (Jour 15)</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px;">Rappel de tes objectifs :</p>
        <ul style="text-align: left; font-size: 0.9rem; color: #e2e8f0; padding-left: 20px; margin-bottom: 15px; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px;">
          <li>${goals[0] || 'N/A'}</li>
          <li>${goals[1] || 'N/A'}</li>
          <li>${goals[2] || 'N/A'}</li>
        </ul>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Accroche-toi pour la seconde moitié !</p>
      </div>
      <button id="continueDay15Btn" class="validate-btn">Valider le Jour 15 ✓</button>
    `;

    document.getElementById("continueDay15Btn").onclick = () => {
      if (!completedDays.includes(15)) completedDays.push(15);
      localStorage.setItem('ramadan_completed_days', JSON.stringify(completedDays));
      updateProgress();
      renderGrid();
      closeModal();
    };
  }
  if (modalOverlay) modalOverlay.classList.add('active');
}

function showDay30FinalModal(goals) {
  const savedFeedback = localStorage.getItem("ramadan_final_feedback") || "";
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="modal-section">
        <h3>✨ Bilan Final (Jour 30)</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px;">Tes objectifs de départ :</p>
        <ul style="text-align: left; font-size: 0.9rem; color: #e2e8f0; padding-left: 20px; margin-bottom: 12px; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px;">
          <li>${goals[0] || 'N/A'}</li>
          <li>${goals[1] || 'N/A'}</li>
          <li>${goals[2] || 'N/A'}</li>
        </ul>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 8px;">Laisse un mot sur ton expérience :</p>
        <textarea id="final-feedback" rows="3" placeholder="Ton ressenti...">${savedFeedback}</textarea>
      </div>
      <button id="saveFeedbackBtn" class="validate-btn">Terminer l'aventure ✨</button>
    `;

    document.getElementById("saveFeedbackBtn").onclick = () => {
      const feedback = document.getElementById("final-feedback").value;
      localStorage.setItem("ramadan_final_feedback", feedback);
      if (!completedDays.includes(30)) completedDays.push(30);
      localStorage.setItem('ramadan_completed_days', JSON.stringify(completedDays));
      updateProgress();
      renderGrid();
      closeModal();
    };
  }
  if (modalOverlay) modalOverlay.classList.add('active');
}

function openStandardDayModal(dayNumber) {
  let dayData = null;
  if (typeof ramadanData !== 'undefined') {
    if (Array.isArray(ramadanData)) {
      dayData = ramadanData.find(d => d.day === dayNumber);
    } else {
      dayData = ramadanData[dayNumber];
    }
  }

  if (!dayData) {
    dayData = {
      title: "En cours d'écriture...",
      theme: "Méditation",
      quranLink: { surah: "Bientôt disponible", arabic: "", translation: "Bientôt disponible." },
      hadith: "Patiente un instant.",
      reflection: "Chemin de sérénité.",
      challenge: "Prends une pause."
    };
  }

  if (modalBody) {
    modalBody.innerHTML = `
      <div class="modal-section">
        <h3>Jour ${dayNumber} : ${dayData.title}</h3>
        <p class="subtitle" style="font-size: 0.75rem; margin-bottom: 15px;">✨ ${dayData.theme}</p>
        
        ${dayData.quranLink ? `
          <div class="modal-section">
            <span style="font-size: 0.75rem; color: var(--accent-gold); font-weight: bold; display: block; margin-bottom: 4px;">📖 ${dayData.quranLink.surah}</span>
            <p class="arabic-text">${dayData.quranLink.arabic}</p>
            <p style="font-size: 0.8rem; color: #e2e8f0; font-style: italic;">« ${dayData.quranLink.translation} »</p>
          </div>
        ` : ''}

        ${dayData.hadith ? `
          <div class="modal-section">
            <strong style="color: var(--accent-gold); font-size: 0.75rem; display: block; margin-bottom: 3px;">Hadith</strong>
            <p style="color: #cbd5e1; font-size: 0.8rem;">${dayData.hadith}</p>
          </div>
        ` : ''}

        ${dayData.reflection ? `
          <div class="modal-section">
            <strong style="color: var(--accent-gold); font-size: 0.75rem; display: block; margin-bottom: 3px;">Réflexion</strong>
            <p style="line-height: 1.5; color: #cbd5e1; font-size: 0.85rem;">${dayData.reflection}</p>
          </div>
        ` : ''}

        ${dayData.challenge ? `
          <div class="modal-section" style="background: rgba(34, 197, 94, 0.06); border: 1px solid rgba(34, 197, 94, 0.2); padding: 10px 12px; border-radius: 8px;">
            <strong style="color: #22c55e; font-size: 0.75rem; display: block; margin-bottom: 3px;">💡 Défi du jour</strong>
            <p style="color: #e2e8f0; font-size: 0.85rem;">${dayData.challenge}</p>
          </div>
        ` : ''}
      </div>

      <button id="validateDayBtn" class="validate-btn">
        ${completedDays.includes(dayNumber) ? "Marquer comme non accompli" : "Valider ce jour ✓"}
      </button>
    `;

    document.getElementById('validateDayBtn').onclick = toggleDayValidation;
  }
  if (modalOverlay) modalOverlay.classList.add('active');
}

// Règle de validation : J15 et J30 affichent leur modale après clic sur valider
function toggleDayValidation() {
  if (!activeDaySelected) return;

  if (activeDaySelected === 15) {
    const goals = JSON.parse(localStorage.getItem("ramadan_goals") || "[]");
    showDay15CheckinModal(goals);
    return;
  }

  if (activeDaySelected === 30) {
    const goals = JSON.parse(localStorage.getItem("ramadan_goals") || "[]");
    showDay30FinalModal(goals);
    return;
  }

  if (completedDays.includes(activeDaySelected)) {
    completedDays = completedDays.filter(d => d !== activeDaySelected);
  } else {
    completedDays.push(activeDaySelected);
  }

  localStorage.setItem('ramadan_completed_days', JSON.stringify(completedDays));
  updateProgress();
  renderGrid();
  closeModal();
}

function closeModal() {
  if (modalOverlay) modalOverlay.classList.remove('active');
}

function setupEventListeners() {
  if (startBtn) {
    startBtn.onclick = () => {
      localStorage.setItem('ramadan_has_visited', 'true');
      if (welcomeScreen) welcomeScreen.classList.add('hidden');
      if (appContainer) appContainer.classList.remove('hidden');
    };
  }

  if (closeBtn) {
    closeBtn.onclick = closeModal;
  }

  if (modalOverlay) {
    modalOverlay.onclick = (e) => {
      if (e.target === modalOverlay) closeModal();
    };
  }
}

document.addEventListener('DOMContentLoaded', initApp);

document.addEventListener('DOMContentLoaded', () => {
    checkBirthdayTrigger();
});

function checkBirthdayTrigger() {
    const today = new Date();
    /*const month = today.getMonth() + 1; // Les mois commencent à 0 en JS (0 = janvier, 1 = février)
    const day = today.getDate();*/

    // Date cible : 12 Février (Mois 2, Jour 12)
    const month = 11; // 11 pour novembre
    const day = 7;    // 7 pour aujourd'hui
    const isBirthday = (month === 11 && day === 7); // ou (month === 11 && day === 7) pour tester
    
    // Vérifier si la surprise a déjà été montrée aujourd'hui
    const hasBeenShown = localStorage.getItem('birthdayShown_2026');

    if (isBirthday && !hasBeenShown) {
        showBirthdayModal();
    }
}

function showBirthdayModal() {
    const modal = document.getElementById('birthday-modal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Marquer comme affiché pour ne plus réapparaître
        localStorage.setItem('birthdayShown_2026', 'true');
        
        // Gestion de la fermeture
        const closeBtn = document.getElementById('close-birthday');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }
    }
}
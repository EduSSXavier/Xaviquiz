/**
 * NeonQuiz - Sistema de Quizzes Futurista
 * GitHub Pages ready · HTML + Vanilla JS
 */

(function () {
  'use strict';

  // ===== STATE =====
  const state = {
    quizzesMeta: [],
    currentQuiz: null,
    currentQuizId: null,
    currentIndex: 0,
    answers: [],       // index of selected option per question (or null)
    showFeedback: false
  };

  // ===== DOM =====
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const screens = {
    home: $('#home-screen'),
    quiz: $('#quiz-screen'),
    results: $('#results-screen'),
    error: $('#error-screen')
  };

  const els = {
    quizList: $('#quiz-list'),
    quizTitle: $('#quiz-title'),
    progressText: $('#progress-text'),
    progressPercent: $('#progress-percent'),
    progressFill: $('#progress-fill'),
    questionNumber: $('#question-number'),
    questionText: $('#question-text'),
    optionsList: $('#options-list'),
    btnPrev: $('#btn-prev'),
    btnNext: $('#btn-next'),
    resultsIcon: $('#results-icon'),
    resultsTitle: $('#results-title'),
    resultsScore: $('#results-score'),
    resultsMessage: $('#results-message'),
    statCorrect: $('#stat-correct'),
    statIncorrect: $('#stat-incorrect'),
    btnRetry: $('#btn-retry'),
    btnHome: $('#btn-home'),
    btnErrorHome: $('#btn-error-home'),
    reviewSection: $('#review-section'),
    reviewList: $('#review-list'),
    errorMessage: $('#error-message'),
    year: $('#year')
  };

  // ===== UTILITIES =====
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    if (screens[name]) screens[name].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getQueryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }

  function setQueryParam(key, value) {
    const url = new URL(window.location);
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
    history.replaceState(null, '', url);
  }

  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ===== LOAD DATA =====
  async function loadMainJson() {
    try {
      const res = await fetch('quizzes/main.json');
      if (!res.ok) throw new Error('Falha ao carregar lista de quizzes');
      const data = await res.json();
      state.quizzesMeta = data.quizzes || [];
      return state.quizzesMeta;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async function loadQuiz(file) {
    try {
      const res = await fetch(`quizzes/${file}`);
      if (!res.ok) throw new Error(`Quiz "${file}" não encontrado`);
      const data = await res.json();
      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('Quiz sem questões válidas');
      }
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // ===== HOME =====
  function renderQuizList() {
    if (!state.quizzesMeta.length) {
      els.quizList.innerHTML = `
        <div class="error-state">
          <p>Nenhum quiz disponível no momento.</p>
        </div>`;
      return;
    }

    els.quizList.innerHTML = state.quizzesMeta.map(q => `
      <article class="quiz-card" tabindex="0" role="button" data-id="${q.id}" data-file="${q.file}" aria-label="Iniciar quiz: ${q.title}">
        <span class="quiz-card-icon">${q.icon || '📘'}</span>
        <h3 class="quiz-card-title">${q.title}</h3>
        <p class="quiz-card-desc">${q.description || ''}</p>
        <div class="quiz-card-meta">
          <span class="difficulty">${q.difficulty || 'Geral'}</span>
        </div>
      </article>
    `).join('');

    els.quizList.querySelectorAll('.quiz-card').forEach(card => {
      card.addEventListener('click', () => startQuizById(card.dataset.id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startQuizById(card.dataset.id);
        }
      });
    });
  }

  // ===== QUIZ FLOW =====
  async function startQuizById(id) {
    const meta = state.quizzesMeta.find(q => q.id === id);
    if (!meta) {
      showError(`Quiz com id "${id}" não encontrado.`);
      return;
    }
    await startQuiz(meta);
  }

  async function startQuiz(meta) {
    try {
      showScreen('home'); // keep current while loading
      els.quizList.innerHTML = `
        <div class="loading">
          <div class="spinner"></div>
          <p>Carregando quiz...</p>
        </div>`;

      const quizData = await loadQuiz(meta.file);

      state.currentQuiz = quizData;
      state.currentQuizId = meta.id;
      state.currentIndex = 0;
      state.answers = new Array(quizData.questions.length).fill(null);
      state.showFeedback = false;

      setQueryParam('quiz', meta.id);
      renderQuestion();
      showScreen('quiz');
    } catch (err) {
      showError(err.message || 'Erro ao carregar o quiz.');
    }
  }

  function renderQuestion() {
    const quiz = state.currentQuiz;
    const idx = state.currentIndex;
    const q = quiz.questions[idx];
    const total = quiz.questions.length;
    const selected = state.answers[idx];

    els.quizTitle.textContent = quiz.title;
    els.progressText.textContent = `Pergunta ${idx + 1} de ${total}`;
    const percent = Math.round(((idx) / total) * 100);
    els.progressPercent.textContent = `${percent}%`;
    els.progressFill.style.width = `${percent}%`;

    els.questionNumber.textContent = `Pergunta ${String(idx + 1).padStart(2, '0')}`;
    els.questionText.textContent = q.question;

    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    els.optionsList.innerHTML = q.options.map((opt, i) => {
      let cls = 'option-btn';
      if (selected === i) cls += ' selected';
      return `
        <button class="${cls}" data-index="${i}" ${selected !== null ? 'disabled' : ''}>
          <span class="option-letter">${letters[i] || (i + 1)}</span>
          <span class="option-text">${opt}</span>
        </button>`;
    }).join('');

    // Attach option listeners only if not yet answered
    if (selected === null) {
      els.optionsList.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => selectOption(parseInt(btn.dataset.index, 10)));
      });
    }

    // Buttons state
    els.btnPrev.disabled = idx === 0;
    const isLast = idx === total - 1;
    const hasAnswer = selected !== null;

    if (isLast && hasAnswer) {
      els.btnNext.textContent = 'Ver Resultado →';
      els.btnNext.disabled = false;
    } else {
      els.btnNext.textContent = 'Próxima →';
      els.btnNext.disabled = !hasAnswer;
    }
  }

  function selectOption(optionIndex) {
    if (state.answers[state.currentIndex] !== null) return; // already answered

    state.answers[state.currentIndex] = optionIndex;
    renderQuestion(); // re-render to show selection & enable next
  }

  function goNext() {
    const total = state.currentQuiz.questions.length;
    if (state.currentIndex < total - 1) {
      state.currentIndex++;
      renderQuestion();
    } else {
      // last question → results
      showResults();
    }
  }

  function goPrev() {
    if (state.currentIndex > 0) {
      state.currentIndex--;
      renderQuestion();
    }
  }

  // ===== RESULTS =====
  function showResults() {
    const quiz = state.currentQuiz;
    const total = quiz.questions.length;
    let correct = 0;
    const wrongs = [];

    quiz.questions.forEach((q, i) => {
      const userAns = state.answers[i];
      if (userAns === q.correct) {
        correct++;
      } else {
        wrongs.push({
          question: q.question,
          userAnswer: userAns !== null ? q.options[userAns] : '(sem resposta)',
          correctAnswer: q.options[q.correct]
        });
      }
    });

    const incorrect = total - correct;
    const percent = Math.round((correct / total) * 100);

    // Icon & message
    let icon = '🏆';
    let title = 'Excelente!';
    let message = 'Você dominou o assunto.';

    if (percent >= 90) {
      icon = '🏆';
      title = 'Excelente!';
      message = 'Desempenho excepcional. Você realmente conhece o tema!';
    } else if (percent >= 70) {
      icon = '🎯';
      title = 'Muito Bom!';
      message = 'Bom domínio do conteúdo. Continue praticando!';
    } else if (percent >= 50) {
      icon = '📚';
      title = 'Bom esforço!';
      message = 'Você está no caminho certo. Revise os pontos que errou.';
    } else {
      icon = '💡';
      title = 'Continue estudando!';
      message = 'Não desanime. Cada tentativa é um aprendizado.';
    }

    els.resultsIcon.textContent = icon;
    els.resultsTitle.textContent = title;
    els.resultsScore.textContent = `${percent}%`;
    els.resultsMessage.textContent = message;
    els.statCorrect.textContent = correct;
    els.statIncorrect.textContent = incorrect;

    // Review section
    if (wrongs.length > 0) {
      els.reviewSection.style.display = 'block';
      els.reviewList.innerHTML = wrongs.map(w => `
        <div class="review-item">
          <p class="q-text">${w.question}</p>
          <p class="your-answer">Sua resposta: ${w.userAnswer}</p>
          <p class="correct-answer">Resposta correta: ${w.correctAnswer}</p>
        </div>
      `).join('');
    } else {
      els.reviewSection.style.display = 'none';
      els.reviewList.innerHTML = '';
    }

    // Final progress
    els.progressFill.style.width = '100%';
    els.progressPercent.textContent = '100%';

    showScreen('results');
  }

  function retryQuiz() {
    if (!state.currentQuizId) return;
    const meta = state.quizzesMeta.find(q => q.id === state.currentQuizId);
    if (meta) startQuiz(meta);
  }

  function goHome() {
    setQueryParam('quiz', null);
    state.currentQuiz = null;
    state.currentQuizId = null;
    state.currentIndex = 0;
    state.answers = [];
    renderQuizList();
    showScreen('home');
  }

  function showError(msg) {
    els.errorMessage.textContent = msg || 'Ocorreu um erro inesperado.';
    showScreen('error');
  }

  // ===== INIT =====
  async function init() {
    els.year.textContent = new Date().getFullYear();

    // Event listeners
    els.btnNext.addEventListener('click', goNext);
    els.btnPrev.addEventListener('click', goPrev);
    els.btnRetry.addEventListener('click', retryQuiz);
    els.btnHome.addEventListener('click', goHome);
    els.btnErrorHome.addEventListener('click', goHome);

    // Keyboard navigation during quiz
    document.addEventListener('keydown', (e) => {
      if (!screens.quiz.classList.contains('active')) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (!els.btnNext.disabled) goNext();
      } else if (e.key === 'ArrowLeft') {
        if (!els.btnPrev.disabled) goPrev();
      }
    });

    try {
      await loadMainJson();
      renderQuizList();

      // Direct access via ?quiz=id
      const quizParam = getQueryParam('quiz');
      if (quizParam) {
        await startQuizById(quizParam);
      }
    } catch (err) {
      showError('Não foi possível carregar a lista de quizzes. Verifique se o arquivo quizzes/main.json existe.');
    }
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

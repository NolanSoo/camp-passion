// Race to Survive - JavaScript version (converted from TypeScript)
// All features included, minimal changes for browser compatibility

// --- MODERN FEATURE-RICH LOGIC INTEGRATION ---
// --- GLOBAL STATE ---
let quizData = [];
let quizCurrentQuestion = 0;
let quizScore = 0;
let quizTimer = null;
let quizTimeLeft = 0;
let quizStreak = 0;
let studyMode = null;
let powerUps = { extraTime: false, skip: false, hint: false };
let usedPowerUps = { extraTime: false, skip: false, hint: false };
let unlockedPowerUps = false;
let quizSettings = {};
let liveStrengthsArr = [];
let liveWeaknessesArr = [];

// --- DOM ELEMENTS (for new features) ---
const inputFormSection = document.getElementById('input-form');
const powerUpsDiv = document.getElementById('power-ups');

// --- LOADING OVERLAY & AI TIP ---
async function showLoadingWithTip(topic) {
  loadingOverlay.classList.remove('hidden');
  document.getElementById('loading-tip').textContent = 'Tip: ' + await fetchAITip(topic);
}
function hideLoading() {
  loadingOverlay.classList.add('hidden');
}
async function fetchAITip(topic) {
  // Simulate AI tip fetch (replace with real API if needed)
  const tips = [
    `Focus on key terms in ${topic}.`,
    `Practice with a timer for ${topic}.`,
    `Review mistakes to improve in ${topic}.`,
    `Break down complex ${topic} concepts.`,
    `Use process of elimination for tough questions.`
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

// --- QUIZ GENERATION (SIMULATED for new features) ---
async function generateQuiz(settings) {
  // Simulate API call for quiz generation
  const questions = [];
  for (let i = 0; i < settings.numQuestions; i++) {
    const isMC = Math.random() > settings.shortAnswerPercent / 100;
    if (isMC) {
      // MC: 6-8 options, 1-2 correct, 2-3 plausible, rest far-off
      const correct = [`Correct Answer ${i+1}`];
      const plausible = [`Plausible ${i+1}A`, `Plausible ${i+1}B`];
      const far = [`Far ${i+1}A`, `Far ${i+1}B`, `Far ${i+1}C`];
      const options = [...correct, ...plausible, ...far].sort(() => Math.random() - 0.5);
      questions.push({
        type: 'mc',
        question: `Sample MC Question ${i+1} about ${settings.topic}?`,
        options,
        correct,
        plausible,
        far
      });
    } else {
      questions.push({
        type: 'short',
        question: `Sample Short Answer Question ${i+1} about ${settings.topic}?`,
        answer: `Sample answer ${i+1}`
      });
    }
  }
  return questions;
}

// --- MODERN QUESTION DISPLAY (for new features) ---
function showQuestion() {
  if (quizCurrentQuestion >= quizData.length) {
    showResults();
    return;
  }
  const q = quizData[quizCurrentQuestion];
  questionNumberSpan.textContent = `${quizCurrentQuestion + 1} / ${quizData.length}`;
  userTestForm.innerHTML = '';
  questionFeedback.textContent = '';
  submitTestBtn.style.display = '';
  if (q.type === 'mc') {
    q.options.forEach((opt, idx) => {
      const label = document.createElement('label');
      label.className = 'mc-option';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'mc';
      input.value = opt;
      label.appendChild(input);
      label.appendChild(document.createTextNode(opt));
      userTestForm.appendChild(label);
      userTestForm.appendChild(document.createElement('br'));
    });
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'short';
    input.required = true;
    userTestForm.appendChild(input);
  }
  // Timer
  startTimer(30);
  // Power-ups
  renderPowerUps();
  // Study mode modal after 5 questions
  if (quizCurrentQuestion === 5 && !studyMode) {
    showStudyModeModal();
  }
}

// --- TIMER (for new features) ---
function startTimer(seconds) {
  clearInterval(quizTimer);
  quizTimeLeft = seconds;
  timerSpan.textContent = `⏰ ${quizTimeLeft}s`;
  quizTimer = setInterval(() => {
    quizTimeLeft--;
    timerSpan.textContent = `⏰ ${quizTimeLeft}s`;
    if (quizTimeLeft <= 0) {
      clearInterval(quizTimer);
      gradeCurrentQuestion(true);
    }
  }, 1000);
}

// --- GRADING (for new features) ---
function gradeCurrentQuestion(timeout = false) {
  clearInterval(quizTimer);
  const q = quizData[quizCurrentQuestion];
  let points = 0;
  let feedback = '';
  if (q.type === 'mc') {
    const selected = Array.from(userTestForm.querySelectorAll('input[name="mc"]:checked')).map(i => i.value);
    let correctCount = 0, plausibleCount = 0, farCount = 0;
    selected.forEach(val => {
      if (q.correct.includes(val)) correctCount++;
      else if (q.plausible.includes(val)) plausibleCount++;
      else if (q.far.includes(val)) farCount++;
    });
    points = correctCount * 2 + plausibleCount * 1 - farCount * 1;
    if (points < 0) points = 0;
    feedback = `+${points} (${correctCount} correct, ${plausibleCount} plausible, ${farCount} far-off)`;
    if (correctCount === q.correct.length && farCount === 0) {
      quizStreak++;
      liveStrengthsArr.push(q.question);
    } else {
      quizStreak = 0;
      liveWeaknessesArr.push(q.question);
    }
  } else {
    const val = userTestForm.querySelector('input[name="short"]').value.trim();
    if (val.toLowerCase() === q.answer.toLowerCase()) {
      points = 3;
      feedback = '+3 (Perfect!)';
      quizStreak++;
      liveStrengthsArr.push(q.question);
    } else if (val && q.answer.toLowerCase().includes(val.toLowerCase().slice(0, 3))) {
      points = 1;
      feedback = '+1 (Partial)';
      quizStreak = 0;
      liveWeaknessesArr.push(q.question);
    } else {
      points = 0;
      feedback = '0 (Missed)';
      quizStreak = 0;
      liveWeaknessesArr.push(q.question);
    }
  }
  if (timeout) feedback = '⏰ Time up! ' + feedback;
  quizScore += points;
  questionFeedback.textContent = feedback;
  liveScore.textContent = `Score: ${quizScore}`;
  // Unlock power-ups if streak
  if (quizStreak >= 3 && !unlockedPowerUps) {
    unlockedPowerUps = true;
    showPowerUpsModal();
  }
  // Next question after delay
  submitTestBtn.style.display = 'none';
  setTimeout(() => {
    quizCurrentQuestion++;
    showQuestion();
  }, 1200);
}

// --- STUDY MODES (for new features) ---
function showStudyModeModal() {
  // Simple prompt for demo; replace with modal if needed
  const mode = prompt('Choose Study Mode: 1) Speed Run 2) Focus Mode 3) Double Points', '1');
  if (mode === '1') studyMode = 'speed';
  else if (mode === '2') studyMode = 'focus';
  else if (mode === '3') studyMode = 'double';
  else studyMode = null;
}

// --- POWER-UPS (for new features) ---
function showPowerUpsModal() {
  alert('Power-ups unlocked! Use them wisely: Extra Time, Skip, Hint.');
}
function renderPowerUps() {
  let container = powerUpsDiv;
  if (!container) {
    container = document.createElement('div');
    container.id = 'power-ups';
    container.className = 'power-ups';
    testSection.insertBefore(container, userTestForm);
  }
  container.innerHTML = '';
  ['extraTime', 'skip', 'hint'].forEach(pu => {
    const btn = document.createElement('button');
    btn.textContent = pu === 'extraTime' ? '⏳ Extra Time' : pu === 'skip' ? '⏭️ Skip' : '💡 Hint';
    btn.className = 'power-up-btn';
    btn.disabled = !unlockedPowerUps || usedPowerUps[pu];
    btn.onclick = () => usePowerUp(pu);
    container.appendChild(btn);
  });
}
function usePowerUp(type) {
  if (!unlockedPowerUps || usedPowerUps[type]) return;
  usedPowerUps[type] = true;
  if (type === 'extraTime') {
    quizTimeLeft += 15;
    timerSpan.textContent = `⏰ ${quizTimeLeft}s (+15!)`;
  } else if (type === 'skip') {
    questionFeedback.textContent = 'Skipped!';
    setTimeout(() => {
      quizCurrentQuestion++;
      showQuestion();
    }, 800);
    return;
  } else if (type === 'hint') {
    questionFeedback.textContent = 'Hint: Focus on the main concept!';
  }
  renderPowerUps();
}

// --- RESULTS (for new features) ---
function showResults() {
  testSection.style.display = 'none';
  resultsSection.style.display = '';
  scoreFeedback.textContent = `Final Score: ${quizScore} / ${quizData.length * 3}`;
  recommendations.textContent = 'Review your weaknesses and try again!';
  liveStrengths.textContent = 'Strengths: ' + liveStrengthsArr.join('; ');
  liveWeaknesses.textContent = 'Weaknesses: ' + liveWeaknessesArr.join('; ');
  // Add restart button
  if (!document.getElementById('restart-btn')) {
    const btn = document.createElement('button');
    btn.id = 'restart-btn';
    btn.className = 'primary-btn';
    btn.textContent = 'Restart';
    btn.onclick = () => {
      resultsSection.style.display = 'none';
      inputFormSection.style.display = '';
    };
    resultsSection.appendChild(btn);
  }
}

// --- EVENT LISTENERS (for new features) ---
if (testForm) {
  testForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    quizSettings = {
      topic: testForm.topic.value,
      grade: testForm['grade-level'].value,
      subject: testForm.subject.value,
      title: testForm.title.value,
      description: testForm.description.value,
      numQuestions: parseInt(testForm['num-questions'].value),
      shortAnswerPercent: parseInt(testForm['short-answer'].value)
    };
    showLoadingWithTip(quizSettings.topic);
    quizData = await generateQuiz(quizSettings);
    hideLoading();
    inputFormSection.style.display = 'none';
    resultsSection.style.display = 'none';
    testSection.style.display = '';
    quizCurrentQuestion = 0;
    quizScore = 0;
    quizStreak = 0;
    studyMode = null;
    unlockedPowerUps = false;
    usedPowerUps = { extraTime: false, skip: false, hint: false };
    liveStrengthsArr = [];
    liveWeaknessesArr = [];
    showQuestion();
  });
}
if (submitTestBtn) {
  submitTestBtn.addEventListener('click', (e) => {
    e.preventDefault();
    gradeCurrentQuestion();
  });
}

// --- Types removed (JS doesn't need them) ---
// --- QuestionTracker class ---
class QuestionTracker {
  static instance;
  usedQuestionHashesGlobally = new Set();
  sessionQuestionHistory = new Map();
  MAX_SESSION_HISTORY_FOR_PROMPT = 5;
  MAX_GLOBAL_HASHES_TO_STORE = 10000;

  static getInstance() {
    if (!QuestionTracker.instance) {
      QuestionTracker.instance = new QuestionTracker();
    }
    return QuestionTracker.instance;
  }

  addQuestion(sessionId, questionText) {
    const questionHash = this._hashQuestionText(questionText);
    if (this.usedQuestionHashesGlobally.size > this.MAX_GLOBAL_HASHES_TO_STORE) {
      const oldestHash = this.usedQuestionHashesGlobally.values().next().value;
      this.usedQuestionHashesGlobally.delete(oldestHash);
    }
    this.usedQuestionHashesGlobally.add(questionHash);
    if (!this.sessionQuestionHistory.has(sessionId)) {
      this.sessionQuestionHistory.set(sessionId, []);
    }
    const sessionHistory = this.sessionQuestionHistory.get(sessionId);
    sessionHistory.push({ questionText, timestamp: Date.now() });
    if (sessionHistory.length > this.MAX_SESSION_HISTORY_FOR_PROMPT * 2) {
      sessionHistory.shift();
    }
  }

  getRecentSessionQuestions(sessionId, count = this.MAX_SESSION_HISTORY_FOR_PROMPT) {
    const history = this.sessionQuestionHistory.get(sessionId) || [];
    return history.slice(-count).map((q) => q.questionText);
  }

  clearSession(sessionId) {
    this.sessionQuestionHistory.delete(sessionId);
  }

  _hashQuestionText(content) {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `q_${hash}`;
  }
}

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// --- UI/DOM ---
const API_URL = 'https://deepseek-v31.p.rapidapi.com/';
const API_KEY = 'a29cfe4fa6mshb63da984e4b3f7dp12efdajsneda384ed8b83';
const API_HOST = 'deepseek-v31.p.rapidapi.com';

const form = document.getElementById('test-form');
const testSection = document.getElementById('test-section');
const userTestForm = document.getElementById('user-test-form');
const submitTestBtn = document.getElementById('submit-test-btn');
const timerSpan = document.getElementById('timer');
const questionNumberSpan = document.getElementById('question-number');
const resultsSection = document.getElementById('results');
const scoreFeedback = document.getElementById('score-feedback');
const recommendations = document.getElementById('recommendations');
const liveStrengths = document.getElementById('live-strengths');
const liveWeaknesses = document.getElementById('live-weaknesses');
const questionFeedback = document.getElementById('question-feedback');
const liveScore = document.getElementById('live-score');
const loadingOverlay = document.getElementById('loading-overlay');
const themeToggle = document.getElementById('theme-toggle');

let timerInterval = null;
let timeLeft = 0;
let questions = [];
let sessionId = '';
let currentQuestion = 0;
let userAnswers = [];
let perQuestionScores = [];
let perQuestionFeedback = [];
let strengths = [];
let weaknesses = [];
let totalScore = 0;

const questionTracker = QuestionTracker.getInstance();

function cleanJSONResponse(text) {
  let clean = text.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```json|^```/, '').replace(/```$/, '').trim();
  }
  return clean;
}

function buildPrompt(data, sessionId) {
  const recentQs = questionTracker.getRecentSessionQuestions(sessionId).join(' | ');
  return `Generate a test with the following parameters:\n\n` +
    `Topic: ${data.topic}\n` +
    `Grade Level: ${data['grade-level']}\n` +
    `Subject: ${data.subject}\n` +
    `Title: ${data.title}\n` +
    `Description/Notes: ${data.description}\n` +
    `Number of Questions: ${data['num-questions']}\n` +
    `Percent Short Answer: ${data['short-answer']}\n` +
    `Percent Multiple Choice: ${100 - parseInt(data['short-answer'])}\n` +
    `Avoid repeating these questions: ${recentQs || 'None'}\n` +
    `Return the test as a JSON array of questions, each with a type ('short' or 'mc'), question text, and for MC, options and answer. Example format:\n` +
    `[ {"type": "mc", "question": "...", "options": ["A", "B", "C", "D"], "answer": "A"}, {"type": "short", "question": "...", "answer": "..."} ]`;
}

const LOADING_TIPS = [
  "Tip: Read each question carefully before answering!",
  "Tip: Partial credit is possible for close answers.",
  "Tip: Use the timer to pace yourself.",
  "Tip: Review your strengths and weaknesses after 5 questions.",
  "Tip: Try to eliminate obviously wrong options first.",
  "Tip: You can switch between light and dark themes!",
  "Tip: Short answers get partial credit if they're close.",
  "Tip: Some MC options may give negative points if far off!"
];
function showLoading(show) {
  loadingOverlay.classList.toggle('hidden', !show);
  const tip = LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];
  document.getElementById('loading-tip').textContent = show ? tip : '';
  if (show) {
    // If loading takes more than 2 seconds, show a message
    if (window.loadingTimeout) clearTimeout(window.loadingTimeout);
    window.loadingTimeout = setTimeout(() => {
      if (!loadingOverlay.classList.contains('hidden')) {
        loadingOverlay.querySelector('.loading-text').textContent = 'Still working... This may take a few more seconds.';
      }
    }, 2000);
  } else {
    if (window.loadingTimeout) clearTimeout(window.loadingTimeout);
    loadingOverlay.querySelector('.loading-text').textContent = 'Generating your test... Please wait!';
  }
}

function generateTest(data, sessionId) {
  showLoading(true);
  const prompt = buildPrompt(data, sessionId);
  const payload = JSON.stringify({
    model: 'DeepSeek-V3-0324',
    messages: [
      { role: 'user', content: prompt }
    ]
  });
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener('readystatechange', function () {
      if (this.readyState === this.DONE) {
        showLoading(false);
        try {
          const response = JSON.parse(cleanJSONResponse(this.responseText));
          if (Array.isArray(response)) {
            resolve(response);
          } else if (response.questions) {
            resolve(response.questions);
          } else if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
            const inner = JSON.parse(cleanJSONResponse(response.choices[0].message.content));
            resolve(Array.isArray(inner) ? inner : inner.questions);
          } else {
            reject('No questions found in response.');
          }
        } catch (e) {
          reject('Error parsing test: ' + e);
        }
      }
    });
    xhr.open('POST', API_URL);
    xhr.setRequestHeader('x-rapidapi-key', API_KEY);
    xhr.setRequestHeader('x-rapidapi-host', API_HOST);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(payload);
  });
}

function renderQuestion(idx) {
  userTestForm.innerHTML = '';
  questionFeedback.innerHTML = '';
  liveScore.innerHTML = '';
  submitTestBtn.style.display = 'block';
  const q = questions[idx];
  questionNumberSpan.textContent = `${idx + 1} / ${questions.length}`;
  const wrapper = document.createElement('div');
  wrapper.className = 'form-row';
  const label = document.createElement('label');
  label.textContent = q.question;
  wrapper.appendChild(label);
  if (q.type === 'mc' && q.options) {
    // Ensure 6-8 options
    let opts = q.options;
    if (opts.length < 6) {
      // Add dummy options if needed
      for (let i = opts.length; i < 6; i++) opts.push('Option ' + String.fromCharCode(65 + i));
    }
    if (opts.length > 8) opts = opts.slice(0, 8);
    opts.forEach((opt, i) => {
      const optId = `q${idx}_opt${i}`;
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `q${idx}`;
      radio.value = opt;
      radio.id = optId;
      const optLabel = document.createElement('label');
      optLabel.htmlFor = optId;
      optLabel.textContent = opt;
      wrapper.appendChild(radio);
      wrapper.appendChild(optLabel);
    });
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.name = `q${idx}`;
    input.placeholder = 'Your answer';
    wrapper.appendChild(input);
  }
  userTestForm.appendChild(wrapper);
}

function startQuestionTimer(seconds, onTimeout) {
  clearInterval(timerInterval);
  timeLeft = seconds;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      onTimeout();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  timerSpan.textContent = `⏰ ${min}:${sec.toString().padStart(2, '0')}`;
}

function similarity(a, b) {
  const setA = new Set(a.toLowerCase().split(/\W+/));
  const setB = new Set(b.toLowerCase().split(/\W+/));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  return intersection.size / Math.max(setA.size, setB.size, 1);
}

function letterGrade(score) {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
}

function scoreSingleQuestion(q, userAns) {
  if (!userAns) return { correct: false, score: 0, feedback: 'No answer submitted.' };
  if (q.type === 'mc') {
    // Partial/negative credit system
    const correct = userAns.trim().toLowerCase() === q.answer.trim().toLowerCase();
    if (correct) {
      return { correct: true, score: 100, feedback: 'Correct!' };
    }
    // Partial credit for "close" options (string similarity)
    let maxSim = 0;
    for (const opt of q.options) {
      if (opt !== q.answer) {
        const sim = similarity(opt, q.answer);
        if (opt === userAns) maxSim = sim;
      }
    }
    if (maxSim >= 0.6) {
      return { correct: false, score: 50, feedback: 'Close! Partial credit.' };
    } else if (maxSim >= 0.4) {
      return { correct: false, score: 30, feedback: 'Somewhat reasonable, but not quite.' };
    } else {
      return { correct: false, score: -20, feedback: 'Far off. Negative points.' };
    }
  } else {
    const sim = similarity(userAns, q.answer);
    const correct = sim >= 0.7;
    return {
      correct,
      score: correct ? 100 : Math.round(sim * 100),
      feedback: correct ? 'Good answer!' : `Partial/incorrect. Model answer: ${q.answer}`
    };
  }
}

function updateLiveStats() {
  const answered = perQuestionScores.length;
  if (answered === 0) {
    liveScore.innerHTML = '';
    liveStrengths.innerHTML = '';
    liveWeaknesses.innerHTML = '';
    return;
  }
  const avg = Math.round(perQuestionScores.reduce((a, b) => a + b, 0) / answered);
  totalScore = avg;
  liveScore.innerHTML = `<b>Current Score:</b> ${avg}% <span class='grade-badge'>${letterGrade(avg)}</span>`;
  const last5 = perQuestionScores.slice(-5);
  strengths = [];
  weaknesses = [];
  if (last5.filter(s => s >= 90).length >= 3) strengths.push('Consistent high performance');
  if (last5.filter(s => s < 70).length >= 2) weaknesses.push('Multiple recent mistakes');
  if (perQuestionFeedback.slice(-5).some(f => f.includes('Partial'))) weaknesses.push('Short answers need more detail');
  if (perQuestionFeedback.slice(-5).some(f => f.includes('Correct'))) strengths.push('Strong multiple choice');
  if (answered >= 5) {
    liveStrengths.innerHTML = `<b>Strengths:</b> <ul>${strengths.map(s => `<li>${s}</li>`).join('')}</ul>`;
    liveWeaknesses.innerHTML = `<b>Weaknesses:</b> <ul>${weaknesses.map(s => `<li>${s}</li>`).join('')}</ul>`;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  form.querySelector('button').setAttribute('disabled', 'true');
  testSection.style.display = 'none';
  resultsSection.style.display = 'none';
  userTestForm.innerHTML = '';
  questionFeedback.innerHTML = '';
  liveScore.innerHTML = '';
  liveStrengths.innerHTML = '';
  liveWeaknesses.innerHTML = '';
  perQuestionScores = [];
  perQuestionFeedback = [];
  userAnswers = [];
  currentQuestion = 0;
  sessionId = generateSessionId();
  try {
    const data = Object.fromEntries(new FormData(form).entries());
    questions = await generateTest(data, sessionId);
    if (!questions.length) throw new Error('No questions generated.');
    testSection.style.display = 'block';
    renderQuestion(currentQuestion);
    startQuestionTimer(45, () => submitTestBtn.click());
  } catch (err) {
    scoreFeedback.innerHTML = `<span style=\"color:#e17055\">Error generating test: ${err}</span>`;
    resultsSection.style.display = 'block';
  } finally {
    form.querySelector('button').removeAttribute('disabled');
  }
});

submitTestBtn.addEventListener('click', (e) => {
  e.preventDefault();
  clearInterval(timerInterval);
  const q = questions[currentQuestion];
  const userAns = (userTestForm.querySelector('input[type="radio"]:checked') || userTestForm.querySelector('input[type="text"]'))?.value || '';
  userAnswers[currentQuestion] = userAns;
  const result = scoreSingleQuestion(q, userAns);
  perQuestionScores[currentQuestion] = result.score;
  perQuestionFeedback[currentQuestion] = result.feedback;
  questionFeedback.innerHTML = `<b>Feedback:</b> ${result.feedback}`;
  updateLiveStats();
  submitTestBtn.style.display = 'none';
  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < questions.length) {
      renderQuestion(currentQuestion);
      startQuestionTimer(45, () => submitTestBtn.click());
    } else {
      testSection.style.display = 'none';
      resultsSection.style.display = 'block';
      scoreFeedback.innerHTML = `<b>Final Score:</b> ${totalScore}% <span class='grade-badge'>${letterGrade(totalScore)}</span>`;
      recommendations.innerHTML = totalScore >= 90
        ? 'Excellent! Try a harder test or new topic.'
        : totalScore >= 70
        ? 'Good job! Review your mistakes for mastery.'
        : 'Needs improvement. Focus on your weak areas.';
      liveStrengths.innerHTML = `<b>Strengths:</b> <ul>${strengths.map(s => `<li>${s}</li>`).join('')}</ul>`;
      liveWeaknesses.innerHTML = `<b>Weaknesses:</b> <ul>${weaknesses.map(s => `<li>${s}</li>`).join('')}</ul>`;
    }
  }, 1200);
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  themeToggle.textContent = document.body.classList.contains('light-theme') ? 'Switch to Dark' : 'Switch Theme';
});
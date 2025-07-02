// --- Session & Question Tracking ---
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

  isQuestionUsedRecentlyOrGlobally(questionText, sessionId) {
    const questionHash = this._hashQuestionText(questionText);
    if (this.usedQuestionHashesGlobally.has(questionHash)) return true;
    const recentSessionQs = this.getRecentSessionQuestions(sessionId).map((q) => q.toLowerCase());
    return recentSessionQs.some((rq) => this._areStringsSimilar(rq, questionText.toLowerCase()));
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

  _areStringsSimilar(s1, s2, threshold = 0.8) {
    const shorter = s1.length < s2.length ? s1 : s2;
    const longer = s1.length < s2.length ? s2 : s1;
    if (longer.length === 0) return true;
    const longerWords = new Set(longer.split(/\s+/));
    let commonWords = 0;
    shorter.split(/\s+/).forEach((word) => {
      if (longerWords.has(word)) commonWords++;
    });
    const similarity = shorter.split(/\s+/).length > 0 ? commonWords / shorter.split(/\s+/).length : 0;
    return similarity >= threshold;
  }
}

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// --- UI & API ---
const API_URL = 'https://deepseek-v31.p.rapidapi.com/';
const API_KEY = 'a29cfe4fa6mshb63da984e4b3f7dp12efdajsneda384ed8b83';
const API_HOST = 'deepseek-v31.p.rapidapi.com';

const form = document.getElementById('test-form');
const testSection = document.getElementById('test-section');
const userTestForm = document.getElementById('user-test-form');
const submitTestBtn = document.getElementById('submit-test-btn');
const timerSpan = document.getElementById('timer');
const resultsSection = document.getElementById('results');
const scoreFeedback = document.getElementById('score-feedback');
const recommendations = document.getElementById('recommendations');

let timerInterval = null;
let timeLeft = 0;
let questions = [];
let sessionId = null;
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
    `Return the test as a JSON array of questions, each with a type ('short' or 'mc'), question text, and for MC, options and answer. Example format:` +
    `\n[ {\n  "type": "mc",\n  "question": "...",\n  "options": ["A", "B", "C", "D"],\n  "answer": "A"\n}, {\n  "type": "short",\n  "question": "...",\n  "answer": "..."\n} ]`;
}

async function generateTest(data, sessionId) {
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

function renderTest(questionsArr) {
  userTestForm.innerHTML = '';
  questionsArr.forEach((q, idx) => {
    questionTracker.addQuestion(sessionId, q.question);
    const wrapper = document.createElement('div');
    wrapper.className = 'form-row';
    const label = document.createElement('label');
    label.textContent = `Q${idx + 1}: ${q.question}`;
    wrapper.appendChild(label);
    if (q.type === 'mc') {
      q.options.forEach((opt, i) => {
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
  });
  submitTestBtn.style.display = 'block';
}

function startTimer(minutes) {
  clearInterval(timerInterval);
  timeLeft = minutes * 60;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitTestBtn.click();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  timerSpan.textContent = `⏰ ${min}:${sec.toString().padStart(2, '0')}`;
}

function scoreTest(questionsArr) {
  let correct = 0;
  let total = questionsArr.length;
  let shortCorrect = 0, shortTotal = 0, mcCorrect = 0, mcTotal = 0;
  const userAnswers = new FormData(userTestForm);
  questionsArr.forEach((q, idx) => {
    const userAns = userAnswers.get(`q${idx}`);
    if (q.type === 'mc') {
      mcTotal++;
      if (userAns && userAns.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
        correct++;
        mcCorrect++;
      }
    } else {
      shortTotal++;
      if (userAns && similarity(userAns, q.answer) >= 0.7) {
        correct++;
        shortCorrect++;
      }
    }
  });
  return {
    score: Math.round((correct / total) * 100),
    mcScore: mcTotal ? Math.round((mcCorrect / mcTotal) * 100) : null,
    shortScore: shortTotal ? Math.round((shortCorrect / shortTotal) * 100) : null,
    total,
    correct,
    mcTotal,
    mcCorrect,
    shortTotal,
    shortCorrect
  };
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

function feedbackAndRecommendations(scoreObj, questionsArr) {
  let feedback = `<div class='score-main'><b>Final Score: ${scoreObj.score}% (${scoreObj.correct}/${scoreObj.total})</b> <span class='grade-badge'>${letterGrade(scoreObj.score)}</span></div>`;
  if (scoreObj.mcScore !== null) feedback += `<div>MC: ${scoreObj.mcScore}%</div>`;
  if (scoreObj.shortScore !== null) feedback += `<div>Short Answer: ${scoreObj.shortScore}%</div>`;
  if (scoreObj.score >= 90) feedback += '<div class="feedback-good">Excellent! You are ready for advanced topics.</div>';
  else if (scoreObj.score >= 70) feedback += '<div class="feedback-ok">Good job! Review mistakes for mastery.</div>';
  else feedback += '<div class="feedback-bad">Needs improvement. Focus on weak areas.</div>';

  // Strengths/Weaknesses
  let strengths = [], weaknesses = [];
  if (scoreObj.mcScore !== null && scoreObj.mcScore >= 80) strengths.push('Strong multiple choice performance');
  if (scoreObj.shortScore !== null && scoreObj.shortScore >= 80) strengths.push('Strong short answer performance');
  if (scoreObj.mcScore !== null && scoreObj.mcScore < 70) weaknesses.push('Multiple choice needs work');
  if (scoreObj.shortScore !== null && scoreObj.shortScore < 70) weaknesses.push('Short answer needs work');

  if (strengths.length)
    feedback += `<div class='strengths'><b>Strengths:</b> <ul>${strengths.map(s => `<li>${s}</li>`).join('')}</ul></div>`;
  if (weaknesses.length)
    feedback += `<div class='weaknesses'><b>Weaknesses:</b> <ul>${weaknesses.map(s => `<li>${s}</li>`).join('')}</ul></div>`;

  // Recommend topics based on missed questions
  let missedTopics = questionsArr.filter((q, idx) => {
    const userAns = new FormData(userTestForm).get(`q${idx}`);
    if (q.type === 'mc') {
      return !(userAns && userAns.trim().toLowerCase() === q.answer.trim().toLowerCase());
    } else {
      return !(userAns && similarity(userAns, q.answer) >= 0.7);
    }
  }).map(q => q.question.split(' ').slice(0, 5).join(' '));
  let recs = missedTopics.length ?
    'Study these topics/questions:<ul>' + missedTopics.map(t => `<li>${t}...</li>`).join('') + '</ul>' :
    'No specific recommendations. Try a harder test!';
  return { feedback, recs };
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  form.querySelector('button').disabled = true;
  testSection.style.display = 'none';
  resultsSection.style.display = 'none';
  scoreFeedback.innerHTML = '';
  recommendations.innerHTML = '';
  userTestForm.innerHTML = '';
  submitTestBtn.style.display = 'none';
  timerSpan.textContent = '';
  sessionId = generateSessionId();
  try {
    const data = Object.fromEntries(new FormData(form).entries());
    questions = await generateTest(data, sessionId);
    renderTest(questions);
    testSection.style.display = 'block';
    startTimer(Number(data['time-limit']));
  } catch (err) {
    scoreFeedback.innerHTML = `<span style="color:#e17055">Error generating test: ${err}</span>`;
    resultsSection.style.display = 'block';
  } finally {
    form.querySelector('button').disabled = false;
  }
});

submitTestBtn.addEventListener('click', (e) => {
  e.preventDefault();
  clearInterval(timerInterval);
  const scoreObj = scoreTest(questions);
  const { feedback, recs } = feedbackAndRecommendations(scoreObj, questions);
  scoreFeedback.innerHTML = feedback;
  recommendations.innerHTML = recs;
  resultsSection.style.display = 'block';
  testSection.style.display = 'none';
});
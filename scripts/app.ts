// Race to Survive - TypeScript version
// Core logic inspired by your TS reference

// --- Types ---
type QuestionType = 'mc' | 'short';
interface StudyQuestion {
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
}

interface ScoreResult {
  score: number;
  letterGrade: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

// --- Session & Question Tracking ---
class QuestionTracker {
  private static instance: QuestionTracker;
  private usedQuestionHashesGlobally: Set<string> = new Set();
  private sessionQuestionHistory: Map<string, { questionText: string; timestamp: number }[]> = new Map();
  private readonly MAX_SESSION_HISTORY_FOR_PROMPT = 5;
  private readonly MAX_GLOBAL_HASHES_TO_STORE = 10000;

  static getInstance(): QuestionTracker {
    if (!QuestionTracker.instance) {
      QuestionTracker.instance = new QuestionTracker();
    }
    return QuestionTracker.instance;
  }

  addQuestion(sessionId: string, questionText: string) {
    const questionHash = this._hashQuestionText(questionText);
    if (this.usedQuestionHashesGlobally.size > this.MAX_GLOBAL_HASHES_TO_STORE) {
      const oldestHash = this.usedQuestionHashesGlobally.values().next().value;
      this.usedQuestionHashesGlobally.delete(oldestHash);
    }
    this.usedQuestionHashesGlobally.add(questionHash);
    if (!this.sessionQuestionHistory.has(sessionId)) {
      this.sessionQuestionHistory.set(sessionId, []);
    }
    const sessionHistory = this.sessionQuestionHistory.get(sessionId)!;
    sessionHistory.push({ questionText, timestamp: Date.now() });
    if (sessionHistory.length > this.MAX_SESSION_HISTORY_FOR_PROMPT * 2) {
      sessionHistory.shift();
    }
  }

  isQuestionUsedRecentlyOrGlobally(questionText: string, sessionId: string): boolean {
    const questionHash = this._hashQuestionText(questionText);
    if (this.usedQuestionHashesGlobally.has(questionHash)) return true;
    const recentSessionQs = this.getRecentSessionQuestions(sessionId).map((q) => q.toLowerCase());
    return recentSessionQs.some((rq) => this._areStringsSimilar(rq, questionText.toLowerCase()));
  }

  getRecentSessionQuestions(sessionId: string, count: number = this.MAX_SESSION_HISTORY_FOR_PROMPT): string[] {
    const history = this.sessionQuestionHistory.get(sessionId) || [];
    return history.slice(-count).map((q) => q.questionText);
  }

  clearSession(sessionId: string) {
    this.sessionQuestionHistory.delete(sessionId);
  }

  private _hashQuestionText(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `q_${hash}`;
  }

  private _areStringsSimilar(s1: string, s2: string, threshold = 0.8): boolean {
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

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// --- Export for use in main logic ---
export { QuestionTracker, generateSessionId, StudyQuestion, ScoreResult };

// --- UI/DOM ---
const API_URL = 'https://deepseek-v31.p.rapidapi.com/';
const API_KEY = 'a29cfe4fa6mshb63da984e4b3f7dp12efdajsneda384ed8b83';
const API_HOST = 'deepseek-v31.p.rapidapi.com';

const form = document.getElementById('test-form') as HTMLFormElement;
const testSection = document.getElementById('test-section')!;
const userTestForm = document.getElementById('user-test-form') as HTMLFormElement;
const submitTestBtn = document.getElementById('submit-test-btn') as HTMLButtonElement;
const timerSpan = document.getElementById('timer')!;
const questionNumberSpan = document.getElementById('question-number')!;
const resultsSection = document.getElementById('results')!;
const scoreFeedback = document.getElementById('score-feedback')!;
const recommendations = document.getElementById('recommendations')!;
const liveStrengths = document.getElementById('live-strengths')!;
const liveWeaknesses = document.getElementById('live-weaknesses')!;
const questionFeedback = document.getElementById('question-feedback')!;
const liveScore = document.getElementById('live-score')!;
const loadingOverlay = document.getElementById('loading-overlay')!;
const themeToggle = document.getElementById('theme-toggle')!;

let timerInterval: any = null;
let timeLeft = 0;
let questions: StudyQuestion[] = [];
let sessionId: string = '';
let currentQuestion = 0;
let userAnswers: (string | null)[] = [];
let perQuestionScores: number[] = [];
let perQuestionFeedback: string[] = [];
let strengths: string[] = [];
let weaknesses: string[] = [];
let totalScore = 0;

const questionTracker = QuestionTracker.getInstance();

function cleanJSONResponse(text: string): string {
  let clean = text.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```json|^```/, '').replace(/```$/, '').trim();
  }
  return clean;
}

function buildPrompt(data: any, sessionId: string): string {
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

function showLoading(show: boolean) {
  loadingOverlay.classList.toggle('hidden', !show);
}

async function generateTest(data: any, sessionId: string): Promise<StudyQuestion[]> {
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

function renderQuestion(idx: number) {
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
}

function startQuestionTimer(seconds: number, onTimeout: () => void) {
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

function similarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\W+/));
  const setB = new Set(b.toLowerCase().split(/\W+/));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  return intersection.size / Math.max(setA.size, setB.size, 1);
}

function letterGrade(score: number): string {
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

function scoreSingleQuestion(q: StudyQuestion, userAns: string | null): { correct: boolean, score: number, feedback: string } {
  if (!userAns) return { correct: false, score: 0, feedback: 'No answer submitted.' };
  if (q.type === 'mc') {
    const correct = userAns.trim().toLowerCase() === q.answer.trim().toLowerCase();
    return {
      correct,
      score: correct ? 100 : 0,
      feedback: correct ? 'Correct!' : `Incorrect. Correct answer: ${q.answer}`
    };
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
  // Calculate running score, strengths, weaknesses
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
  // Simple strengths/weaknesses: based on last 5 answers
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
  form.querySelector('button')!.setAttribute('disabled', 'true');
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
    scoreFeedback.innerHTML = `<span style="color:#e17055">Error generating test: ${err}</span>`;
    resultsSection.style.display = 'block';
  } finally {
    form.querySelector('button')!.removeAttribute('disabled');
  }
});

submitTestBtn.addEventListener('click', (e) => {
  e.preventDefault();
  clearInterval(timerInterval);
  const q = questions[currentQuestion];
  const userAns = (userTestForm.querySelector('input[type="radio"]:checked') as HTMLInputElement)?.value ||
                  (userTestForm.querySelector('input[type="text"]') as HTMLInputElement)?.value || '';
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
      // Show results
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

// Theme toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  themeToggle.textContent = document.body.classList.contains('light-theme') ? 'Switch to Dark' : 'Switch Theme';
});

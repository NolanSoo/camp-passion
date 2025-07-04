// --- Race to Survive: Refactored & Enhanced ---

// --- CONSTANTS ---
const API_KEY = "a29cfe4fa6mshb63da984e4b3f7dp12efdajsneda384ed8b83"
const API_HOST = "deepseek-v31.p.rapidapi.com"
const API_URL = "https://deepseek-v31.p.rapidapi.com/"

const STUDY_TIPS = [
  "Tip: Enjoy yourself! Learning is meant to be fun - not a chore.",
  "If you can't explain it simply, you don't understand it well enough. - Albert Einstein",
  "You got this! - Nolan Soo (2025)",
  "Tip: Spaced repetition is key to long-term memory.",
  "Tip: Take short breaks every 25-30 minutes to stay focused.",
  "Tip: Test yourself frequently, don't just re-read notes.",
  "Fun Fact: The brain is more active during sleep than during the day!",
  "Tip: Connect what you're learning to what you already know.",
  "A good plan violently executed now is better than a perfect plan executed next week. - George S. Patton",
  "You can’t be everything to everyone. - Sabrina Carpenter",
  "I’m still learning to love myself. - Sabrina Carpenter",
  "Don’t let anyone dim your light. - Sabrina Carpenter",
  "Be proud of who you are. - Olivia Rodrigo",
  "Sometimes it’s okay not to be okay. - Olivia Rodrigo",
  "If you’re passionate about something, go for it. - Olivia Rodrigo",
  "You are enough, just as you are. - Billie Eilish",
  "It’s okay to make mistakes. That’s how you grow. - Billie Eilish",
  "Happiness is a journey, not a destination. - Billie Eilish",
  "Be fearless in the pursuit of what sets your soul on fire. - Taylor Swift",
  "Just keep dancing through. - Taylor Swift",
  "The lesson is, you can still be kind and strong. - Taylor Swift",
  "Treat people with kindness. - Harry Styles",
  "A little kindness goes a long way. - Harry Styles",
  "Dream with ambition, lead with conviction. - Beyoncé",
  "Don’t stop believing in yourself. - Beyoncé",
  "You’re stronger than you think. - Demi Lovato",
  "Stay true to yourself. - Demi Lovato",
  "You can’t control everything, but you can control your attitude. - Ariana Grande",
  "Keep your head up. - Ariana Grande",
  "Let your light shine. - Lizzo",
  "Self-love is the best love. - Lizzo",
  "You are your own best friend. - Lizzo",
  "Be the best version of yourself. - Shawn Mendes",
  "Every day is a new beginning. - Shawn Mendes",
  "Don’t be afraid to stand out. - Camila Cabello",
  "Believe in your dreams. - Camila Cabello",
  "Sometimes the smallest step in the right direction ends up being the biggest step of your life. - Naeem Callaway (THIS QUOTE IS A BANGER - IF YOU TAKE MANY STEPS, YOU WILL REACH THINGS UNIMAGINABLE TO YOU MAYBE JUST A FEW MONTHS/YEARS AGO :))",
  "Be the light in someone else’s day. - Forrest Frank",
  "You’re not alone in this. - Forrest Frank",
  "Take it one day at a time. - Forrest Frank",
  "You can’t control everything, but you can control your attitude. - Ryan Trahan",
  "Every day is a new adventure. - Ryan Trahan",
  "Don’t be afraid to try something new. - Ryan Trahan",
  "Stay curious and keep learning. - Ryan Trahan",
  "Mistakes are just part of the journey. - Ryan Trahan",
  "Celebrate the little wins. - Ryan Trahan",
  "Keep showing up, even when it’s hard. - Ryan Trahan",
  "You don’t have to be perfect to make progress. - Ryan Trahan",
  "Be yourself, everyone else is taken. - Ryan Trahan",
  "Dream big, start small. - Ryan Trahan",
  "Your story matters. - Ryan Trahan",
  "Tip: Set specific, achievable goals for each study session.",
  "Tip: Use diagrams and visuals to help remember concepts.",
  "Tip: Practice active recall instead of passive reading.",
  "Tip: Mix up subjects to keep your brain engaged.",
  "Tip: Don’t be afraid to ask for help.",
  "Tip: Sleep is essential for memory consolidation.",
  "Tip: Hydrate! Your brain needs water to function well.",
  "Tip: Celebrate small wins to stay motivated.",
  "Tip: Use flashcards for quick review.",
  "Tip: Study in short, focused bursts.",
  "Tip: Listen to instrumental music to boost concentration.",
  "Tip: Write summaries in your own words.",
  "Tip: Find a study buddy for accountability.",
  "Tip: Take care of your mental health.",
  "Tip: Break big tasks into smaller steps.",
  "Tip: Use color coding to organize information.",
  "Tip: Stay curious and keep asking questions.",
  "Tip: Visualize your success.",
  "Tip: Mistakes are proof that you are trying.",
  "Tip: Keep a positive mindset.",
  "Tip: Reflect on what works best for you.",
  "Tip: Consistency beats cramming.",
]

const MEME_OPTIONS = [
  "skibidi toilet answer (real)",
  "ohio moment fr fr",
  "rizz level: infinite",
  "certified skill issue",
  "NPC behavior detected",
  "touch grass",
  "based and redpilled",
  "it's giving...",
]

// --- DOM ELEMENTS ---
const inputFormSection = document.getElementById("input-form")
const testSection = document.getElementById("test-section")
const resultsSection = document.getElementById("results")
const testForm = document.getElementById("test-form")
const userTestForm = document.getElementById("user-test-form")
const submitTestBtn = document.getElementById("submit-test-btn")
const questionNumberSpan = document.getElementById("question-number")
const timerSpan = document.getElementById("timer")
const questionFeedback = document.getElementById("question-feedback")
const aiFeedbackCard = document.getElementById("ai-feedback")
const aiFeedbackContent = document.getElementById("ai-feedback-content")
const liveScore = document.getElementById("live-score")
const scoreFeedback = document.getElementById("score-feedback")
const recommendationsContent = document.getElementById("recommendations-content")
const liveStrengthsEl = document.getElementById("live-strengths")
const liveWeaknessesEl = document.getElementById("live-weaknesses")
const loadingOverlay = document.getElementById("loading-overlay")
const loadingTip = document.getElementById("loading-tip")
const themeToggle = document.getElementById("theme-toggle")
let memeToggle // Will be created dynamically

// --- GLOBAL STATE ---
let state = {}

function resetState() {
  state = {
    quizData: [],
    currentQuestionIndex: 0,
    userAnswers: [],
    scores: [],
    feedbacks: [],
    strengths: new Set(),
    weaknesses: new Set(),
    totalScore: 0,
    timerInterval: null,
    timeLeft: 0,
    sessionId: `session_${Date.now()}`,
    // memeMode is preserved across resets
    settings: {},
  }
  questionTracker.clearSession(state.sessionId)
}

// --- QUESTION TRACKER (to avoid duplicates) ---
class QuestionTracker {
  constructor() {
    this.sessionHistory = new Map()
  }
  addQuestion(sessionId, questionText) {
    if (!this.sessionHistory.has(sessionId)) {
      this.sessionHistory.set(sessionId, new Set())
    }
    this.sessionHistory.get(sessionId).add(questionText.toLowerCase())
  }
  getRecentQuestions(sessionId) {
    return Array.from(this.sessionHistory.get(sessionId) || [])
  }
  clearSession(sessionId) {
    this.sessionHistory.delete(sessionId)
  }
}
const questionTracker = new QuestionTracker()

// --- API CALLS ---
async function makeApiCall(prompt) {
  const payload = {
    model: "DeepSeek-V3-0324",
    messages: [{ role: "user", content: prompt }],
  }
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": API_HOST,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API request failed: ${response.status} ${errorText}`)
  }

  const result = await response.json()
  if (result.choices && result.choices[0] && result.choices[0].message) {
    // Clean the response content
    let content = result.choices[0].message.content.trim()
    if (content.startsWith("```json")) {
      content = content.substring(7, content.length - 3).trim()
    }
    return JSON.parse(content)
  }
  throw new Error("Invalid API response structure")
}

async function generateQuiz(settings) {
  const recentQs = questionTracker.getRecentQuestions(state.sessionId).join(" | ")
  const prompt = `Generate a test with these parameters:
          Topic: ${settings.topic}, Grade: ${settings["grade-level"]}, Subject: ${settings.subject}
          Description: ${settings.description}
          # of Questions: ${settings["num-questions"]}
          % Short Answer: ${settings["short-answer"]}
          Avoid repeating these questions: ${recentQs || "None"}
          Return as a JSON array of questions. Each question must have:
          - type: "mc" or "short"
          - question: string
          - (for mc) options: array of 4 strings
          - (for mc) answer: the correct option string
          - (for short) answer: a detailed model answer string
          - topic: specific sub-topic string
          - explanation: string explaining the correct answer.`
  return makeApiCall(prompt)
}

async function evaluateShortAnswer(question, userAnswer, modelAnswer) {
  const prompt = `Evaluate a user's short answer.
          Question: "${question}"
          Model Answer: "${modelAnswer}"
          User's Answer: "${userAnswer}"
          Provide a score (0-100) and feedback.
          Return as a JSON object: { "score": number, "feedback": "string with detailed analysis" }`
  return makeApiCall(prompt)
}

async function getStudyRecommendations() {
  const summary = `User scored ${state.totalScore}%. 
      Strengths: ${Array.from(state.strengths).join(", ")}. 
      Weaknesses: ${Array.from(state.weaknesses).join(", ")}.`
  const prompt = `Based on this quiz performance summary, provide 2-3 actionable study recommendations.
          Summary: ${summary}
          Format as a JSON object: { "recommendations": "string with bullet points" }`
  const result = await makeApiCall(prompt)
  return result.recommendations
}

// --- UI & QUIZ FLOW ---
function showToast(message) {
  const toast = document.createElement("div")
  toast.className = "toast"
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 3000)
}

function showLoading(show) {
  if (show) {
    loadingTip.textContent = STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)]
    loadingOverlay.classList.remove("hidden")
  } else {
    loadingOverlay.classList.add("hidden")
  }
}

function transformForMemeMode(q) {
  const newQ = { ...q }
  if (q.type === "mc") {
    newQ.question = `🔥 ${q.question} (No Ls, only Ws)`
    const memeOptions = [...MEME_OPTIONS].sort(() => 0.5 - Math.random()).slice(0, 2)
    newQ.options = [
      ...q.options.map((opt) => {
        if (opt.toLowerCase() === q.answer.toLowerCase()) {
          return `${opt} (no cap fr fr)`
        }
        return `${opt} (${Math.random() > 0.5 ? "mid but valid" : "💀"})`
      }),
      ...memeOptions,
    ].sort(() => 0.5 - Math.random())
    newQ.answer = `${q.answer} (no cap fr fr)`
  } else {
    newQ.question = `💀 ${q.question} (go giga-brain mode)`
  }
  return newQ
}

function renderQuestion(qIndex) {
  const originalQ = state.quizData[qIndex]
  const q = state.memeMode ? transformForMemeMode(originalQ) : originalQ

  userTestForm.innerHTML = ""
  questionFeedback.innerHTML = ""
  aiFeedbackCard.style.display = "none"
  submitTestBtn.style.display = "block"
  questionNumberSpan.textContent = `${qIndex + 1} / ${state.quizData.length}`

  const wrapper = document.createElement("div")
  wrapper.className = "form-row"
  const label = document.createElement("label")
  label.textContent = q.question
  wrapper.appendChild(label)

  if (q.type === "mc" && q.options) {
    q.options.forEach((opt, i) => {
      const optId = `q${qIndex}_opt${i}`
      const optionLabel = document.createElement("label")
      optionLabel.className = "mc-option"
      optionLabel.htmlFor = optId

      const radioInput = document.createElement("input")
      radioInput.type = "radio"
      radioInput.name = `q${qIndex}`
      radioInput.value = opt
      radioInput.id = optId

      const optionText = document.createElement("span")
      optionText.textContent = opt

      optionLabel.appendChild(radioInput)
      optionLabel.appendChild(optionText)
      wrapper.appendChild(optionLabel)
    })
  } else {
    const textarea = document.createElement("textarea")
    textarea.name = `q${qIndex}`
    textarea.placeholder = state.memeMode ? "Drop the sauce..." : "Your detailed answer..."
    textarea.rows = 4
    wrapper.appendChild(textarea)
  }
  userTestForm.appendChild(wrapper)
  startTimer(45, () => submitTestBtn.click())
}

function startTimer(seconds, onTimeout) {
  clearInterval(state.timerInterval)
  state.timeLeft = seconds
  updateTimerDisplay()
  state.timerInterval = setInterval(() => {
    state.timeLeft--
    updateTimerDisplay()
    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval)
      onTimeout()
    }
  }, 1000)
}

function updateTimerDisplay() {
  const min = Math.floor(state.timeLeft / 60)
  const sec = state.timeLeft % 60
  timerSpan.textContent = `⏰ ${min}:${sec.toString().padStart(2, "0")}`
}

function updateLiveStats() {
  const answeredCount = state.scores.length
  if (answeredCount === 0) return

  const avg = Math.round(state.scores.reduce((a, b) => a + b, 0) / answeredCount)
  state.totalScore = avg
  const grade = avg >= 90 ? "A" : avg >= 80 ? "B" : avg >= 70 ? "C" : avg >= 60 ? "D" : "F"
  liveScore.innerHTML = `<b>Current Score:</b> ${avg}% <span class='grade-badge'>${grade}</span>`

  liveStrengthsEl.innerHTML = `<b>Strengths:</b> <ul>${Array.from(state.strengths)
    .map((s) => `<li>${s}</li>`)
    .join("")}</ul>`
  liveWeaknessesEl.innerHTML = `<b>Weaknesses:</b> <ul>${Array.from(state.weaknesses)
    .map((s) => `<li>${s}</li>`)
    .join("")}</ul>`
}

async function showResults() {
  testSection.style.display = "none"
  resultsSection.style.display = "block"
  const grade =
    state.totalScore >= 90
      ? "A"
      : state.totalScore >= 80
        ? "B"
        : state.totalScore >= 70
          ? "C"
          : state.totalScore >= 60
            ? "D"
            : state.totalScore >= 50
              ? "F+"
              : "F"

  let scoreText = `<b>Final Score:</b> ${state.totalScore}% <span class='grade-badge'>${grade}</span>`
  if (state.memeMode) {
    scoreText =
      state.totalScore >= 85
        ? `👑 Giga-chad performance! You got ${state.totalScore}%`
        : `💀 Skill issue... you got ${state.totalScore}%. Try again maybe?`
  }
  scoreFeedback.innerHTML = scoreText

  recommendationsContent.innerHTML = "Generating recommendations..."
  try {
    const recommendations = await getStudyRecommendations()
    recommendationsContent.innerHTML = recommendations.replace(/\n/g, "<br>")
  } catch (e) {
    console.error("Failed to get recommendations:", e)
    recommendationsContent.textContent = "Could not generate recommendations at this time."
  }

  // Ensure restart button exists and is correctly wired
  let restartBtn = document.getElementById("restart-btn")
  if (!restartBtn) {
    restartBtn = document.createElement("button")
    restartBtn.id = "restart-btn"
    restartBtn.className = "primary-btn"
    restartBtn.textContent = "Restart"
    resultsSection.appendChild(restartBtn)
  }
  restartBtn.onclick = () => {
    resultsSection.style.display = "none"
    inputFormSection.style.display = "block"
    liveScore.innerHTML = ""
    liveStrengthsEl.innerHTML = ""
    liveWeaknessesEl.innerHTML = ""
  }
}

// --- EVENT HANDLERS ---
async function handleFormSubmit(e) {
  e.preventDefault()
  showLoading(true)
  resetState()
  state.settings = Object.fromEntries(new FormData(testForm))

  try {
    const questions = await generateQuiz(state.settings)
    if (!questions || !questions.length) throw new Error("Question failed to generate. You can restart the quiz.")
    state.quizData = questions
    state.quizData.forEach((q) => questionTracker.addQuestion(state.sessionId, q.question))

    inputFormSection.style.display = "none"
    testSection.style.display = "block"
    renderQuestion(state.currentQuestionIndex)
  } catch (error) {
    console.error("Quiz generation error:", error)
    alert(`Error: ${error.message}. Please try again.`)
  } finally {
    showLoading(false)
  }
}

async function handleAnswerSubmit(e) {
  e.preventDefault()
  clearInterval(state.timerInterval)
  submitTestBtn.style.display = "none"

  const originalQ = state.quizData[state.currentQuestionIndex]
  const q = state.memeMode ? transformForMemeMode(originalQ) : originalQ

  const userInput =
    (userTestForm.querySelector('input[type="radio"]:checked') || userTestForm.querySelector("textarea"))?.value || ""
  state.userAnswers[state.currentQuestionIndex] = userInput

  let result = { score: 0, feedback: "No answer provided." }

  if (q.type === "mc") {
    const isCorrect = userInput.toLowerCase() === q.answer.toLowerCase()
    result.score = isCorrect ? 100 : 0
    if (state.memeMode) {
      result.feedback = isCorrect ? "W answer, giga-brain 🧠" : "Skill issue 💀"
    } else {
      result.feedback = isCorrect ? "Correct!" : `Incorrect. The right answer is: ${originalQ.answer}`
    }
    questionFeedback.innerHTML = `<b>Feedback:</b> ${result.feedback}<br><em>${originalQ.explanation}</em>`
  } else {
    questionFeedback.textContent = "AI is evaluating your answer..."
    try {
      result = await evaluateShortAnswer(q.question, userInput, originalQ.answer)
      questionFeedback.innerHTML = `<b>Feedback:</b> Evaluation finished.`
      aiFeedbackContent.innerHTML = `<p><strong>Score:</strong> ${result.score}%</p><p>${result.feedback}</p>`
      aiFeedbackCard.style.display = "block"
    } catch (e) {
      console.error("Evaluation error:", e)
      result = { score: 50, feedback: "Could not evaluate automatically. Partial credit given." }
      questionFeedback.textContent = result.feedback
    }
  }

  state.scores[state.currentQuestionIndex] = result.score
  state.feedbacks[state.currentQuestionIndex] = result.feedback

  // Update strengths/weaknesses
  if (result.score >= 85) state.strengths.add(originalQ.topic)
  else state.weaknesses.add(originalQ.topic)
  updateLiveStats()

  setTimeout(
    () => {
      state.currentQuestionIndex++
      if (state.currentQuestionIndex < state.quizData.length) {
        renderQuestion(state.currentQuestionIndex)
      } else {
        showResults()
      }
    },
    q.type === "short" ? 3000 : 1500,
  )
}

function handleThemeToggle() {
  document.body.classList.toggle("light-theme")
  themeToggle.textContent = document.body.classList.contains("light-theme") ? "Switch to Dark" : "Switch Theme"
}

function handleMemeToggle() {
  state.memeMode = !state.memeMode
  document.body.classList.toggle("meme-mode", state.memeMode)
  showToast(state.memeMode ? "Meme Mode: ON 💀" : "Meme Mode: OFF")
}

// --- INITIALIZATION ---
function init() {
  // Create and add meme toggle button
  const themeRow = document.querySelector(".theme-toggle-row")
  if (themeRow) {
    memeToggle = document.createElement("button")
    memeToggle.id = "meme-mode-toggle"
    memeToggle.className = "primary-btn"
    memeToggle.textContent = "Toggle Memes"
    memeToggle.style.marginLeft = "1rem"
    themeRow.appendChild(memeToggle)
    memeToggle.addEventListener("click", handleMemeToggle)
  }

  testForm.addEventListener("submit", handleFormSubmit)
  submitTestBtn.addEventListener("click", handleAnswerSubmit)
  themeToggle.addEventListener("click", handleThemeToggle)

  resetState()
  // Set initial meme mode state to false
  state.memeMode = false
  document.body.classList.remove("meme-mode")
}

init()

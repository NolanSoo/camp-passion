// --- Race to Survive: Refactored & Enhanced ---

// --- CONSTANTS ---
const API_KEY = "a29cfe4fa6mshb63da984e4b3f7dp12efdajsneda384ed8b83"
const API_HOST = "deepseek-v31.p.rapidapi.com"
const API_URL = "https://deepseek-v31.p.rapidapi.com/"
const INITIAL_QUESTION_BATCH_SIZE = 3
const BACKGROUND_QUESTION_BATCH_SIZE = 5

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
  "You can't be everything to everyone. - Sabrina Carpenter",
  "I'm still learning to love myself. - Sabrina Carpenter",
  "Don't let anyone dim your light. - Sabrina Carpenter",
  "Be proud of who you are. - Olivia Rodrigo",
  "Sometimes it's okay not to be okay. - Olivia Rodrigo",
  "If you're passionate about something, go for it. - Olivia Rodrigo",
  "You are enough, just as you are. - Billie Eilish",
  "It's okay to make mistakes. That's how you grow. - Billie Eilish",
  "Happiness is a journey, not a destination. - Billie Eilish",
  "Be fearless in the pursuit of what sets your soul on fire. - Taylor Swift",
  "Just keep dancing through. - Taylor Swift",
  "The lesson is, you can still be kind and strong. - Taylor Swift",
  "Treat people with kindness. - Harry Styles",
  "A little kindness goes a long way. - Harry Styles",
  "Dream with ambition, lead with conviction. - Beyoncé",
  "Don't stop believing in yourself. - Beyoncé",
  "You're stronger than you think. - Demi Lovato",
  "Stay true to yourself. - Demi Lovato",
  "You can't control everything, but you can control your attitude. - Ariana Grande",
  "Keep your head up. - Ariana Grande",
  "Let your light shine. - Lizzo",
  "Self-love is the best love. - Lizzo",
  "You are your own best friend. - Lizzo",
  "Be the best version of yourself. - Shawn Mendes",
  "Every day is a new beginning. - Shawn Mendes",
  "Don't be afraid to stand out. - Camila Cabello",
  "Believe in your dreams. - Camila Cabello",
  "Sometimes the smallest step in the right direction ends up being the biggest step of your life. - Naeem Callaway (THIS QUOTE IS A BANGER - IF YOU TAKE MANY STEPS, YOU WILL REACH THINGS UNIMAGINABLE TO YOU MAYBE JUST A FEW MONTHS/YEARS AGO :))",
  "Be the light in someone else's day. - Forrest Frank",
  "You're not alone in this. - Forrest Frank",
  "Take it one day at a time. - Forrest Frank",
  "You can't control everything, but you can control your attitude. - Ryan Trahan",
  "Every day is a new adventure. - Ryan Trahan",
  "Don't be afraid to try something new. - Ryan Trahan",
  "Stay curious and keep learning. - Ryan Trahan",
  "Mistakes are just part of the journey. - Ryan Trahan",
  "Celebrate the little wins. - Ryan Trahan",
  "Keep showing up, even when it's hard. - Ryan Trahan",
  "You don't have to be perfect to make progress. - Ryan Trahan",
  "Be yourself, everyone else is taken. - Ryan Trahan",
  "Dream big, start small. - Ryan Trahan",
  "Your story matters. - Ryan Trahan",
  "Tip: Set specific, achievable goals for each study session.",
  "Tip: Use diagrams and visuals to help remember concepts.",
  "Tip: Practice active recall instead of passive reading.",
  "Tip: Mix up subjects to keep your brain engaged.",
  "Tip: Don't be afraid to ask for help.",
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
const memeSection = document.getElementById("meme-section")
const memeContent = document.getElementById("meme-content")
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

// --- ACHIEVEMENT SYSTEM ---
const ACHIEVEMENTS = {
  "first-quiz": {
    name: "Getting Started",
    icon: "🎯",
    description: "Complete your first quiz",
    condition: (stats) => stats.quizzesCompleted >= 1,
  },
  "perfect-score": {
    name: "Perfectionist",
    icon: "💯",
    description: "Score 100% on a quiz",
    condition: (stats) => stats.perfectScores >= 1,
  },
  "speed-demon": {
    name: "Speed Demon",
    icon: "⚡",
    description: "Answer 3 questions in under 10 seconds each",
    condition: (stats) => stats.fastAnswers >= 3,
  },
  "coin-collector": {
    name: "Coin Collector",
    icon: "💰",
    description: "Earn 50 coins total",
    condition: (stats) => stats.totalCoinsEarned >= 50,
  },
  "power-user": {
    name: "Power User",
    icon: "🔋",
    description: "Use 10 power-ups",
    condition: (stats) => stats.powerUpsUsed >= 10,
  },
  "meme-lord": {
    name: "Meme Lord",
    icon: "😂",
    description: "Complete 5 quizzes in meme mode",
    condition: (stats) => stats.memeQuizzes >= 5,
  },
  "streak-master": {
    name: "Streak Master",
    icon: "🔥",
    description: "Get 5 correct answers in a row",
    condition: (stats) => stats.maxStreak >= 5,
  },
  scholar: {
    name: "Scholar",
    icon: "🎓",
    description: "Complete 10 quizzes",
    condition: (stats) => stats.quizzesCompleted >= 10,
  },
  "big-brain": {
    name: "Big Brain",
    icon: "🧠",
    description: "Score 90%+ on 5 quizzes",
    condition: (stats) => stats.highScores >= 5,
  },
  "time-master": {
    name: "Time Master",
    icon: "⏰",
    description: "Complete a quiz without running out of time",
    condition: (stats) => stats.noTimeouts >= 1,
  },
}

function initializeAchievements() {
  if (!state.achievements) {
    state.achievements = {
      unlocked: new Set(),
      stats: {
        quizzesCompleted: 0,
        perfectScores: 0,
        fastAnswers: 0,
        totalCoinsEarned: 0,
        powerUpsUsed: 0,
        memeQuizzes: 0,
        maxStreak: 0,
        currentStreak: 0,
        highScores: 0,
        noTimeouts: 0,
      },
    }
  }
}

function checkAchievements() {
  const { stats, unlocked } = state.achievements
  const newAchievements = []

  Object.entries(ACHIEVEMENTS).forEach(([key, achievement]) => {
    if (!unlocked.has(key) && achievement.condition(stats)) {
      unlocked.add(key)
      newAchievements.push(achievement)
    }
  })

  if (newAchievements.length > 0) {
    showAchievementNotification(newAchievements)
  }
}

function showAchievementNotification(achievements) {
  achievements.forEach((achievement, index) => {
    setTimeout(() => {
      const notification = document.createElement("div")
      notification.className = "achievement-notification"
      notification.innerHTML = `
        <div class="achievement-content">
          <div class="achievement-icon">${achievement.icon}</div>
          <div class="achievement-text">
            <div class="achievement-title">Achievement Unlocked!</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.description}</div>
          </div>
        </div>
      `
      document.body.appendChild(notification)

      // Animate in
      setTimeout(() => notification.classList.add("show"), 100)

      // Remove after 4 seconds
      setTimeout(() => {
        notification.classList.remove("show")
        setTimeout(() => notification.remove(), 300)
      }, 4000)
    }, index * 1000) // Stagger multiple achievements
  })
}

function updateAchievementStats(statType, value = 1) {
  if (!state.achievements) initializeAchievements()

  if (statType === "streak") {
    state.achievements.stats.currentStreak = value
    state.achievements.stats.maxStreak = Math.max(state.achievements.stats.maxStreak, value)
  } else {
    state.achievements.stats[statType] += value
  }

  checkAchievements()
}

function displayAchievements() {
  if (!state.achievements) return ""

  const unlockedAchievements = Array.from(state.achievements.unlocked)
  if (unlockedAchievements.length === 0) return ""

  return `
    <div class="achievements-section">
      <h4>🏆 Achievements (${unlockedAchievements.length}/${Object.keys(ACHIEVEMENTS).length})</h4>
      <div class="achievements-grid">
        ${unlockedAchievements
          .map((key) => {
            const achievement = ACHIEVEMENTS[key]
            return `
            <div class="achievement-badge">
              <span class="achievement-icon">${achievement.icon}</span>
              <span class="achievement-name">${achievement.name}</span>
            </div>
          `
          })
          .join("")}
      </div>
    </div>
  `
}

// --- MEME SEARCH SYSTEM ---
// --- MEME SEARCH SYSTEM ---
// async function generateMemeSearchQuery(topic, score, isCorrect) {
//   const context = {
//     topic: topic || "studying",
//     performance: score >= 90 ? "excellent" : score >= 70 ? "good" : score >= 50 ? "okay" : "poor",
//     outcome: isCorrect ? "success" : "failure",
//   }

//   const prompt = `Generate a 2-5 word meme search query based on this context:
//     Topic: ${context.topic}
//     Performance: ${context.performance}
//     Outcome: ${context.outcome}

//     The query should be funny, relatable, and suitable for finding memes. Use internet slang and be creative.
//     Examples: "math homework pain", "nailed it boss", "big brain time", "skill issue moment", "victory dance"

//     Return as JSON: { "query": "your 2-5 word search query" }`

//   try {
//     const result = await makeApiCall(prompt)
//     return result.query || (isCorrect ? "success moment" : "skill issue")
//   } catch (error) {
//     console.error("Failed to generate meme query:", error)
//     // Fallback queries
//     if (isCorrect) {
//       return ["big brain time", "nailed it", "victory dance", "genius moment"][Math.floor(Math.random() * 4)]
//     } else {
//       return ["skill issue", "pain moment", "struggle bus", "big oof"][Math.floor(Math.random() * 4)]
//     }
//   }
// }

// function searchMemes(query, callback) {
//   const memeSearch = window.memeSearch // Declare memeSearch variable
//   if (typeof memeSearch === "undefined") {
//     console.error("Meme search library not loaded")
//     callback(new Error("Meme search not available"), null)
//     return
//   }

//   // Try multiple subreddits for better results
//   const subreddits = ["dankmemes", "memes", "me_irl"]
//   const randomSubreddit = subreddits[Math.floor(Math.random() * subreddits.length)]

//   memeSearch(
//     query,
//     {
//       subreddit: randomSubreddit,
//       sort: "relevance",
//     },
//     (err, results) => {
//       if (err || !results || results.length === 0) {
//         // Try with a simpler query if first attempt fails
//         const fallbackQueries = ["funny", "meme", "reaction"]
//         const fallbackQuery = fallbackQueries[Math.floor(Math.random() * fallbackQueries.length)]

//         memeSearch(
//           fallbackQuery,
//           {
//             subreddit: "memes",
//             sort: "top",
//           },
//           callback,
//         )
//       } else {
//         callback(null, results)
//       }
//     },
//   )
// }

// async function displayMeme(topic, score, isCorrect) {
//   if (!state.memeMode) return

//   memeSection.style.display = "block"
//   memeContent.innerHTML = "<div class='meme-loading'>🔍 Finding the perfect meme...</div>"

//   try {
//     const query = await generateMemeSearchQuery(topic, score, isCorrect)
//     console.log("Searching for memes with query:", query)

//     searchMemes(query, (err, memes) => {
//       if (err || !memes || memes.length === 0) {
//         console.error("Meme search failed:", err)
//         memeContent.innerHTML = `
//           <div class="meme-fallback">
//             <div class="meme-emoji">${isCorrect ? "🎉" : "💀"}</div>
//             <div class="meme-text">${isCorrect ? "Big W energy!" : "That's a certified L moment"}</div>
//           </div>
//         `
//         return
//       }

//       // Pick a random meme from results
//       const randomMeme = memes[Math.floor(Math.random() * Math.min(memes.length, 5))]

//       memeContent.innerHTML = `
//         <div class="meme-container">
//           <img src="${randomMeme.image_url}" alt="${randomMeme.title}" class="meme-image"
//                onerror="this.parentElement.innerHTML='<div class=\\'meme-error\\'>Meme failed to load 💀</div>'" />
//           <div class="meme-title">${randomMeme.title}</div>
//           <div class="meme-query">Search: "${query}"</div>
//         </div>
//       `
//     })
//   } catch (error) {
//     console.error("Error displaying meme:", error)
//     memeContent.innerHTML = `
//       <div class="meme-fallback">
//         <div class="meme-emoji">🤖</div>
//         <div class="meme-text">Meme machine broke, try again later</div>
//       </div>
//     `
//   }
// }

// --- POWER-UP SYSTEM ---
const POWER_UPS = {
  "extra-time": { name: "Extra Time", icon: "⏰", cost: 4, description: "Add 15 seconds to current question" },
  skip: { name: "Skip Question", icon: "⏭️", cost: 6, description: "Skip current question (50% credit)" },
  hint: { name: "Get Hint", icon: "💡", cost: 5, description: "Get an AI-generated hint" },
  "double-points": { name: "Double Points", icon: "💎", cost: 8, description: "Next question worth 2x points" },
  "freeze-timer": { name: "Freeze Timer", icon: "❄️", cost: 6, description: "Pause timer for 10 seconds" },
  "fifty-fifty": { name: "50/50", icon: "🎯", cost: 4, description: "Eliminate 2 wrong answers (MC only)" },
  "second-chance": { name: "Second Chance", icon: "🔄", cost: 10, description: "Retry question if wrong" },
  "lucky-guess": { name: "Lucky Guess", icon: "🍀", cost: 12, description: "Auto-correct next MC question" },
  "time-boost": { name: "Time Boost", icon: "⚡", cost: 5, description: "Start next question with +30 seconds" },
  shield: { name: "Shield", icon: "🛡️", cost: 7, description: "Protect from point loss on next wrong answer" },
}

function initializePowerUps() {
  state.powerUps = {
    "extra-time": 0,
    skip: 0,
    hint: 0, // No free hints anymore
    "double-points": 0,
    "freeze-timer": 0,
    "fifty-fifty": 0,
    "second-chance": 0,
    "lucky-guess": 0,
    "time-boost": 0,
    shield: 0,
  }
  state.coins = 1 // Start with more coins since powerups are more expensive
  state.activeEffects = {
    doublePoints: false,
    timeBoost: false,
    shield: false,
    luckyGuess: false,
    secondChance: false,
  }
  updatePowerUpDisplay()
  updateCoinsDisplay()
}

function updateCoinsDisplay() {
  let coinsDisplay = document.getElementById("coins-display")
  if (!coinsDisplay) {
    coinsDisplay = document.createElement("div")
    coinsDisplay.id = "coins-display"
    coinsDisplay.className = "coins-display"
    const powerUpsSection = document.getElementById("power-ups-section")
    if (powerUpsSection) {
      powerUpsSection.insertBefore(coinsDisplay, powerUpsSection.firstChild)
    }
  }
  coinsDisplay.innerHTML = `<span class="coins-icon">🟡</span> <strong>${state.coins || 0}</strong> coins`
}

function earnCoins(score) {
  const coinsEarned = Math.round(score) / 100 // 100% = 1 coin, 50% = 0.5 coins, etc.
  state.coins = (state.coins || 0) + coinsEarned
  updateCoinsDisplay()
  updateAchievementStats("totalCoinsEarned", coinsEarned)
  if (coinsEarned > 0) {
    showToast(`🟡 Earned ${coinsEarned} coins!`)
  }
}

function canAffordPowerUp(powerType) {
  const cost = POWER_UPS[powerType].cost
  return (state.coins || 0) >= cost
}

function buyPowerUp(powerType) {
  const cost = POWER_UPS[powerType].cost
  if (!canAffordPowerUp(powerType)) {
    showToast(`Not enough coins! Need ${cost} coins.`)
    return false
  }

  state.coins -= cost
  updateCoinsDisplay()
  return true
}

function useExtraTime() {
  state.timeLeft += 15
  updateTimerDisplay()
  showToast("⏰ Extra 15 seconds added!")
}

function skipQuestion() {
  const originalQ = state.quizData[state.currentQuestionIndex]
  const score = originalQ.type === "mc" ? 50 : 0
  state.scores[state.currentQuestionIndex] = score
  state.userAnswers[state.currentQuestionIndex] = "Skipped"
  state.currentQuestionIndex++
  renderQuestion(state.currentQuestionIndex)
  showToast("⏭️ Question skipped!")
}

function useHint() {
  const originalQ = state.quizData[state.currentQuestionIndex]
  const hint = `Hint: ${originalQ.explanation}`
  questionFeedback.innerHTML = `<b>Hint:</b> ${hint}`
  showToast("💡 Hint received!")
}

function useDoublePoints() {
  state.activeEffects.doublePoints = true
  showToast("💎 Next question worth DOUBLE points!")
}

function useFreezeTimer() {
  const originalTimeLeft = state.timeLeft
  clearInterval(state.timerInterval)
  showToast("❄️ Timer frozen for 10 seconds!")

  setTimeout(() => {
    state.timeLeft = originalTimeLeft
    startTimer(state.timeLeft, () => submitTestBtn.click())
  }, 10000)
}

function useFiftyFifty() {
  const originalQ = state.quizData[state.currentQuestionIndex]
  if (originalQ.type !== "mc") {
    showToast("🎯 50/50 only works on multiple choice questions!")
    return false
  }

  const options = userTestForm.querySelectorAll(".mc-option")
  const correctAnswer = originalQ.answer.toLowerCase()
  const wrongOptions = []

  options.forEach((option) => {
    const input = option.querySelector("input")
    if (input.value.toLowerCase() !== correctAnswer) {
      wrongOptions.push(option)
    }
  })

  // Remove 2 wrong options
  for (let i = 0; i < Math.min(2, wrongOptions.length); i++) {
    wrongOptions[i].style.opacity = "0.3"
    wrongOptions[i].style.pointerEvents = "none"
    const input = wrongOptions[i].querySelector("input")
    input.disabled = true
  }

  showToast("🎯 Eliminated 2 wrong answers!")
  return true
}

function useSecondChance() {
  state.activeEffects.secondChance = true
  showToast("🔄 You'll get a second chance if you answer wrong!")
}

function useLuckyGuess() {
  state.activeEffects.luckyGuess = true
  showToast("🍀 Next MC question will be auto-corrected!")
}

function useTimeBoost() {
  state.activeEffects.timeBoost = true
  showToast("⚡ Next question starts with +30 seconds!")
}

function useShield() {
  state.activeEffects.shield = true
  showToast("🛡️ Protected from point loss on next wrong answer!")
}

function updatePowerUpDisplay() {
  const powerUpsSection = document.getElementById("power-ups-section")
  if (!powerUpsSection) return

  powerUpsSection.style.display = "block"
  const buttons = powerUpsSection.querySelectorAll(".power-up-btn")

  buttons.forEach((btn) => {
    const powerType = btn.dataset.power
    const powerUp = POWER_UPS[powerType]
    if (!powerUp) return

    const available = state.powerUps[powerType] || 0
    const canAfford = canAffordPowerUp(powerType)
    const isAffordable = canAfford || available > 0

    btn.disabled = !isAffordable
    btn.classList.toggle("available", isAffordable)
    btn.classList.toggle("disabled", !isAffordable)
    btn.classList.toggle("owned", available > 0)

    // Update button text to show cost or owned count
    if (available > 0) {
      btn.innerHTML = `${powerUp.icon} ${powerUp.name} (${available})`
    } else {
      btn.innerHTML = `${powerUp.icon} ${powerUp.name} (${powerUp.cost}🟡)`
    }
  })

  updateCoinsDisplay()
}

function usePowerUp(powerType) {
  const available = state.powerUps[powerType] || 0

  // If we own the power-up, use it directly
  if (available > 0) {
    state.powerUps[powerType]--
  } else {
    // Otherwise, try to buy it
    if (!buyPowerUp(powerType)) {
      return false
    }
  }

  updatePowerUpDisplay()
  updateAchievementStats("powerUpsUsed")

  switch (powerType) {
    case "extra-time":
      useExtraTime()
      break
    case "skip":
      skipQuestion()
      break
    case "hint":
      useHint()
      break
    case "double-points":
      useDoublePoints()
      break
    case "freeze-timer":
      useFreezeTimer()
      break
    case "fifty-fifty":
      if (!useFiftyFifty()) {
        // Refund if it didn't work
        if (available > 0) {
          state.powerUps[powerType]++
        } else {
          state.coins += POWER_UPS[powerType].cost
        }
        updatePowerUpDisplay()
      }
      break
    case "second-chance":
      useSecondChance()
      break
    case "lucky-guess":
      useLuckyGuess()
      break
    case "time-boost":
      useTimeBoost()
      break
    case "shield":
      useShield()
      break
  }

  return true
}

function awardPowerUp() {
  // Award coins based on performance
  const lastScore = state.scores[state.scores.length - 1] || 0
  earnCoins(lastScore)

  // Occasionally award free power-ups for excellent performance
  if (lastScore >= 95 && Math.random() < 0.15) {
    // Reduced chance since powerups are more expensive
    const powerTypes = Object.keys(POWER_UPS)
    const randomPower = powerTypes[Math.floor(Math.random() * powerTypes.length)]
    state.powerUps[randomPower] = (state.powerUps[randomPower] || 0) + 1
    showToast(`🎉 Perfect! Earned free ${POWER_UPS[randomPower].icon} ${POWER_UPS[randomPower].name}!`)
    updatePowerUpDisplay()
  }

  // Safety check - if we've answered all questions, show results
  const totalQuestions = Number.parseInt(state.settings["num-questions"], 10)
  if (state.scores.length >= totalQuestions && state.currentQuestionIndex >= totalQuestions) {
    console.log("Safety check triggered - showing results")
    setTimeout(() => showResults(), 1000)
  }
}

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
    isGenerating: false,
    questionStartTime: null,
    // memeMode and achievements are preserved across resets
    settings: {},
  }
  initializePowerUps()
  initializeAchievements()
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
    let content = result.choices[0].message.content.trim()

    // Attempt to extract JSON from markdown code block
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch && jsonMatch[1]) {
      content = jsonMatch[1].trim()
    } else {
      // If no markdown block, try to clean common conversational intros/outros
      content = content.replace(/^(Here is the JSON|```json|```|json)\s*/i, "").trim()
      content = content.replace(/\s*(```|json)$/i, "").trim()
    }

    try {
      return JSON.parse(content)
    } catch (parseError) {
      console.error("Failed to parse JSON content:", content, parseError)
      throw new Error(`Invalid JSON received from AI: ${content.substring(0, 100)}...`)
    }
  }
  throw new Error("Invalid API response structure: Missing choices or message content.")
}

async function generateQuestionBatch(numToGenerate) {
  const { settings, sessionId } = state
  const recentQs = questionTracker.getRecentQuestions(sessionId).join(" | ")
  const shortAnswerPercent = Number.parseInt(settings["short-answer"]) || 0
  const numShortAnswer = Math.round((numToGenerate * shortAnswerPercent) / 100)
  const numMultipleChoice = numToGenerate - numShortAnswer

  const prompt = `Generate a test with these parameters:
          Topic: ${settings.topic}, Grade: ${settings["grade-level"]}, Subject: ${settings.subject}
          Description: ${settings.description}
          # of Questions to generate in this batch: ${numToGenerate}
          Question type distribution: ${numMultipleChoice} multiple choice questions and ${numShortAnswer} short answer questions
          Avoid repeating these questions: ${recentQs || "None"}
          Return as a JSON array of questions. Each question must have:
          - type: "mc" or "short"
          - question: string
          - (for mc) options: array of 4 strings
          - (for mc) answer: the correct option string
          - (for short) answer: a detailed model answer string
          - topic: specific sub-topic string
          - explanation: string explaining the correct answer.
          
          IMPORTANT: Generate exactly ${numMultipleChoice} questions with type "mc" and exactly ${numShortAnswer} questions with type "short".`

  const newQuestions = await makeApiCall(prompt)
  if (!Array.isArray(newQuestions)) {
    throw new Error("AI returned data in an invalid format.")
  }
  state.quizData.push(...newQuestions)
  newQuestions.forEach((q) => questionTracker.addQuestion(sessionId, q.question))
}

async function generateRemainingQuestionsInBackground() {
  if (state.isGenerating) return
  state.isGenerating = true

  let generatedCount = state.quizData.length
  const totalNeeded = Number.parseInt(state.settings["num-questions"], 10)

  while (generatedCount < totalNeeded) {
    const numToFetch = Math.min(BACKGROUND_QUESTION_BATCH_SIZE, totalNeeded - generatedCount)
    try {
      await generateQuestionBatch(numToFetch)
      generatedCount = state.quizData.length
    } catch (error) {
      console.error("Error generating background questions:", error)
      // Stop trying if there's an error to avoid infinite loops
      break
    }
  }
  state.isGenerating = false
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

// --- CONFETTI CELEBRATION ---
function createConfetti() {
  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96c93d", "#ffd700", "#ff8a80", "#82b1ff"]
  const confettiCount = 50

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div")
    confetti.className = "confetti-piece"
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw;
      top: -10px;
      z-index: 1000;
      pointer-events: none;
      border-radius: ${Math.random() > 0.5 ? "50%" : "0"};
      animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
      transform: rotate(${Math.random() * 360}deg);
    `
    document.body.appendChild(confetti)

    // Remove after animation
    setTimeout(() => confetti.remove(), 5000)
  }
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
    // Keep question normal, just occasionally add slang to options
    newQ.question = q.question
    newQ.options = q.options.map((opt) => {
      if (opt.toLowerCase() === q.answer.toLowerCase()) {
        return opt // Keep correct answer clean
      }
      // Occasionally add slang to wrong options (30% chance)
      if (Math.random() < 0.3) {
        const slangSuffixes = ["(sus)", "(mid)", "(cap)", "(no cap)", "(fr?)"]
        return `${opt} ${slangSuffixes[Math.floor(Math.random() * slangSuffixes.length)]}`
      }
      return opt
    })
    newQ.answer = q.answer // Keep answer clean
  } else {
    // Keep short answer questions normal
    newQ.question = q.question
  }
  return newQ
}

function renderQuestion(qIndex) {
  const originalQ = state.quizData[qIndex]
  const q = state.memeMode ? transformForMemeMode(originalQ) : originalQ

  userTestForm.innerHTML = ""
  questionFeedback.innerHTML = ""
  aiFeedbackCard.style.display = "none"
  memeSection.style.display = "none"
  submitTestBtn.style.display = "block"
  questionNumberSpan.textContent = `${qIndex + 1} / ${state.settings["num-questions"]}`

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

  // Calculate time based on question type and complexity
  let startTime
  if (q.type === "mc") {
    // Multiple choice: 20-60 seconds based on question complexity
    const baseTime = 40 // Average of 20-60
    const variation = Math.random() * 40 - 20 // Random between -20 and +20
    startTime = Math.max(20, Math.min(60, Math.round(baseTime + variation)))
  } else {
    // Short answer: 110-220 seconds (average 140)
    const baseTime = 140
    const variation = Math.random() * 110 - 30 // Random between -30 and +80 to get 110-220 range
    startTime = Math.max(110, Math.min(220, Math.round(baseTime + variation)))
  }

  // Apply time boost if active
  if (state.activeEffects.timeBoost) {
    startTime += 30
    state.activeEffects.timeBoost = false
    showToast("⚡ Time boost applied! +30 seconds!")
  }

  state.questionStartTime = Date.now()
  startTimer(startTime, () => submitTestBtn.click())
  updatePowerUpDisplay()
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

async function showMidQuizReview() {
  // Temporarily hide quiz elements
  userTestForm.style.display = "none"
  submitTestBtn.style.display = "none"
  questionFeedback.style.display = "none"
  aiFeedbackCard.style.display = "none"

  // Create review container
  const reviewContainer = document.createElement("div")
  reviewContainer.id = "mid-quiz-review"
  reviewContainer.className = "mid-quiz-review"
  reviewContainer.innerHTML = `
    <h3>📊 Progress Check - Question ${state.currentQuestionIndex}</h3>
    <div class="review-stats">
      ${liveScore.innerHTML}
      ${liveStrengthsEl.innerHTML}
      ${liveWeaknessesEl.innerHTML}
    </div>
    <div class="review-recommendations">
      <h4>💡 Quick Tips</h4>
      <div id="mid-recommendations-content">Generating quick study tips...</div>
    </div>
    <button id="continue-quiz-btn" class="primary-btn">Continue Quiz 🚀</button>
  `

  // Insert review after the question number
  const questionHeader = document.querySelector("#test-section h2")
  questionHeader.insertAdjacentElement("afterend", reviewContainer)

  // Generate quick recommendations
  try {
    const recommendations = await getStudyRecommendations()
    document.getElementById("mid-recommendations-content").innerHTML = recommendations.replace(/\n/g, "<br>")
  } catch (e) {
    document.getElementById("mid-recommendations-content").textContent =
      "Keep up the great work! Focus on the areas you're struggling with."
  }

  // Add continue button handler
  document.getElementById("continue-quiz-btn").onclick = () => {
    reviewContainer.remove()
    userTestForm.style.display = "block"
    submitTestBtn.style.display = "block"
    questionFeedback.style.display = "block"
    renderQuestion(state.currentQuestionIndex)
  }
}

async function showResults() {
  // Safety check - make sure we have completed all questions
  const totalQuestions = Number.parseInt(state.settings["num-questions"], 10)
  if (state.currentQuestionIndex < totalQuestions && state.scores.length < totalQuestions) {
    console.warn("Results called prematurely, waiting for completion")
    return
  }

  // Update achievement stats
  updateAchievementStats("quizzesCompleted")
  if (state.totalScore === 100) updateAchievementStats("perfectScores")
  if (state.totalScore >= 90) updateAchievementStats("highScores")
  if (state.memeMode) updateAchievementStats("memeQuizzes")

  // Check if completed without timeouts
  let noTimeouts = true
  state.scores.forEach((score, index) => {
    if (state.userAnswers[index] === "" || state.userAnswers[index] === undefined) {
      noTimeouts = false
    }
  })
  if (noTimeouts) updateAchievementStats("noTimeouts")

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
  scoreFeedback.innerHTML = scoreText + displayAchievements()

  // 🎉 CONFETTI FOR HIGH SCORES!
  if (state.totalScore >= 90) {
    setTimeout(() => createConfetti(), 1000)
    if (state.totalScore === 100) {
      setTimeout(() => createConfetti(), 2000) // Double confetti for perfect!
    }
  }

  recommendationsContent.innerHTML = "Generating recommendations..."
  try {
    const recommendations = await getStudyRecommendations()
    recommendationsContent.innerHTML = recommendations.replace(/\n/g, "<br>")
  } catch (e) {
    console.error("Failed to get recommendations:", e)
    recommendationsContent.textContent = "Could not generate recommendations at this time."
  }

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
  const totalQuestions = Number.parseInt(state.settings["num-questions"], 10)
  const initialFetchCount = Math.min(totalQuestions, INITIAL_QUESTION_BATCH_SIZE)

  try {
    await generateQuestionBatch(initialFetchCount)
    if (state.quizData.length === 0) throw new Error("AI failed to generate initial questions.")

    inputFormSection.style.display = "none"
    testSection.style.display = "block"
    renderQuestion(state.currentQuestionIndex)

    // Start fetching the rest in the background
    if (totalQuestions > initialFetchCount) {
      generateRemainingQuestionsInBackground()
    }
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

  // Check for fast answer achievement
  if (state.questionStartTime && Date.now() - state.questionStartTime < 10000) {
    updateAchievementStats("fastAnswers")
  }

  const originalQ = state.quizData[state.currentQuestionIndex]
  const q = state.memeMode ? transformForMemeMode(originalQ) : originalQ

  let userInput =
    (userTestForm.querySelector('input[type="radio"]:checked') || userTestForm.querySelector("textarea"))?.value || ""

  // Apply lucky guess effect for MC questions
  if (state.activeEffects.luckyGuess && q.type === "mc") {
    userInput = originalQ.answer
    state.activeEffects.luckyGuess = false
    showToast("🍀 Lucky guess activated! Auto-corrected your answer!")
  }

  state.userAnswers[state.currentQuestionIndex] = userInput

  let result = { score: 0, feedback: "No answer provided." }

  if (q.type === "mc") {
    const isCorrect = userInput.toLowerCase() === originalQ.answer.toLowerCase()
    result.score = isCorrect ? 100 : 0

    // 🎉 CONFETTI FOR PERFECT ANSWERS!
    if (isCorrect && Math.random() < 0.3) {
      // 30% chance for variety
      setTimeout(() => createConfetti(), 500)
    }

    // Update streak
    if (isCorrect) {
      const newStreak = (state.achievements?.stats.currentStreak || 0) + 1
      updateAchievementStats("streak", newStreak)
    } else {
      updateAchievementStats("streak", 0)
    }

    // Apply shield effect
    if (!isCorrect && state.activeEffects.shield) {
      result.score = 50 // Minimum score with shield
      state.activeEffects.shield = false
      showToast("🛡️ Shield protected you from full point loss!")
    }

    // Apply second chance effect
    if (!isCorrect && state.activeEffects.secondChance) {
      state.activeEffects.secondChance = false
      questionFeedback.innerHTML = "<b>🔄 Second Chance!</b> Try again - you won't lose points for this attempt."
      submitTestBtn.style.display = "block"
      submitTestBtn.textContent = "Try Again"
      return
    }

    if (state.memeMode) {
      if (isCorrect) {
        const correctResponses = [
          "Periodt! That's the correct answer bestie! 💯🔥",
          "No cap, you absolutely ate that question! 🔥",
          "Slay queen/king! That's the right answer fr fr 💯",
          "You understood the assignment! Big brain energy 🧠✨",
          "That's it, that's the tweet! Correct! 🎯",
          "Main character moment right there! 💅✨",
        ]
        result.feedback = correctResponses[Math.floor(Math.random() * correctResponses.length)]
      } else {
        const incorrectResponses = [
          "Oop, that ain't it chief 💀 The correct answer was serving main character energy!",
          "Bestie... that's a no from me 😭 The right answer was right there!",
          "Not you missing that question 💀 It's giving skill issue vibes ngl",
          "Girlie/bestie, that's not the vibe 😬 The correct answer was the moment!",
          "That's... not it bestie 💀 The right answer was literally right there!",
          "Ouch, that one hit different (in a bad way) 😭",
        ]
        result.feedback =
          incorrectResponses[Math.floor(Math.random() * incorrectResponses.length)] +
          ` The correct answer is: ${originalQ.answer}`
      }
    } else {
      result.feedback = isCorrect ? "Correct!" : `Incorrect. The right answer is: ${originalQ.answer}`
    }
    questionFeedback.innerHTML = `<b>Feedback:</b> ${result.feedback}<br><em>${originalQ.explanation}</em>`
  } else {
    questionFeedback.innerHTML = "<b>AI is evaluating your answer...</b><br><em>Note: This may take a few seconds.</em>"
    try {
      result = await evaluateShortAnswer(q.question, userInput, originalQ.answer)
      questionFeedback.innerHTML = `<b>Feedback:</b> Evaluation finished.`
      aiFeedbackContent.innerHTML = `<p><strong>Score:</strong> ${result.score}%</p><p>${result.feedback}</p>`
      aiFeedbackCard.style.display = "block"

      // Update streak for short answers
      if (result.score >= 70) {
        const newStreak = (state.achievements?.stats.currentStreak || 0) + 1
        updateAchievementStats("streak", newStreak)
      } else {
        updateAchievementStats("streak", 0)
      }
    } catch (e) {
      console.error("Evaluation error:", e)
      result = { score: 50, feedback: "Could not evaluate automatically. Partial credit given." }
      questionFeedback.textContent = result.feedback
    }
  }

  // Apply double points effect
  if (state.activeEffects.doublePoints) {
    result.score *= 2
    result.score = Math.min(result.score, 100) // Cap at 100%
    state.activeEffects.doublePoints = false
    showToast("💎 Double points applied!")
  }

  state.scores[state.currentQuestionIndex] = result.score
  state.feedbacks[state.currentQuestionIndex] = result.feedback

  if (result.score >= 85) state.strengths.add(originalQ.topic)
  else state.weaknesses.add(originalQ.topic)
  updateLiveStats()
  awardPowerUp()

  // Reset submit button text
  submitTestBtn.textContent = "Submit Answer"

  // Wait for feedback to be shown, then move to next question
  setTimeout(
    () => {
      state.currentQuestionIndex++
      const totalQuestions = Number.parseInt(state.settings["num-questions"], 10)

      // Check for mid-quiz review every 10 questions
      if (state.currentQuestionIndex % 10 === 0 && state.currentQuestionIndex < totalQuestions) {
        setTimeout(
          () => {
            showMidQuizReview()
          },
          q.type === "short" ? 4000 : state.memeMode ? 3000 : 1500,
        )
        return
      }

      if (state.currentQuestionIndex < totalQuestions) {
        // Check if the next question is ready
        if (state.quizData[state.currentQuestionIndex]) {
          renderQuestion(state.currentQuestionIndex)
        } else {
          // Show a mini-loader and wait for it
          questionFeedback.innerHTML = "<b>Generating next question...</b>"
          aiFeedbackCard.style.display = "none"
          memeSection.style.display = "none"

          let waitAttempts = 0
          const maxWaitAttempts = 20 // 10 seconds max wait

          const waitInterval = setInterval(() => {
            waitAttempts++

            if (state.quizData[state.currentQuestionIndex]) {
              clearInterval(waitInterval)
              renderQuestion(state.currentQuestionIndex)
            } else if (waitAttempts >= maxWaitAttempts) {
              // Timeout - force finish the quiz
              clearInterval(waitInterval)
              console.warn("Timeout waiting for next question, finishing quiz")
              showResults()
            }
          }, 500) // Check every half a second
        }
      } else {
        // All questions completed
        console.log("All questions completed, showing results")
        showResults()
      }
    },
    q.type === "short" ? 4000 : state.memeMode ? 3000 : 1500,
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

  // Power-up event listeners
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("power-up-btn")) {
      const powerType = e.target.dataset.power
      if (powerType && !e.target.disabled) {
        usePowerUp(powerType)
      }
    }
  })

  resetState()
  state.memeMode = false
  document.body.classList.remove("meme-mode")
}

init()

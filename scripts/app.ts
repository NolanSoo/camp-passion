// Race to Survive - TypeScript version
// Core logic inspired by your TS reference

// --- Types ---
interface StudyQuestion {
  type: 'mc' | 'short';
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

// This file handles the main logic of the application, including form submission, managing user input, and displaying results. It also integrates with the chatbot API to generate tests based on user input.

class TestApp {
    constructor() {
        this.chatbot = new DeepSeekChatbot();
        this.currentTest = null;
        this.timeRemaining = 0;
        this.timerInterval = null;
        this.userAnswers = new Map();
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('test-form');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const topic = document.getElementById('topic').value;
        const gradeLevel = document.getElementById('grade-level').value;
        const subject = document.getElementById('subject').value;
        const description = document.getElementById('description').value;
        
        // Default to 10 questions with 30% short answer
        const numQuestions = 10;
        const shortAnswerPercentage = 30;

        try {
            document.getElementById('test-output').innerHTML = '<div class="loading"></div>';
            
            this.currentTest = await this.chatbot.generateTest(
                topic, gradeLevel, subject, description, 
                numQuestions, shortAnswerPercentage
            );

            this.renderTest();
            this.startTimer();
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('test-output').innerHTML = 
                '<p class="error">Error generating test. Please try again.</p>';
        }
    }

    renderTest() {
        const output = document.getElementById('test-output');
        output.innerHTML = '';

        // Create timer element
        const timer = document.createElement('div');
        timer.className = 'timer';
        timer.id = 'timer';
        document.body.appendChild(timer);

        // Create test form
        const testForm = document.createElement('form');
        testForm.id = 'active-test';
        testForm.addEventListener('submit', (e) => this.handleTestSubmit(e));

        this.currentTest.questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            
            const questionTitle = document.createElement('h3');
            questionTitle.textContent = `Question ${index + 1}`;
            questionDiv.appendChild(questionTitle);

            const questionText = document.createElement('p');
            questionText.textContent = question.question;
            questionDiv.appendChild(questionText);

            if (question.type === 'multiple-choice') {
                const options = document.createElement('div');
                options.className = 'options';
                
                question.options.forEach((option, optIndex) => {
                    const label = document.createElement('label');
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = `q${index}`;
                    radio.value = option.charAt(0);
                    radio.required = true;
                    
                    label.appendChild(radio);
                    label.appendChild(document.createTextNode(option));
                    options.appendChild(label);
                });
                
                questionDiv.appendChild(options);
            } else {
                const textarea = document.createElement('textarea');
                textarea.className = 'short-answer';
                textarea.name = `q${index}`;
                textarea.required = true;
                textarea.placeholder = 'Enter your answer here...';
                questionDiv.appendChild(textarea);
            }

            testForm.appendChild(questionDiv);
        });

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Submit Test';
        testForm.appendChild(submitButton);

        output.appendChild(testForm);
        
        // Start the timer
        this.timeRemaining = this.currentTest.timeLimit * 60;
        this.updateTimerDisplay();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                clearInterval(this.timerInterval);
                this.handleTestSubmit(new Event('submit'));
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        document.getElementById('timer').textContent = 
            `Time Remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    async handleTestSubmit(e) {
        e.preventDefault();
        clearInterval(this.timerInterval);

        const form = document.getElementById('active-test');
        if (!form) return;

        const feedback = document.getElementById('score-feedback');
        feedback.innerHTML = '<div class="loading"></div>';

        let totalScore = 0;
        let totalQuestions = this.currentTest.questions.length;
        let evaluations = [];

        for (let i = 0; i < totalQuestions; i++) {
            const question = this.currentTest.questions[i];
            const answer = form[`q${i}`].value;

            if (question.type === 'multiple-choice') {
                if (answer === question.correctAnswer) {
                    totalScore += 100;
                    evaluations.push({
                        score: 100,
                        feedback: 'Correct!',
                        explanation: question.explanation
                    });
                } else {
                    totalScore += 0;
                    evaluations.push({
                        score: 0,
                        feedback: 'Incorrect.',
                        explanation: question.explanation
                    });
                }
            } else {
                const evaluation = await this.chatbot.evaluateShortAnswer(
                    question.question,
                    answer,
                    question.keyPoints
                );
                totalScore += evaluation.score;
                evaluations.push(evaluation);
            }
        }

        const averageScore = totalScore / totalQuestions;
        this.renderFeedback(averageScore, evaluations);
    }

    renderFeedback(score, evaluations) {
        const feedback = document.getElementById('score-feedback');
        feedback.innerHTML = '';

        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'feedback-section';
        scoreDiv.innerHTML = `
            <h3>Final Score: ${Math.round(score)}%</h3>
            <p>${score >= 70 ? 'Congratulations! You passed!' : 'Keep studying! You can improve!'}</p>
        `;
        feedback.appendChild(scoreDiv);

        const detailedFeedback = document.createElement('div');
        detailedFeedback.className = 'feedback-section';
        detailedFeedback.innerHTML = '<h3>Detailed Feedback</h3>';

        evaluations.forEach((evaluation, index) => {
            const questionFeedback = document.createElement('div');
            questionFeedback.className = 'question-feedback';
            questionFeedback.innerHTML = `
                <h4>Question ${index + 1}</h4>
                <p>Score: ${evaluation.score}%</p>
                <p>${evaluation.feedback}</p>
                ${evaluation.improvements ? `<p>Areas for improvement: ${evaluation.improvements}</p>` : ''}
                ${evaluation.explanation ? `<p>Explanation: ${evaluation.explanation}</p>` : ''}
            `;
            detailedFeedback.appendChild(questionFeedback);
        });
        feedback.appendChild(detailedFeedback);

        const studyTopics = document.createElement('div');
        studyTopics.className = 'study-topics';
        studyTopics.innerHTML = '<h3>Recommended Study Topics</h3>';
        
        const topics = new Set();
        evaluations.forEach(evaluation => {
            if (evaluation.studySuggestions) {
                evaluation.studySuggestions.forEach(topic => topics.add(topic));
            }
        });
        this.currentTest.relatedTopics.forEach(topic => topics.add(topic));

        topics.forEach(topic => {
            const topicElement = document.createElement('div');
            topicElement.className = 'study-topic';
            topicElement.textContent = topic;
            studyTopics.appendChild(topicElement);
        });
        
        feedback.appendChild(studyTopics);
    }
}

// Initialize the app when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.testApp = new TestApp();
});
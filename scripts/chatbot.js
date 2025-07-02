// This file contains the code for interacting with the DeepSeek AI chatbot API. 
// It manages the API requests and responses, including formatting the data to be sent and processing the results received from the API.

class DeepSeekChatbot {
    constructor() {
        this.apiKey = 'a29cfe4fa6mshb63da984e4b3f7dp12efdajsneda384ed8b83';
        this.apiHost = 'deepseek-v31.p.rapidapi.com';
    }

    async generateTest(topic, gradeLevel, subject, description, numQuestions, shortAnswerPercentage) {
        const shortAnswerCount = Math.floor(numQuestions * (shortAnswerPercentage / 100));
        const multipleChoiceCount = numQuestions - shortAnswerCount;

        const prompt = `Create a test with the following specifications:
            - Topic: ${topic}
            - Grade Level: ${gradeLevel}
            - Subject: ${subject}
            - Additional Context: ${description}
            - Number of multiple choice questions: ${multipleChoiceCount}
            - Number of short answer questions: ${shortAnswerCount}
            
            Format the response as a JSON object with this structure:
            {
                "questions": [
                    {
                        "type": "multiple-choice",
                        "question": "question text",
                        "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
                        "correctAnswer": "A",
                        "explanation": "explanation of the correct answer"
                    },
                    {
                        "type": "short-answer",
                        "question": "question text",
                        "sampleAnswer": "example of a complete answer",
                        "keyPoints": ["point1", "point2", "point3"],
                        "minimumRequiredPoints": "number of points needed for 70%"
                    }
                ],
                "relatedTopics": ["topic1", "topic2", "topic3"],
                "timeLimit": "recommended time in minutes"
            }`;

        const data = JSON.stringify({
            model: 'DeepSeek-V3-0324',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });

        try {
            const response = await fetch('https://deepseek-v31.p.rapidapi.com/', {
                method: 'POST',
                headers: {
                    'x-rapidapi-key': this.apiKey,
                    'x-rapidapi-host': this.apiHost,
                    'Content-Type': 'application/json'
                },
                body: data
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const result = await response.json();
            return JSON.parse(result.choices[0].message.content);
        } catch (error) {
            console.error('Error generating test:', error);
            throw error;
        }
    }

    async evaluateShortAnswer(question, userAnswer, keyPoints) {
        const prompt = `Evaluate this short answer response:
            Question: ${question}
            User's Answer: ${userAnswer}
            Key Points Required: ${JSON.stringify(keyPoints)}
            
            Please provide:
            1. Score (0-100)
            2. Feedback on what was good
            3. Areas for improvement
            4. Additional study suggestions
            
            Format as JSON:
            {
                "score": number,
                "feedback": "string",
                "improvements": "string",
                "studySuggestions": ["topic1", "topic2"]
            }`;

        const data = JSON.stringify({
            model: 'DeepSeek-V3-0324',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });

        try {
            const response = await fetch('https://deepseek-v31.p.rapidapi.com/', {
                method: 'POST',
                headers: {
                    'x-rapidapi-key': this.apiKey,
                    'x-rapidapi-host': this.apiHost,
                    'Content-Type': 'application/json'
                },
                body: data
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const result = await response.json();
            return JSON.parse(result.choices[0].message.content);
        } catch (error) {
            console.error('Error evaluating answer:', error);
            throw error;
        }
    }
}
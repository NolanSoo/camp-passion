// This file handles the main logic of the application, including form submission, managing user input, and displaying results. It also integrates with the chatbot API to generate tests based on user input.

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('test-form');
    const resultSection = document.getElementById('result-section');
    const feedbackSection = document.getElementById('feedback-section');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const topic = document.getElementById('topic').value;
        const gradeLevel = document.getElementById('grade-level').value;
        const subject = document.getElementById('subject').value;
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;

        const testData = {
            topic,
            gradeLevel,
            subject,
            title,
            description
        };

        try {
            const test = await generateTest(testData);
            displayResults(test);
        } catch (error) {
            console.error('Error generating test:', error);
            feedbackSection.innerText = 'There was an error generating the test. Please try again.';
        }
    });

    async function generateTest(data) {
        const response = await fetch('https://api.deepseek.ai/generate-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        return result;
    }

    function displayResults(test) {
        resultSection.innerHTML = `
            <h2>${test.title}</h2>
            <p>${test.description}</p>
            <ul>
                ${test.questions.map(question => `<li>${question}</li>`).join('')}
            </ul>
        `;
        feedbackSection.innerText = 'Test generated successfully!';
    }
});
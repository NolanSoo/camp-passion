// This file contains the code for interacting with the DeepSeek AI chatbot API. 
// It manages the API requests and responses, including formatting the data to be sent and processing the results received from the API.

const chatbotAPIUrl = 'https://api.deepseek.ai/generate-test'; // Replace with the actual API endpoint

async function generateTest(userInput) {
    try {
        const response = await fetch(chatbotAPIUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userInput),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        return data; // Assuming the API returns the generated test data
    } catch (error) {
        console.error('Error generating test:', error);
        throw error; // Rethrow the error for further handling
    }
}

function formatUserInput(topic, gradeLevel, subject, title, description) {
    return {
        topic: topic,
        gradeLevel: gradeLevel,
        subject: subject,
        title: title,
        description: description,
    };
}

// Example usage
// const userInput = formatUserInput('Math', '5th Grade', 'Algebra', 'Algebra Test', 'Test on basic algebra concepts');
// generateTest(userInput).then(test => console.log(test));
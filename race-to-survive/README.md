# Race to Survive

## Overview
"Race to Survive" is an interactive application designed to help users generate customized tests based on their input. The app features an AI chatbot named DeepSeek that assists in creating tests tailored to specific topics, grade levels, and subjects.

## Project Structure
```
race-to-survive
├── src
│   ├── index.html        # Main HTML structure of the application
│   ├── styles
│   │   └── main.css      # Styles for the application
│   ├── scripts
│   │   ├── app.js        # Main logic for handling user input and displaying results
│   │   └── chatbot.js     # Code for interacting with the DeepSeek AI chatbot API
│   └── assets
│       └── (empty)       # Placeholder for any assets (images, etc.)
├── README.md             # Documentation for the project
```

## Features
- User-friendly form for inputting test parameters (topic, grade level, subject, title, description/notes).
- Integration with DeepSeek AI chatbot for generating tests based on user input.
- Dynamic display of generated tests and results.
- Scoring system and feedback mechanism for users.

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd race-to-survive
   ```
3. Open the `src/index.html` file in a web browser to view the application.

## Usage Guidelines
- Fill out the form with the desired test parameters.
- Click the "Generate Test" button to interact with the DeepSeek chatbot.
- Review the generated test and results displayed on the page.

## Future Enhancements
- Additional question types and formats.
- User authentication for saving generated tests.
- Enhanced scoring algorithms and feedback options.
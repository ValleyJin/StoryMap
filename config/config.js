import dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

export const config = {
    firebase: {
        apiKey: "your-api-key",
        authDomain: "your-project.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "your-sender-id",
        appId: "your-app-id"
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY
    }
}; 
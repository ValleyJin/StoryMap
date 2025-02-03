/**
 * 이 파일은 Firebase Firestore, GitHub API, OpenAI API를 통합하여 
 * GitHub Pages와 Firestore를 활용한 시스템을 구축
 */

// Firebase 기반 GitHub Pages + Firestore 시스템
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GithubAuthProvider } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { Configuration, OpenAIApi } from "https://cdn.jsdelivr.net/npm/openai@1.61.0/+esm";
import { config } from '../config/config.js';

// Firebase 설정
const firebaseConfig = config.firebase;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const provider = new GithubAuthProvider();

// OpenAI API 설정
const openai = new OpenAIApi(new Configuration({ 
    apiKey: config.openai.apiKey 
}));

// Genesis Node 상수 정의 추가
const GENESIS_NODE = {
    id: "0",
    title: "Genesis",
    content: "From the abyss of nothingness, the Multiverse awakened through the power of GemSTON, each realm shimmering into existence like stars igniting within the light of creation, growing ever brighter as they flourished.",
    owner: "system"
};

// GitHub 로그인 기능
export async function loginWithGithub() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("GitHub 로그인 성공:", user);
        return user;
    } catch (error) {
        console.error("GitHub 로그인 오류:", error);
        return null;
    }
}

// Firestore에 스토리 추가
export async function addStory(title, content, userId) {
    const summary = await generateSummary(content);
    await addDoc(collection(db, "stories"), {
        title: title,
        summary: summary,
        content: content,
        userId: userId,
        createdAt: new Date()
    });
    fetchStories();
}

// Firestore에서 스토리 목록 가져오기
export async function fetchStories() {
    const querySnapshot = await getDocs(collection(db, "stories"));
    const stories = [];
    
    // Genesis Node 추가
    stories.push(GENESIS_NODE);
    
    // 나머지 스토리들을 번호순으로 정렬하여 추가
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        stories.push(data);
    });
    
    // 파일명의 숫자를 기준으로 정렬
    stories.sort((a, b) => {
        const numA = parseInt(a.filename.match(/^\d+/)[0]);
        const numB = parseInt(b.filename.match(/^\d+/)[0]);
        return numA - numB;
    });

    return stories;
}

// OpenAI API를 활용한 요약 생성
async function generateSummary(text) {
    try {
        const response = await openai.createCompletion({
            model: "gpt-4-turbo",
            prompt: `Summarize this text in under 300 characters: ${text}`,
            max_tokens: 100
        });
        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error("OpenAI 요약 생성 오류:", error);
        return text.substring(0, 300);
    }
}

// GitHub에서 MyStory 폴더 md 파일 가져오기
export async function fetchMarkdownFiles(userId) {
    const githubApiUrl = `https://api.github.com/repos/${userId}/MyStory/contents/`;
    const response = await fetch(githubApiUrl);
    if (response.ok) {
        const files = await response.json();
        return files.filter(file => file.name.endsWith(".md"));
    }
    return [];
}

// 페이지 로딩 시 실행
window.onload = function() {
    fetchStories();
};

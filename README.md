# Storymap Project

## 📌 프로젝트 개요
이 프로젝트는 **GitHub Pages + Firebase Firestore**를 활용하여 **스토리 네트워크 관리 시스템**을 구축하는 프로젝트입니다. 
사용자는 자신의 **GitHub 계정**을 통해 로그인하여 스토리를 업로드하고, Firestore에 저장된 데이터를 **D3.js** 기반의 네트워크 그래프로 시각화할 수 있습니다.

---

## 🚀 주요 기능
### 🔹 **Firebase Firestore 데이터 관리**
- 사용자가 입력한 스토리를 Firestore에 저장
- OpenAI API를 활용하여 300자 내외의 요약 자동 생성
- GitHub API를 통해 사용자의 `MyStory` 폴더 내 `.md` 파일을 자동으로 불러오기

### 🔹 **GitHub 인증 시스템**
- Firebase Authentication을 사용하여 GitHub 로그인 지원
- 인증된 사용자만 스토리를 업로드 가능

### 🔹 **D3.js 기반 시각화**
- Firestore에서 가져온 데이터를 네트워크 그래프로 시각화
- 노드(스토리)가 연결된 구조로 표시됨

---

## 📂 폴더 구조
```
📦 storymap_project
├── 📂 public                    # GitHub Pages에서 호스팅되는 파일
│   ├── index.html              # ✅ 웹페이지 UI
│   ├── styles.css              # ✅ 스타일링
│   ├── firebase_storymap_system.js  # ✅ Firebase Firestore, GitHub API, OpenAI API 통합 코드
│   ├── visualization.js        # ✅ D3.js 기반 네트워크 시각화
│   ├── firebase.json           # Firebase Hosting 설정 파일
│   ├── README.md               # 프로젝트 설명
├── README.md                   # 최상위 프로젝트 설명
```

---

## 🔧 **설치 및 실행 방법**
### ✅ **1. Firebase 설정**
1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Firestore 데이터베이스 생성 (모드: 시작 모드)
3. Firebase Authentication에서 GitHub 로그인 활성화
4. Firebase 프로젝트 설정에서 API 키 및 설정값 가져오기

### ✅ **2. GitHub Pages 배포**
```bash
# GitHub에 변경 사항 반영
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```
- GitHub 저장소의 **Settings > Pages**에서 `public/` 폴더를 GitHub Pages로 배포 설정

### ✅ **3. Firebase Hosting 배포 (선택 사항)**
```bash
firebase login
firebase init hosting
firebase deploy
```

---

## 🛠 **기술 스택**
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Firebase Firestore, Firebase Authentication
- **API:** GitHub API, OpenAI API
- **Data Visualization:** D3.js

---

## 📝 **TODO**
- [ ] **스토리 삭제 및 수정 기능 추가**
- [ ] **스토리 검색 기능 구현**
- [ ] **Firestore 데이터 정렬 최적화**

---

## 📬 문의
📧 **이슈를 제출하거나 Pull Request를 통해 프로젝트 개선에 기여해주세요!** 🚀

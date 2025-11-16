
# **FlowSpace – A No-Shame Study Companion**

FlowSpace is a warm, accessibility-forward study platform designed to help students focus, review, and regulate—without grind culture.
It features an adaptive focus timer, AI-powered quiz generator, burnout-safe emotional check-ins, and a lightweight time-management coach.

This project was created with a strong emphasis on **accessibility, color-sensitivity, responsive layouts, and neurodiverse-friendly design**.

---

##  **Features**

### ** Adaptive Focus Timer**

* Soft → Focus → Deep lock-in levels
* Shooting-star animated progress bar
* Built-in micro-task list
* Task-based session tracking

### ** AI Quiz Generator**

* Converts PDFs, notes, or raw text into friendly practice questions
* Supports difficulty levels: chill / normal / spicy
* Local storage support for saved quiz sets

### ** Safe Space**

* Grounding prompts
* Affirmations and emotional regulation tools
* Gentle UI intentionally designed for burnout-safe usage

### ** Time & Priority Coach**

* Simplified decision-making tool for planning your next 60–90 minutes
* Reduces cognitive overload

### ** Full Accessibility Engine**

* Light / dark mode
* High-contrast mode
* Adjustable text sizes (A-, A, A+)
* Dyslexia-friendly font toggle
* Responsive mobile-first layout
* Skip-to-content link
* Color-safe gradients and contrast-aware theming

---

## **Tech Stack**

### **Frontend**

* React (TypeScript)
* React Router
* Custom CSS with theme tokens
* SVG-based Figma-exported logo + UI components
* LocalStorage persistence
* Accessibility attributes mapped directly to `<html>`

### **Backend**

* Node + Express
* AI question generation endpoint
* PDF parsing endpoint
* CORS enabled for local development

---

## **Project Structure**

```
client/
  src/
    App.tsx
    App.css
    Components/
      HomePage.tsx
      FlowTimer.tsx
      QuickQuiz.tsx
      SafeSpace.tsx
      TimeCoach.tsx
      ProfilePage.tsx
      FlowSpaceLogo.tsx
    config.ts

server/
  index.js
  routes/
    quizRoutes.js
    healthCheck.js
```

---

## **Installation & Setup**

### **1. Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/flowspace.git
cd flowspace
```

---

### **2. Install dependencies**

#### **Client**

```bash
cd client
npm install
npm run dev
```

#### **Server**

```bash
cd server
npm install
npm run dev
```

---

### **3. Environment Variables**

Create **server/.env**:

```
PORT=5001
OPENAI_API_KEY=your_key_here
```

Create **client/src/config.ts**:

```ts
export const API_BASE_URL = "http://localhost:5001";
```

---

## **API Endpoints**

### **Health Check**

`GET /`

### **Generate quiz questions**

`POST /quiz/generate`

Body:

```json
{
  "text": "input text or extracted PDF text",
  "difficulty": "chill"
}
```

Returns:

```json
{
  "questions": [
    { "q": "...", "a": "..." }
  ]
}
```

---

##  **Screenshots**

(Replace these paths with your own)

```
/public/screenshots/home.png  
/public/screenshots/timer.png  
/public/screenshots/quiz.png  
/public/screenshots/safespace.png  
```

You can add them like:

```md
![Home](public/screenshots/home.png)
![Timer](public/screenshots/timer.png)
```

---

## **Responsive Design**

FlowSpace is fully responsive:

* Mobile-first layouts
* Collapsible top navigation with hamburger menu
* Scales gracefully on tablets and ultrawide screens
* Dynamic card grids

---

## **Accessibility**

FlowSpace includes a full accessibility system:

* `data-theme="light/dark"`
* `data-high-contrast="on/off"`
* `data-text-size="small/medium/large"`
* `data-dyslexia="on/off"`

All modes update the `<html>` root to cascade global styling.

Controls are exposed in the navbar for fast toggling.

---

## **Deployment**

### **Client (Vercel or Netlify)**

Just deploy the `client/` folder.

### **Server (Railway, Render, Fly.io)**

Deploy the `server/` folder with:

* Node 18+
* Environment variables (API key)

Update `API_BASE_URL` in `config.ts` to your deployed backend.

---
## AI Assistance Notice

FlowSpace was developed with assistance from **Cline CLI** for code scaffolding and debugging during development.  
Additionally, AI models were used for generating documentation text, refining UI copy, and powering quiz-generation logic via API.  
All AI-generated code and text were reviewed, edited, and validated manually by the developer.
---

## **License**

MIT License — free for personal and academic use.

---

##  **Contributions**

Pull requests welcome!
This project is designed for learning, design experimentation, and accessibility innovation.

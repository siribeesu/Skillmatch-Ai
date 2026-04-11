# 🎯 SkillMatch AI

**SkillMatch AI** is a high-performance, autonomous Chrome Extension designed to bridge the gap between your resume and live job descriptions on platforms like LinkedIn, Indeed, and more. 

---

## 🚀 Core Features

*   **📈 Smart In-Page Badges**: Automatically injects a **Match % Badge** directly into job cards on LinkedIn and Indeed as you browse.
*   **⚡ Recruiter-Calibrated Scoring**: Uses a linear point-sharing system to ensure accurate match calculations without drastic score drops.
*   **🔍 Deep-Context Detection**: Capable of identifying technical skills even when they are buried in conversational job descriptions.
*   **🛠️ Interactive Skill Manager**: View your saved profile and manually **Add** or **Remove** skills to fine-tune your matching precision.
*   **🔒 100% Privacy Focused**: All resume parsing and matching is done **locally** on your browser. Your data never leaves your computer.
*   **📄 PDF & DOCX Support**: Native parsing for all common resume document formats.

---

## 🌐 Quick Installation (No Setup Needed)

For the easiest experience, you can load the pre-built extension folder directly:

1.  **Download** or Clone this repository.
2.  Open **Google Chrome** and navigate to: `chrome://extensions/`
3.  Enable **"Developer Mode"** (toggle in the top-right corner).
4.  Click the **"Load Unpacked"** button.
5.  Select the **`dist`** folder from inside this project directory.
6.  **Done!** SkillMatch AI will now appear in your browser. Pin it for quick access!

---

## 💻 Developer Setup (Optional)

If you'd like to build the project from scratch or modify the scoring logic:

1.  **Prerequisites**: Install [Node.js](https://nodejs.org/) (v16+).
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Build Assets**:
    ```bash
    npm run build
    ```
4.  **Live Development**:
    ```bash
    npm run dev  # Re-builds automatically on file change
    ```

---

## 🔧 Troubleshooting

*   **"No direct matches found"**: Make sure you have uploaded your resume (PDF/DOCX) using the extension popup first.
*   **Score is 0%**: Try clicking "Analyze" while you are on a specific job post page.
*   **Badges not showing in list**: If LinkedIn refreshes its layout, simply refresh your browser tab to re-trigger the automatic badging.

---

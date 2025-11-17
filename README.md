<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/10YiHYwnQT80we32G1x7i21Qjgw6U7Adt

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file and add your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and set `VITE_GEMINI_API_KEY` to your Gemini API key.

   Get your API key from: https://aistudio.google.com/apikey

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

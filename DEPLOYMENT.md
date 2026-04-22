# 🚀 Deployment Guide: Secured Exam Portal

Follow this guide to get your application running 24/7 on the internet for free.

## Prerequisites
1.  **GitHub Account** (to host your code).
2.  **Render Account** (for the Backend/Database).
3.  **Vercel Account** (for the Frontend website).

---

## Step 1: Push Code to GitHub
1.  Create a **New Repository** on GitHub (e.g., `exam-portal`).
2.  Open your terminal in VS Code (Root folder) and run:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/exam-portal.git
    git push -u origin main
    ```

---

## Step 2: Deploy Backend (Render)
1.  Go to [dashboard.render.com](https://dashboard.render.com).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Configuration:**
    -   **Name:** `exam-backend`
    -   **Root Directory:** `backend` (Important!)
    -   **Environment:** Node
    -   **Build Command:** `npm install`
    -   **Start Command:** `npm start`
5.  **Environment Variables (Scroll down to "Environment"):**
    -   Add key: `MONGODB_URI`, value: `(Your MongoDB Connection String)`
    -   Add key: `JWT_SECRET`, value: `(A long random secret password)`
    -   Add key: `ADMIN_EMAIL`, value: `admin@example.com`
    -   Add key: `CLIENT_ORIGIN`, value: `(Your Vercel Frontend URL, e.g., https://my-exam-app.vercel.app)`
6.  Click **Create Web Service**.
7.  Wait for deployment. Copy the **URL** (e.g., `https://exam-backend.onrender.com`).

---

## Step 3: Deploy Frontend (Vercel)
1.  Go to [vercel.com](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configure Project:**
    -   **Framework:** Vite
    -   **Root Directory:** Click "Edit" and select `frontend`.
5.  **Environment Variables:**
    -   Add key: `VITE_API_URL`
    -   Value: `https://exam-backend.onrender.com` (The URL you copied from Render).
    -   **Important:** Do NOT add a trailing slash `/` at the end of the URL.
6.  Click **Deploy**.

---

## 🎉 Done!
Your exam portal is now online!
-   **Students** can access it via the **Vercel URL**.
-   You can turn off your laptop, and the site will keep running.

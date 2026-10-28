# AgroSphere
An AI-powered smart agriculture ecosystem connecting the complete farming lifecycle—from crop planning and disease detection to direct sales, profit tracking, and agricultural waste recycling.

---

## 🌾 Project Overview

AgroSphere integrates 5 pillars of modern smart agriculture:
1. **AI-Based Crop Recommendation**: Suggests optimal crops based on soil nutrients ($N, P, K, pH$) and climate metrics.
2. **Crop Disease Detection**: Instant vision-based leaf disease diagnosis with actionable treatment advice.
3. **Farmer-to-Consumer Marketplace**: Eliminates middlemen by enabling farmers to sell produce directly to buyers.
4. **Agricultural Waste Recycling**: Marketplace and matchmaking for crop residue, biomass, and stubble repurposing.
5. **Farm Expense & Profit Tracking**: Intuitive bookkeeping of farm inputs, operational costs, yields, and profit margins.

---

## 🏗️ Architecture & Communication Flow

```text
React Frontend (Vite) [Port 5173]
       │
       │ HTTP / REST
       ▼
Spring Boot Backend [Port 8080] ◄─── JDBC / SQL ───► Supabase PostgreSQL [Port 5432]
       │
       │ Internal HTTP / REST
       ▼
Python FastAPI AI Service [Port 8000]
```

* **Frontend (`client/`)**: Communicates with the Spring Boot backend (`http://localhost:8080/api`).
* **Backend (`server/`)**: Manages authentication, business logic, marketplace transactions, expense tracking, and persistence in Supabase PostgreSQL.
* **AI Service (`ai-service/`)**: Exposes lean inference endpoints for crop recommendations and disease diagnosis. Spring Boot delegates AI tasks here.

---

## 📁 Repository Structure

```text
AgroSphere/
├── client/          # React.js + Vite frontend application
├── server/          # Java Spring Boot 3 REST API backend
├── ai-service/      # Python FastAPI machine learning service
├── .gitignore       # Root ignore rules for Node, Java, and Python
├── .env.example     # Template for shared environment variables
└── README.md        # Project guide & team documentation
```

---

## 🚀 Quickstart for Team Members

### 1. Prerequisites
* **Node.js**: v18+ (tested on Node 20+)
* **Java**: JDK 17 or JDK 21
* **Maven**: 3.8+ (or use included wrapper)
* **Python**: 3.10+ (tested on Python 3.11 - 3.13)
* **Supabase Account**: A free project with a PostgreSQL database URL

---

### 2. Running the AI Service (Python FastAPI)

```bash
cd ai-service

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000
```
* **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
* **Interactive API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 3. Running the Main Backend (Spring Boot)

```bash
cd server

# Configure environment variables (or copy .env.example to your environment)
# Provide your Supabase database credentials in application.yml or via env vars

# Run with Maven
mvn spring-boot:run
```
* **Health Check**: [http://localhost:8080/api/health](http://localhost:8080/api/health)
* **Default Port**: `8080`

---

### 4. Running the Frontend (React + Vite)

```bash
cd client

# Install packages
npm install

# Start Vite dev server
npm run dev
```
* **Frontend App**: [http://localhost:5173](http://localhost:5173)

---

## 🤝 Hackathon Git Collaboration Rules

1. **Branching**: Always branch off `main` for your feature:
   * `git checkout -b feat/your-feature-name`
2. **Never Commit Secrets**: Never push `.env` files or API keys. Always use `.env.example` as a template.
3. **Keep Modules Independent**: Keep frontend services, backend controllers, and AI endpoints loosely coupled using REST contracts.

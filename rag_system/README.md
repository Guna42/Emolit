---

```md
# 🧠 Unified Data Spine — RAG + Emotional Intelligence AI

A Retrieval-Augmented Generation (RAG) system that analyzes user emotions and gives structured, practical responses using the RULER framework.

---

## 🚀 What it does

- Understands user emotions from text
- Maps them using the RULER framework
- Retrieves relevant emotional context
- Generates structured responses
- Suggests simple, practical actions

---

## ⚙️ Pipeline

User Query  
↓  
Embedding (MiniLM - local)  
↓  
ChromaDB Retrieval  
↓  
Prompt Builder  
↓  
LLM (Gemini)  
↓  
Final Response

---

## 📁 Project Structure

```

rag_system/
├── main.py
├── ingest.py
├── rag.py
├── ruler_mapper.py
├── config.py
├── requirements.txt
├── README.md
└── data/
├── Emotions_vocabulary_final.xlsx
└── Task_1-_Neha.docx

```

---

## ⚡ Setup

### 1. Create virtual environment

```bash
python -m venv .venv
```

Activate:

**Windows**

```bash
.venv\Scripts\activate
```

**Mac/Linux**

```bash
source .venv/bin/activate
```

---

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

---

### 3. Add data files

Place inside `data/` folder:

- Emotions_vocabulary_final.xlsx
- Task_1-\_Neha.docx

---

### 4. Set API Key

**Windows**

```bash
set GEMINI_API_KEY=your_api_key
```

**Mac/Linux**

```bash
export GEMINI_API_KEY=your_api_key
```

---

### 5. Run the project

First time (with ingestion):

```bash
python main.py --ingest
```

Normal run:

```bash
python main.py
```

```bash
 $env:GEMINI_API_KEY="YOUR_API_KEY"

```

Single query:

```bash
python main.py --query "I feel overwhelmed with work"
```

---

## 💬 Example Output

```
Emotion: Overwhelmed

Recognize:
You are feeling burdened by too many responsibilities.

Understand:
Constant pressure is draining your energy.

Label:
Overwhelmed

Express:
This is completely normal when things pile up.

Regulate:
Focus on one thing at a time.

What can be done:
* Pick one important task
* Take a short break and eat
* Go for a 5–10 minute walk
* Remind yourself: step by step
```

---

## 🧩 RULER Framework

- Recognize → identify emotion
- Understand → why it happens
- Label → name it
- Express → acknowledge it
- Regulate → manage it

---

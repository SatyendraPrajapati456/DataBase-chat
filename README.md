# 🗃️ DataChat — Chat With Your Cloud Databases

<p align="center">
  <strong>A SaaS application that lets you connect your cloud databases and query them using natural language.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
  <img src="https://img.shields.io/badge/Azure_SQL-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white" alt="Azure SQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

---

## 📖 Overview

**DataChat** is a cloud database intelligence platform that enables users to:

- 🔌 **Connect** to cloud databases on Azure, AWS, and GCP
- 🔍 **Browse** database schemas — tables, views, columns, types, and primary keys
- 👁️ **Preview** table data with sortable columns and row counts
- 💬 **Chat** with your data using natural language → AI generates SQL → executes on your database
- 📊 **Visualize** query results as interactive charts (bar, line) or data tables
- 🔐 **Security-first** — read-only SQL enforcement, no destructive queries allowed

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)               │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Sidebar  │  │  Chat Panel  │  │  Results Panel     │  │
│  │ • Connect│  │  • NL Query  │  │  • Charts          │  │
│  │ • Schema │  │  • History   │  │  • Data Tables     │  │
│  │ • Preview│  │  • Streaming │  │  • Generated SQL   │  │
│  └──────────┘  └──────────────┘  └───────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (axios)
┌────────────────────────▼────────────────────────────────┐
│                   Backend (FastAPI + Uvicorn)             │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │ Connection   │  │ Metadata    │  │ Chat Router    │  │
│  │ Router       │  │ Router      │  │                │  │
│  └──────┬───────┘  └──────┬──────┘  └───────┬────────┘  │
│         │                 │                 │            │
│  ┌──────▼─────────────────▼─────────────────▼────────┐  │
│  │            Database Manager (SQLAlchemy)            │  │
│  │  • Multi-schema introspection (dbo, SalesLT, etc.) │  │
│  │  • Connection pooling & lifecycle management       │  │
│  │  • Query execution with type serialization         │  │
│  └──────┬───────────────────────────────┬────────────┘  │
│         │                               │                │
│  ┌──────▼──────┐  ┌─────────────┐  ┌───▼────────────┐  │
│  │ RAG Service │  │ LLM Service │  │ SQL Safety     │  │
│  │ (Schema DDL)│  │ (OpenAI GPT)│  │ Layer          │  │
│  └─────────────┘  └─────────────┘  └────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ SQLAlchemy + pyodbc/psycopg2
              ┌──────────▼──────────┐
              │  Cloud Databases    │
              │  • Azure SQL Server │
              │  • AWS RDS          │
              │  • GCP Cloud SQL    │
              └─────────────────────┘
```

---

## ✨ Features

### 🔌 Cloud Database Connectivity
- **Azure SQL Database** (SQL Server via ODBC Driver 18)
- **AWS RDS** (PostgreSQL, MySQL, SQL Server)
- **GCP Cloud SQL** (PostgreSQL, MySQL)
- Step-by-step connection wizard with **Test Connection** validation
- Multiple simultaneous database connections

### 🌳 Database Schema Explorer
- Automatic introspection of **all schemas** (dbo, SalesLT, custom schemas)
- Interactive tree view: Database → Schema → Tables/Views → Columns
- Color-coded column type badges (INT, VARCHAR, DATETIME, etc.)
- Primary key indicators (🔑)
- Row count estimates per table
- One-click **table data preview** (first 50 rows)

### 💬 Natural Language Chat
- Ask questions in plain English: *"Show me top 10 products by price"*
- AI generates dialect-aware SQL (T-SQL for SQL Server, PostgreSQL, MySQL)
- **SQL Safety Layer** — only SELECT queries allowed, automatic LIMIT enforcement
- Full query explanation alongside generated SQL

### 📊 Data Visualization
- Auto-detected chart types (bar, line, table) based on query structure
- Interactive charts powered by **Recharts**
- Raw data table with column headers
- Toggle between **Visualization** and **Generated SQL** views

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, Recharts, Lucide Icons, Axios |
| **Backend** | Python, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2 |
| **AI/LLM** | OpenAI GPT-4o-mini |
| **Database Drivers** | pyodbc (SQL Server), psycopg2 (PostgreSQL), pymysql (MySQL) |
| **Security** | SQL Safety Layer (SELECT-only, keyword blocklist, auto-LIMIT) |

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **ODBC Driver 18 for SQL Server** (required for Azure SQL)
  - Download: [Microsoft ODBC Driver 18](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)
- **OpenAI API Key** (for natural language chat)

### 1. Clone the Repository

```bash
git clone https://github.com/SatyendraPrajapati456/DataBase-chat.git
cd DataBase-chat
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell - if scripts enabled):
.\venv\Scripts\activate
# Windows (alternative - always works):
.\venv\Scripts\python.exe -m pip install -r requirements.txt

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=sk-your-key-here

# Start the backend server
.\venv\Scripts\python.exe -m uvicorn main:app --reload
```

The backend will start at **http://localhost:8000**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will start at **http://localhost:5173**

### 4. Connect Your Database

1. Open **http://localhost:5173** in your browser
2. Click **"+ Connect Database"**
3. Select your cloud provider (Azure / AWS / GCP)
4. Select database type (SQL Server / PostgreSQL / MySQL)
5. Enter your connection credentials:

| Field | Example (Azure SQL) |
|-------|-------------------|
| Server Host | `myserver.database.windows.net` |
| Port | `1433` |
| Database Name | `mydatabase` |
| Username | `admin` |
| Password | `••••••••` |
| Encrypt Connection | ✅ |
| Trust Server Certificate | ✅ |

6. Click **"Test Connection"** to verify
7. Click **"Connect"** — your schema tree will load in the sidebar

---

## 📁 Project Structure

```
DataBase-chat/
├── backend/
│   ├── main.py                    # FastAPI application entry point
│   ├── requirements.txt           # Python dependencies
│   ├── .env                       # Environment variables (API keys)
│   ├── core/
│   │   ├── config.py              # App settings (CORS, pool sizes, etc.)
│   │   └── security.py            # SQL Safety Layer (SELECT-only enforcement)
│   ├── models/
│   │   └── schemas.py             # Pydantic request/response models
│   ├── routers/
│   │   ├── connection.py          # POST /connect/cloud, /test, /active, DELETE /{id}
│   │   ├── metadata.py            # GET /databases, /schema, /preview, /info
│   │   └── chat.py                # POST /chat/ (NL → SQL → execute)
│   └── services/
│       ├── database_manager.py    # Core: connections, introspection, execution
│       ├── llm_service.py         # OpenAI GPT integration
│       ├── rag_service.py         # Schema DDL context builder
│       └── db_service.py          # Query execution wrapper
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx               # React entry point
│       ├── App.jsx                # Main app with state management
│       ├── index.css              # Global styles & design system
│       ├── components/
│       │   ├── Sidebar.jsx            # Sidebar with connect button & explorer
│       │   ├── ConnectDatabaseModal.jsx # Multi-step connection wizard
│       │   ├── DatabaseExplorer.jsx    # Schema tree (tables/views/columns)
│       │   ├── TablePreviewModal.jsx   # Table data preview modal
│       │   ├── ChatPanel.jsx          # Chat interface with message history
│       │   └── ResultsPanel.jsx       # Charts, tables, SQL display
│       └── services/
│           └── api.js             # Axios API client
└── README.md
```

---

## 🔒 API Endpoints

### Connection
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/connect/cloud` | Connect to a cloud database |
| `POST` | `/connect/test` | Test connection without saving |
| `GET` | `/connect/active` | List all active connections |
| `DELETE` | `/connect/{db_id}` | Disconnect a database |

### Metadata & Schema
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/databases` | List all connected databases |
| `GET` | `/databases/{db_id}/schema` | Full schema tree |
| `GET` | `/databases/{db_id}/tables/{name}/preview` | Preview table data (50 rows) |
| `GET` | `/databases/{db_id}/tables/{name}/info` | Column details & row count |
| `POST` | `/databases/{db_id}/refresh-schema` | Force refresh cached schema |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat/` | Send natural language query → get SQL + results |

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Required — OpenAI API key for natural language chat
OPENAI_API_KEY=sk-your-openai-api-key

# Optional — Default cloud credentials
AZURE_CONNECTION_STRING=
AWS_CONNECTION_STRING=
GCP_CONNECTION_STRING=

# App settings
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

---

## 🔐 Security

- **SQL Safety Layer** blocks all destructive operations: `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`, `GRANT`, `REVOKE`, `EXECUTE`, `CREATE`
- Only `SELECT` and `WITH` (CTE) queries are allowed
- Automatic `LIMIT 1000` enforcement on all queries
- SQL comment stripping to prevent obfuscation attacks
- Database credentials stored **in-memory only** (not persisted to disk)
- CORS restricted to localhost development origins

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) — High-performance Python web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) — SQL toolkit and ORM
- [OpenAI](https://openai.com/) — GPT models for natural language understanding
- [Recharts](https://recharts.org/) — React charting library
- [Lucide](https://lucide.dev/) — Beautiful icon library
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework

---

<p align="center">
  Built with ❤️ for the hackathon
</p>

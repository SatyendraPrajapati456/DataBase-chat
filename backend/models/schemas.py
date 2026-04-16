from pydantic import BaseModel
from typing import List, Optional, Any, Dict

# ── Connection ──────────────────────────────────────────────

class CloudConnectRequest(BaseModel):
    provider: str            # "azure" | "aws" | "gcp"
    db_type: str             # "postgresql" | "mysql" | "mssql"
    host: str
    port: int
    database: str
    username: str
    password: str
    display_name: Optional[str] = None
    # Azure SQL may need these
    encrypt: Optional[bool] = True
    trust_server_certificate: Optional[bool] = False

class TestConnectionRequest(BaseModel):
    provider: str
    db_type: str
    host: str
    port: int
    database: str
    username: str
    password: str
    encrypt: Optional[bool] = True
    trust_server_certificate: Optional[bool] = False

# ── Schema Introspection ────────────────────────────────────

class ColumnInfo(BaseModel):
    name: str
    type: str
    nullable: bool
    primary_key: bool
    default: Optional[str] = None

class TableInfo(BaseModel):
    name: str
    type: str               # "table" | "view"
    columns: List[ColumnInfo]
    row_count: Optional[int] = None

class DatabaseInfoSummary(BaseModel):
    db_id: str
    provider: str
    db_type: str
    display_name: str
    host: str
    database_name: str
    table_count: int
    view_count: int
    connected_at: str

class DatabaseInfoFull(BaseModel):
    db_id: str
    provider: str
    db_type: str
    display_name: str
    host: str
    database_name: str
    tables: List[TableInfo]
    connected_at: str

class ConnectResponse(BaseModel):
    db_id: str
    display_name: str
    provider: str
    db_type: str
    tables: List[TableInfo]
    message: str

class TablePreviewResponse(BaseModel):
    table_name: str
    columns: List[str]
    column_types: List[str]
    data: List[Dict[str, Any]]
    total_rows: int

# ── Chat ────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    user_query: str
    db_id: str
    selected_tables: List[str]

class ChatResponse(BaseModel):
    sql_generated: str
    explanation: str
    data: Dict[str, Any]    # {columns: [...], data: [...]}
    chart_type: str          # "bar" | "line" | "pie" | "table"

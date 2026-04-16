"""
DatabaseManager — Core service for managing cloud database connections.

Handles connection lifecycle, schema introspection, query execution,
and multi-database management for Azure SQL, AWS RDS, and GCP Cloud SQL.
"""

import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)


class DatabaseConnection:
    """Represents a single active database connection."""

    def __init__(
        self,
        db_id: str,
        provider: str,
        db_type: str,
        display_name: str,
        host: str,
        database_name: str,
        engine: Engine,
        connected_at: str,
    ):
        self.db_id = db_id
        self.provider = provider
        self.db_type = db_type
        self.display_name = display_name
        self.host = host
        self.database_name = database_name
        self.engine = engine
        self.connected_at = connected_at
        self._schema_cache: Optional[dict] = None

    def clear_schema_cache(self):
        self._schema_cache = None


class DatabaseManager:
    """
    Manages all active database connections.
    Provides connect/disconnect, schema introspection, and query execution.
    """

    def __init__(self):
        self.connections: Dict[str, DatabaseConnection] = {}

    # ── Connection String Builders ───────────────────────────

    @staticmethod
    def _build_connection_url(
        provider: str,
        db_type: str,
        host: str,
        port: int,
        database: str,
        username: str,
        password: str,
        encrypt: bool = True,
        trust_server_certificate: bool = False,
    ) -> str:
        """Build SQLAlchemy connection URL based on provider and db_type."""

        if db_type == "postgresql":
            return f"postgresql+psycopg2://{username}:{password}@{host}:{port}/{database}"

        elif db_type == "mysql":
            return f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}?charset=utf8mb4"

        elif db_type == "mssql":
            # Azure SQL Server / SQL Server via pyodbc
            params = (
                f"DRIVER={{ODBC Driver 18 for SQL Server}};"
                f"SERVER={host},{port};"
                f"DATABASE={database};"
                f"UID={username};"
                f"PWD={password};"
                f"Encrypt={'yes' if encrypt else 'no'};"
                f"TrustServerCertificate={'yes' if trust_server_certificate else 'no'};"
                f"Connection Timeout=30;"
            )
            from urllib.parse import quote_plus
            return f"mssql+pyodbc:///?odbc_connect={quote_plus(params)}"

        else:
            raise ValueError(f"Unsupported database type: {db_type}")

    # ── Connect / Disconnect ─────────────────────────────────

    def connect(
        self,
        provider: str,
        db_type: str,
        host: str,
        port: int,
        database: str,
        username: str,
        password: str,
        display_name: Optional[str] = None,
        encrypt: bool = True,
        trust_server_certificate: bool = False,
    ) -> DatabaseConnection:
        """
        Connect to a cloud database and return the DatabaseConnection object.
        Raises an exception if connection fails.
        """
        url = self._build_connection_url(
            provider, db_type, host, port, database, username, password,
            encrypt, trust_server_certificate
        )

        engine = create_engine(
            url,
            pool_size=5,
            max_overflow=10,
            pool_timeout=30,
            pool_recycle=1800,
            pool_pre_ping=True,
        )

        # Test the connection by actually connecting
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        db_id = str(uuid.uuid4())[:8]
        name = display_name or f"{database} ({provider})"

        connection = DatabaseConnection(
            db_id=db_id,
            provider=provider,
            db_type=db_type,
            display_name=name,
            host=host,
            database_name=database,
            engine=engine,
            connected_at=datetime.now(timezone.utc).isoformat(),
        )

        self.connections[db_id] = connection
        logger.info(f"Connected to {name} [db_id={db_id}]")
        return connection

    def test_connection(
        self,
        provider: str,
        db_type: str,
        host: str,
        port: int,
        database: str,
        username: str,
        password: str,
        encrypt: bool = True,
        trust_server_certificate: bool = False,
    ) -> bool:
        """Test a database connection without persisting it."""
        url = self._build_connection_url(
            provider, db_type, host, port, database, username, password,
            encrypt, trust_server_certificate
        )
        engine = create_engine(url, pool_pre_ping=True)
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True
        finally:
            engine.dispose()

    def disconnect(self, db_id: str) -> bool:
        """Disconnect and remove a database connection."""
        conn = self.connections.pop(db_id, None)
        if conn:
            conn.engine.dispose()
            logger.info(f"Disconnected {conn.display_name} [db_id={db_id}]")
            return True
        return False

    def get_connection(self, db_id: str) -> DatabaseConnection:
        """Get a connection by ID, raising KeyError if not found."""
        if db_id not in self.connections:
            raise KeyError(f"No database connection found with id: {db_id}")
        return self.connections[db_id]

    def list_connections(self) -> List[DatabaseConnection]:
        """Return all active connections."""
        return list(self.connections.values())

    # ── Schema Introspection ─────────────────────────────────

    def get_schema(self, db_id: str) -> dict:
        """
        Introspect the database and return full schema information.
        Returns: {tables: [...], views: [...]}
        Each item has: {name, type, columns: [{name, type, nullable, primary_key}]}
        """
        conn = self.get_connection(db_id)

        # Use cache if available
        if conn._schema_cache:
            return conn._schema_cache

        inspector = inspect(conn.engine)
        schema_info = {"tables": [], "views": []}

        # Get tables
        table_names = inspector.get_table_names()
        for table_name in table_names:
            columns = inspector.get_columns(table_name)
            pk_columns = inspector.get_pk_constraint(table_name)
            pk_col_names = pk_columns.get("constrained_columns", []) if pk_columns else []

            table_info = {
                "name": table_name,
                "type": "table",
                "columns": [
                    {
                        "name": col["name"],
                        "type": str(col["type"]),
                        "nullable": col.get("nullable", True),
                        "primary_key": col["name"] in pk_col_names,
                        "default": str(col["default"]) if col.get("default") else None,
                    }
                    for col in columns
                ],
            }

            # Try to get row count (quick estimate)
            try:
                with conn.engine.connect() as db_conn:
                    # Use approx count for large tables on SQL Server
                    if conn.db_type == "mssql":
                        result = db_conn.execute(text(
                            f"SELECT SUM(rows) FROM sys.partitions "
                            f"WHERE object_id = OBJECT_ID('{table_name}') AND index_id IN (0, 1)"
                        ))
                    else:
                        result = db_conn.execute(text(
                            f"SELECT COUNT(*) FROM \"{table_name}\""
                        ))
                    row = result.fetchone()
                    table_info["row_count"] = int(row[0]) if row and row[0] else 0
            except Exception:
                table_info["row_count"] = None

            schema_info["tables"].append(table_info)

        # Get views
        try:
            view_names = inspector.get_view_names()
            for view_name in view_names:
                columns = inspector.get_columns(view_name)
                view_info = {
                    "name": view_name,
                    "type": "view",
                    "columns": [
                        {
                            "name": col["name"],
                            "type": str(col["type"]),
                            "nullable": col.get("nullable", True),
                            "primary_key": False,
                            "default": None,
                        }
                        for col in columns
                    ],
                    "row_count": None,
                }
                schema_info["views"].append(view_info)
        except Exception as e:
            logger.warning(f"Could not introspect views for {db_id}: {e}")

        # Cache it
        conn._schema_cache = schema_info
        return schema_info

    def get_table_preview(
        self, db_id: str, table_name: str, limit: int = 50
    ) -> dict:
        """
        Return a preview of table data (first N rows).
        Returns: {table_name, columns, column_types, data, total_rows}
        """
        conn = self.get_connection(db_id)
        inspector = inspect(conn.engine)

        # Get column info
        columns_info = inspector.get_columns(table_name)
        col_names = [c["name"] for c in columns_info]
        col_types = [str(c["type"]) for c in columns_info]

        # Quote table name appropriately
        if conn.db_type == "mssql":
            quoted_table = f"[{table_name}]"
            query = f"SELECT TOP {limit} * FROM {quoted_table}"
        else:
            quoted_table = f'"{table_name}"'
            query = f"SELECT * FROM {quoted_table} LIMIT {limit}"

        with conn.engine.connect() as db_conn:
            result = db_conn.execute(text(query))
            rows = result.fetchall()

            # Get total row count
            if conn.db_type == "mssql":
                count_result = db_conn.execute(text(
                    f"SELECT COUNT(*) FROM {quoted_table}"
                ))
            else:
                count_result = db_conn.execute(text(
                    f"SELECT COUNT(*) FROM {quoted_table}"
                ))
            total_rows = count_result.scalar() or 0

        # Convert rows to list of dicts, handling non-serializable types
        data = []
        for row in rows:
            row_dict = {}
            for i, col_name in enumerate(col_names):
                val = row[i] if i < len(row) else None
                # Convert non-JSON-serializable types
                if val is not None:
                    if isinstance(val, (datetime,)):
                        val = val.isoformat()
                    elif isinstance(val, bytes):
                        val = val.hex()
                    elif not isinstance(val, (str, int, float, bool)):
                        val = str(val)
                row_dict[col_name] = val
            data.append(row_dict)

        return {
            "table_name": table_name,
            "columns": col_names,
            "column_types": col_types,
            "data": data,
            "total_rows": total_rows,
        }

    # ── Query Execution ──────────────────────────────────────

    def execute_query(self, db_id: str, sql: str, max_rows: int = 1000) -> dict:
        """
        Execute a read-only SQL query and return results.
        Returns: {columns, data, row_count, chart_type}
        """
        conn = self.get_connection(db_id)

        with conn.engine.connect() as db_conn:
            result = db_conn.execute(text(sql))
            columns = list(result.keys())
            rows = result.fetchmany(max_rows)

        # Convert to list of dicts
        data = []
        for row in rows:
            row_dict = {}
            for i, col in enumerate(columns):
                val = row[i] if i < len(row) else None
                if val is not None:
                    if hasattr(val, 'isoformat'):
                        val = val.isoformat()
                    elif isinstance(val, bytes):
                        val = val.hex()
                    elif not isinstance(val, (str, int, float, bool)):
                        val = str(val)
                row_dict[col] = val
            data.append(row_dict)

        # Auto-detect chart type
        chart_type = self._detect_chart_type(sql, columns, data)

        return {
            "columns": columns,
            "data": data,
            "row_count": len(data),
            "chart_type": chart_type,
        }

    @staticmethod
    def _detect_chart_type(sql: str, columns: list, data: list) -> str:
        """Heuristically determine the best chart type for the results."""
        sql_lower = sql.lower()

        if len(data) == 0 or len(columns) == 0:
            return "table"

        # If only 1 column or more than 5 columns → table
        if len(columns) == 1 or len(columns) > 5:
            return "table"

        # Check if there are numeric columns
        has_numeric = False
        if data:
            for col in columns[1:]:
                val = data[0].get(col)
                if isinstance(val, (int, float)):
                    has_numeric = True
                    break

        if not has_numeric:
            return "table"

        # GROUP BY or aggregation → bar or line
        if "group by" in sql_lower or any(
            agg in sql_lower for agg in ["count(", "sum(", "avg(", "max(", "min("]
        ):
            if any(kw in sql_lower for kw in ["date", "month", "year", "time", "day", "week"]):
                return "line"
            return "bar"

        # Few rows with 2 columns (label + value) → bar
        if len(data) <= 20 and len(columns) == 2:
            return "bar"

        return "table"

    # ── DDL Generation (for LLM context) ─────────────────────

    def get_ddl_context(self, db_id: str, selected_tables: List[str]) -> str:
        """
        Generate CREATE TABLE DDL statements for the selected tables.
        This is used as context for the LLM to generate accurate SQL.
        """
        schema = self.get_schema(db_id)
        conn = self.get_connection(db_id)
        ddl_parts = []

        all_items = schema["tables"] + schema["views"]

        for item in all_items:
            if selected_tables and item["name"] not in selected_tables:
                continue

            item_type = "TABLE" if item["type"] == "table" else "VIEW"
            cols = []
            for col in item["columns"]:
                col_def = f"  {col['name']} {col['type']}"
                if col.get("primary_key"):
                    col_def += " PRIMARY KEY"
                if not col.get("nullable", True):
                    col_def += " NOT NULL"
                cols.append(col_def)

            ddl = f"CREATE {item_type} {item['name']} (\n" + ",\n".join(cols) + "\n);"
            if item.get("row_count") is not None:
                ddl += f"\n-- Approximate row count: {item['row_count']}"
            ddl_parts.append(ddl)

        context = f"-- Database: {conn.display_name}\n"
        context += f"-- Database type: {conn.db_type}\n"
        context += f"-- SQL Dialect: {'T-SQL' if conn.db_type == 'mssql' else conn.db_type.upper()}\n\n"
        context += "\n\n".join(ddl_parts)

        return context


# Singleton instance
database_manager = DatabaseManager()

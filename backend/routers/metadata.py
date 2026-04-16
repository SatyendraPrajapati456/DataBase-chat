from fastapi import APIRouter, HTTPException
from services.database_manager import database_manager

router = APIRouter(tags=["Metadata"])


@router.get("/databases")
async def get_databases():
    """Get all connected databases with summary info."""
    connections = database_manager.list_connections()
    databases = []
    for conn in connections:
        schema = database_manager.get_schema(conn.db_id)
        databases.append({
            "db_id": conn.db_id,
            "provider": conn.provider,
            "db_type": conn.db_type,
            "display_name": conn.display_name,
            "host": conn.host,
            "database_name": conn.database_name,
            "table_count": len(schema.get("tables", [])),
            "view_count": len(schema.get("views", [])),
            "connected_at": conn.connected_at,
        })
    return {"databases": databases}


@router.get("/databases/{db_id}/schema")
async def get_database_schema(db_id: str):
    """Get full schema tree (tables, views, columns, types, PKs) for a database."""
    try:
        schema = database_manager.get_schema(db_id)
        conn = database_manager.get_connection(db_id)
        return {
            "db_id": conn.db_id,
            "display_name": conn.display_name,
            "provider": conn.provider,
            "db_type": conn.db_type,
            **schema,
        }
    except KeyError:
        raise HTTPException(status_code=404, detail=f"No database found with id: {db_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Schema introspection failed: {str(e)}")


@router.get("/databases/{db_id}/tables/{table_name}/preview")
async def get_table_preview(db_id: str, table_name: str, limit: int = 50):
    """Get a preview of table data (first N rows)."""
    try:
        preview = database_manager.get_table_preview(db_id, table_name, limit)
        return preview
    except KeyError:
        raise HTTPException(status_code=404, detail=f"No database found with id: {db_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")


@router.get("/databases/{db_id}/tables/{table_name}/info")
async def get_table_info(db_id: str, table_name: str):
    """Get detailed info about a specific table (columns, row count)."""
    try:
        schema = database_manager.get_schema(db_id)
        all_items = schema.get("tables", []) + schema.get("views", [])
        for item in all_items:
            if item["name"] == table_name:
                return item
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
    except KeyError:
        raise HTTPException(status_code=404, detail=f"No database found with id: {db_id}")


@router.post("/databases/{db_id}/refresh-schema")
async def refresh_schema(db_id: str):
    """Force refresh the cached schema for a database."""
    try:
        conn = database_manager.get_connection(db_id)
        conn.clear_schema_cache()
        schema = database_manager.get_schema(db_id)
        return {
            "message": "Schema refreshed successfully",
            "table_count": len(schema.get("tables", [])),
            "view_count": len(schema.get("views", [])),
        }
    except KeyError:
        raise HTTPException(status_code=404, detail=f"No database found with id: {db_id}")

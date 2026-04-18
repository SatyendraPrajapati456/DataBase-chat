from fastapi import APIRouter, HTTPException
from models.schemas import CloudConnectRequest, TestConnectionRequest, ConnectResponse
from services.database_manager import database_manager

router = APIRouter(prefix="/connect", tags=["Connection"])


@router.post("/cloud", response_model=ConnectResponse)
async def connect_cloud(request: CloudConnectRequest):
    """Connect to a cloud database (Azure SQL, AWS RDS, GCP Cloud SQL)."""
    valid_providers = ["azure", "aws", "gcp", "snowflake"]
    valid_db_types = ["postgresql", "mysql", "mssql", "snowflake"]

    if request.provider not in valid_providers:
        raise HTTPException(status_code=400, detail=f"Invalid provider. Must be one of: {valid_providers}")
    if request.db_type not in valid_db_types:
        raise HTTPException(status_code=400, detail=f"Invalid db_type. Must be one of: {valid_db_types}")

    try:
        connection = database_manager.connect(
            provider=request.provider,
            db_type=request.db_type,
            host=request.host,
            port=request.port,
            database=request.database,
            username=request.username,
            password=request.password,
            display_name=request.display_name,
            encrypt=request.encrypt,
            trust_server_certificate=request.trust_server_certificate,
            warehouse=request.warehouse,
            role=request.role,
        )

        # Get schema right after connecting
        schema = database_manager.get_schema(connection.db_id)
        all_tables = []
        for t in schema.get("tables", []):
            all_tables.append(t)
        for v in schema.get("views", []):
            all_tables.append(v)

        return ConnectResponse(
            db_id=connection.db_id,
            display_name=connection.display_name,
            provider=connection.provider,
            db_type=connection.db_type,
            tables=all_tables,
            message=f"Successfully connected to {connection.display_name}",
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {str(e)}")


@router.post("/test")
async def test_connection(request: TestConnectionRequest):
    """Test a database connection without saving it."""
    try:
        success = database_manager.test_connection(
            provider=request.provider,
            db_type=request.db_type,
            host=request.host,
            port=request.port,
            database=request.database,
            username=request.username,
            password=request.password,
            encrypt=request.encrypt,
            trust_server_certificate=request.trust_server_certificate,
            warehouse=request.warehouse,
            role=request.role,
        )
        return {"status": "success", "message": "Connection successful!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection test failed: {str(e)}")


@router.get("/active")
async def get_active_connections():
    """List all active database connections."""
    connections = database_manager.list_connections()
    return {
        "connections": [
            {
                "db_id": c.db_id,
                "provider": c.provider,
                "db_type": c.db_type,
                "display_name": c.display_name,
                "host": c.host,
                "database_name": c.database_name,
                "connected_at": c.connected_at,
            }
            for c in connections
        ]
    }


@router.delete("/{db_id}")
async def disconnect_database(db_id: str):
    """Disconnect and remove a database connection."""
    success = database_manager.disconnect(db_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"No connection found with id: {db_id}")
    return {"status": "success", "message": "Database disconnected"}

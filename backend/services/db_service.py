from services.database_manager import database_manager


class DBService:
    """Service for executing validated SQL queries against connected databases."""

    def execute_query(self, sql: str, db_id: str) -> dict:
        """
        Execute a validated SQL query against the specified database.
        Returns: {columns, data, chart_type}
        """
        result = database_manager.execute_query(db_id, sql)
        return {
            "columns": result["columns"],
            "data": result["data"],
            "chart_type": result["chart_type"],
        }


db_service = DBService()

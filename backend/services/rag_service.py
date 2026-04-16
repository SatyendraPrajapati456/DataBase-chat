from services.database_manager import database_manager


class RAGService:
    """
    Builds schema context for the LLM by generating DDL statements
    from actual database schema introspection.
    """

    def get_relevant_schema(self, query: str, db_id: str, selected_tables: list) -> str:
        """
        Get the relevant schema context for the given query.
        Returns CREATE TABLE DDL statements for the selected tables,
        including column types, primary keys, and row counts.
        """
        try:
            return database_manager.get_ddl_context(db_id, selected_tables)
        except KeyError:
            return "-- No database connected. Cannot retrieve schema."
        except Exception as e:
            return f"-- Error retrieving schema: {str(e)}"


rag_service = RAGService()

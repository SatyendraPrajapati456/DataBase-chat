import re

class DBSecurityException(Exception):
    pass

class SQLSafetyLayer:
    """
    Ensures that any generated SQL is safe to execute against read-only connections.
    Although read-only credentials should protect the database, this is an application level guard.
    """
    
    FORBIDDEN_KEYWORDS = [
        "DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "TRUNCATE", 
        "GRANT", "REVOKE", "EXECUTE", "CREATE"
    ]

    @classmethod
    def validate_query(cls, query: str) -> str:
        # Strip comments to prevent obscuring malicious commands
        query_cleaned = re.sub(r'--.*', '', query)
        query_cleaned = re.sub(r'/\*.*?\*/', '', query_cleaned, flags=re.DOTALL)
        query_upper = query_cleaned.upper()
        
        # Check against forbidden keywords
        for keyword in cls.FORBIDDEN_KEYWORDS:
            # Look for keyword surrounded by word boundaries to avoid false positives (e.g. matching 'DROP' inside 'DROPDOWN_TABLE')
            if re.search(rf'\b{keyword}\b', query_upper):
                raise DBSecurityException(f"Forbidden SQL operation detected: {keyword}")
        
        # Ensure it starts with SELECT or WITH
        if not (query_upper.strip().startswith("SELECT") or query_upper.strip().startswith("WITH")):
            raise DBSecurityException("Only SELECT queries are allowed.")
            
        # Ensure there is a LIMIT clause, if not attach one
        if "LIMIT" not in query_upper:
            # Simplistic check, this might need more robust parser in production depending on the SQL dialect
            if ";" in query:
                parts = query.rsplit(";", 1)
                query = f"{parts[0]} LIMIT 1000;"
            else:
                query = f"{query} LIMIT 1000"
                
        return query

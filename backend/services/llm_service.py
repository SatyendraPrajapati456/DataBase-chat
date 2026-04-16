import json
import logging
from openai import OpenAI
from core.config import settings

logger = logging.getLogger(__name__)


class LLMService:
    """
    Uses OpenAI GPT to generate SQL queries from natural language,
    given the actual database schema as context.
    """

    def __init__(self):
        self.client = None
        if settings.OPENAI_API_KEY:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def generate_sql(self, user_query: str, schema_context: str) -> dict:
        """
        Generate a SQL query from a natural language question.
        
        Args:
            user_query: The user's natural language question
            schema_context: DDL statements and metadata for the relevant tables
            
        Returns:
            {"sql": "SELECT ...", "explanation": "This query ..."}
        """
        if not self.client:
            raise RuntimeError("OpenAI API key not configured. Set OPENAI_API_KEY in .env")

        system_prompt = """You are an expert SQL analyst. Your job is to convert natural language questions into accurate, safe SQL queries.

RULES:
1. Generate ONLY SELECT queries — never INSERT, UPDATE, DELETE, DROP, or any DDL.
2. Use the EXACT table and column names from the schema provided.
3. Pay attention to the SQL dialect specified in the schema comments (T-SQL, PostgreSQL, MySQL).
4. For T-SQL (SQL Server/Azure SQL), use TOP instead of LIMIT. Example: SELECT TOP 100 * FROM table
5. For PostgreSQL/MySQL, use LIMIT.
6. Always limit results to a reasonable number (max 1000 rows) unless the user asks for a specific count.
7. Use appropriate aggregations (COUNT, SUM, AVG, etc.) when the question implies summarization.
8. Use JOINs when the question requires data from multiple tables.
9. Handle NULL values appropriately.

RESPONSE FORMAT:
You must respond with valid JSON only, no markdown, no code fences:
{"sql": "YOUR SQL QUERY HERE", "explanation": "A clear, concise explanation of what the query does and why you structured it this way."}"""

        user_message = f"""DATABASE SCHEMA:
{schema_context}

USER QUESTION:
{user_query}

Generate the SQL query and explanation as JSON."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                temperature=0.1,
                max_tokens=1000,
            )

            content = response.choices[0].message.content.strip()
            
            # Try to parse as JSON, handle potential markdown code fences
            if content.startswith("```"):
                # Remove markdown code fences
                lines = content.split("\n")
                content = "\n".join(lines[1:-1])
            
            result = json.loads(content)
            
            if "sql" not in result:
                raise ValueError("LLM response missing 'sql' field")
            
            return {
                "sql": result["sql"],
                "explanation": result.get("explanation", "Query generated successfully."),
            }

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {content}")
            # Try to extract SQL from the response as fallback
            if "SELECT" in content.upper():
                # Extract the first SQL query
                sql_start = content.upper().find("SELECT")
                sql_part = content[sql_start:]
                if ";" in sql_part:
                    sql_part = sql_part[: sql_part.index(";") + 1]
                return {
                    "sql": sql_part,
                    "explanation": "Query generated (parsed from non-JSON response).",
                }
            raise RuntimeError(f"Failed to parse LLM response: {str(e)}")

        except Exception as e:
            logger.error(f"LLM service error: {str(e)}")
            raise


llm_service = LLMService()

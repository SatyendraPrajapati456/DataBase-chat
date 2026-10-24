from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse, AITestRequest, AITestResponse
from services.llm_service import llm_service
from services.rag_service import rag_service
from services.db_service import db_service
from core.security import SQLSafetyLayer, DBSecurityException

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.get("/models")
async def get_provider_models(provider: str = "gemini"):
    """
    List available AI models for the specified provider (e.g. gemini, openai, grok, etc.).
    """
    return {"provider": provider, "models": llm_service.get_models(provider)}

@router.post("/test-ai", response_model=AITestResponse)
async def test_ai_provider(request: AITestRequest):
    """
    Test connection and credentials for a selected AI provider (Gemini, OpenAI, Grok, Ollama, etc.).
    """
    return llm_service.test_ai(request)

@router.post("/", response_model=ChatResponse)
async def chat_with_data(request: ChatRequest):
    try:
        # 1. RAG — Retrieve real schema context from connected database
        schema_context = rag_service.get_relevant_schema(
            request.user_query, request.db_id, request.selected_tables
        )
        
        # 2. LLM — Generate SQL using chosen AI provider with real schema
        generation_result = llm_service.generate_sql(
            request.user_query,
            schema_context,
            request.ai_config
        )
        raw_sql = generation_result["sql"]
        explanation = generation_result["explanation"]
        
        # 3. Security — Validate SQL (SELECT only, no destructive ops)
        safe_sql = SQLSafetyLayer.validate_query(raw_sql)
        
        # 4. Execute — Run the query against the real database
        query_result = db_service.execute_query(safe_sql, request.db_id)
        
        return ChatResponse(
            sql_generated=safe_sql,
            explanation=explanation,
            data={"columns": query_result["columns"], "data": query_result["data"]},
            chart_type=query_result["chart_type"]
        )
        
    except DBSecurityException as e:
        raise HTTPException(status_code=403, detail=str(e))
    except KeyError as e:
        raise HTTPException(status_code=404, detail=f"Database not found: {str(e)}")
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


import json
import logging
import time
import httpx
from typing import Optional, Dict, Any
from openai import OpenAI
from core.config import settings
from models.schemas import AIProviderConfig, AITestRequest, AITestResponse

logger = logging.getLogger(__name__)

# Provider default models, base URLs, and model catalogs
PROVIDER_DEFAULTS = {
    "gemini": {
        "model": "gemini-2.5-flash",
        "base_url": None,
        "requires_key": True,
        "models": [
            {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "description": "Ultra Fast & Accurate (State-of-the-art)", "tag": "Recommended"},
            {"id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro", "description": "Deep Reasoning & Complex SQL Synthesis", "tag": "Reasoning"},
            {"id": "gemini-1.5-flash", "name": "Gemini 1.5 Flash", "description": "Stable Production Standard", "tag": "Stable"},
            {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro", "description": "2M Token Context & Exhaustive Schema Analysis", "tag": "2M Context"},
            {"id": "gemini-1.5-flash-8b", "name": "Gemini 1.5 Flash-8B", "description": "Lightweight High-Frequency Queries", "tag": "8B"},
        ],
    },
    "openai": {
        "model": "gpt-4o-mini",
        "base_url": "https://api.openai.com/v1",
        "requires_key": True,
        "models": [
            {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "description": "Fast & Efficient", "tag": "Recommended"},
            {"id": "gpt-4o", "name": "GPT-4o", "description": "Flagship Omni Model", "tag": "Flagship"},
            {"id": "o3-mini", "name": "o3-mini", "description": "Deep STEM Reasoning", "tag": "Reasoning"},
            {"id": "gpt-4-turbo", "name": "GPT-4 Turbo", "description": "High Precision SQL", "tag": "Legacy"},
        ],
    },
    "grok": {
        "model": "grok-2-latest",
        "base_url": "https://api.x.ai/v1",
        "requires_key": True,
        "models": [
            {"id": "grok-2-latest", "name": "Grok 2 Latest", "description": "Flagship Frontier Intelligence", "tag": "Flagship"},
            {"id": "grok-beta", "name": "Grok Beta", "description": "Fast Grok Engine", "tag": "Beta"},
            {"id": "grok-2-vision-latest", "name": "Grok 2 Vision", "description": "Multimodal Grok", "tag": "Vision"},
        ],
    },
    "anthropic": {
        "model": "claude-3-5-sonnet-20241022",
        "base_url": "https://api.anthropic.com/v1/messages",
        "requires_key": True,
        "models": [
            {"id": "claude-3-5-sonnet-20241022", "name": "Claude 3.5 Sonnet", "description": "Best-in-class SQL & Coding", "tag": "Recommended"},
            {"id": "claude-3-7-sonnet", "name": "Claude 3.7 Sonnet", "description": "Hybrid Reasoning & Synthesis", "tag": "Flagship"},
            {"id": "claude-3-5-haiku-20241022", "name": "Claude 3.5 Haiku", "description": "Ultra Fast & Lightweight", "tag": "Fast"},
        ],
    },
    "deepseek": {
        "model": "deepseek-chat",
        "base_url": "https://api.deepseek.com",
        "requires_key": True,
        "models": [
            {"id": "deepseek-chat", "name": "DeepSeek-V3", "description": "Top-tier open architecture", "tag": "Flagship"},
            {"id": "deepseek-reasoner", "name": "DeepSeek-R1", "description": "Deep Mathematical & Analytical Reasoning", "tag": "Reasoning"},
        ],
    },
    "groq": {
        "model": "llama-3.3-70b-versatile",
        "base_url": "https://api.groq.com/openai/v1",
        "requires_key": True,
        "models": [
            {"id": "llama-3.3-70b-versatile", "name": "Llama 3.3 70B", "description": "Versatile LPU Speed", "tag": "Recommended"},
            {"id": "mixtral-8x7b-32768", "name": "Mixtral 8x7B", "description": "Mixture-of-Experts", "tag": "Fast"},
            {"id": "llama-3.1-8b-instant", "name": "Llama 3.1 8B Instant", "description": "Blazing Fast Response", "tag": "Instant"},
        ],
    },
    "openrouter": {
        "model": "openai/gpt-4o-mini",
        "base_url": "https://openrouter.ai/api/v1",
        "requires_key": True,
        "models": [
            {"id": "openai/gpt-4o-mini", "name": "OpenAI GPT-4o Mini", "description": "Fast & Cheap", "tag": "Popular"},
            {"id": "anthropic/claude-3.5-sonnet", "name": "Claude 3.5 Sonnet", "description": "Superior Code & SQL", "tag": "Top Pick"},
            {"id": "meta-llama/llama-3.3-70b-instruct", "name": "Meta Llama 3.3 70B", "description": "Open Source Leader", "tag": "Open"},
            {"id": "deepseek/deepseek-r1", "name": "DeepSeek R1", "description": "Deep Reasoning", "tag": "Reasoning"},
        ],
    },
    "ollama": {
        "model": "llama3.2",
        "base_url": "http://localhost:11434/v1",
        "requires_key": False,
        "models": [
            {"id": "llama3.2", "name": "Llama 3.2", "description": "Standard Local Model", "tag": "Default"},
            {"id": "qwen2.5-coder", "name": "Qwen 2.5 Coder", "description": "Best Local Model for SQL", "tag": "Recommended"},
            {"id": "mistral", "name": "Mistral 7B", "description": "Proven Local Workhorse", "tag": "Popular"},
            {"id": "deepseek-r1:8b", "name": "DeepSeek R1 8B", "description": "Local Reasoning Model", "tag": "Reasoning"},
            {"id": "codellama", "name": "CodeLlama", "description": "Specialized for Code & SQL", "tag": "Code"},
        ],
    },
    "lmstudio": {
        "model": "default",
        "base_url": "http://localhost:1234/v1",
        "requires_key": False,
        "models": [
            {"id": "default", "name": "Currently Loaded Model", "description": "The model active in LM Studio", "tag": "Active"},
        ],
    },
    "custom": {
        "model": "default",
        "base_url": "http://localhost:8080/v1",
        "requires_key": False,
        "models": [
            {"id": "default", "name": "Default Model", "description": "Custom Endpoint Model", "tag": "Custom"},
        ],
    },
}

class LLMService:
    """
    Multi-provider LLM service supporting Google Gemini, OpenAI, xAI Grok,
    Anthropic Claude, DeepSeek, Groq, OpenRouter, and Local Models (Ollama, LM Studio, Custom).
    """

    def _resolve_config(self, ai_config: Optional[AIProviderConfig] = None) -> Dict[str, Any]:
        """Resolve effective provider, API key, model, and base_url."""
        provider = (ai_config.provider.lower() if ai_config and ai_config.provider else getattr(settings, "AI_PROVIDER", "gemini")).strip()
        defaults = PROVIDER_DEFAULTS.get(provider, PROVIDER_DEFAULTS["custom"])

        # Determine model
        model = (ai_config.model if ai_config and ai_config.model else None)
        if not model:
            if provider == "gemini":
                model = getattr(settings, "GEMINI_MODEL", defaults["model"])
            elif provider == "openai":
                model = getattr(settings, "OPENAI_MODEL", defaults["model"])
            else:
                model = defaults["model"]

        # Determine base_url
        base_url = (ai_config.base_url if ai_config and ai_config.base_url else defaults.get("base_url"))

        # Determine API key
        api_key = (ai_config.api_key if ai_config and ai_config.api_key else "").strip()
        if not api_key:
            if provider == "gemini":
                api_key = getattr(settings, "GEMINI_API_KEY", "")
            elif provider == "openai":
                api_key = getattr(settings, "OPENAI_API_KEY", "")

        # Local providers do not strictly require an API key
        if not api_key and provider in ["ollama", "lmstudio"]:
            api_key = f"{provider}-local"
        elif not api_key and provider == "custom":
            api_key = "custom-key"

        return {
            "provider": provider,
            "api_key": api_key,
            "model": model,
            "base_url": base_url,
            "requires_key": defaults.get("requires_key", False),
        }

    def generate_sql(
        self,
        user_query: str,
        schema_context: str,
        ai_config: Optional[AIProviderConfig] = None
    ) -> dict:
        """
        Generate a SQL query from a natural language question using the selected AI provider.
        """
        cfg = self._resolve_config(ai_config)
        provider = cfg["provider"]
        api_key = cfg["api_key"]
        model = cfg["model"]
        base_url = cfg["base_url"]

        if cfg["requires_key"] and not api_key:
            raise RuntimeError(
                f"API key not configured for provider '{provider.upper()}'. "
                "Please configure your API key in the AI Settings modal."
            )

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
            content = self._call_llm(
                provider=provider,
                api_key=api_key,
                model=model,
                base_url=base_url,
                system_prompt=system_prompt,
                user_message=user_message,
            )
            return self._parse_json_result(content)

        except Exception as e:
            logger.error(f"LLM generation failed ({provider}/{model}): {str(e)}")
            raise

    def test_ai(self, req: AITestRequest) -> AITestResponse:
        """
        Test the specified AI provider configuration.
        """
        cfg = self._resolve_config(
            AIProviderConfig(
                provider=req.provider,
                api_key=req.api_key,
                model=req.model,
                base_url=req.base_url,
            )
        )
        provider = cfg["provider"]
        api_key = cfg["api_key"]
        model = cfg["model"]
        base_url = cfg["base_url"]

        if cfg["requires_key"] and not api_key:
            return AITestResponse(
                success=False,
                message=f"Missing API key for {provider.upper()}. Please enter a valid API key.",
                model_used=model or "unknown"
            )

        test_system = "You are a helpful assistant. Always respond with pure JSON only."
        test_user = "Respond with JSON format: {\"status\": \"ok\", \"message\": \"connection successful\"}"

        start_time = time.perf_counter()
        try:
            content = self._call_llm(
                provider=provider,
                api_key=api_key,
                model=model,
                base_url=base_url,
                system_prompt=test_system,
                user_message=test_user,
            )
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            return AITestResponse(
                success=True,
                message=f"Successfully connected to {provider.upper()} ({model})!",
                model_used=model,
                latency_ms=round(elapsed_ms, 1),
            )
        except Exception as e:
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            error_msg = str(e)
            if "401" in error_msg or "Unauthorized" in error_msg or "invalid_api_key" in error_msg.lower():
                user_friendly = f"Invalid API Key for {provider.upper()} (401 Unauthorized)."
            elif "Connection refused" in error_msg or "Failed to connect" in error_msg:
                user_friendly = f"Could not connect to {base_url or provider}. Is the local model server running?"
            elif "model_not_found" in error_msg.lower() or "404" in error_msg:
                user_friendly = f"Model '{model}' not found on {provider.upper()}."
            else:
                user_friendly = f"Connection failed: {error_msg}"

            return AITestResponse(
                success=False,
                message=user_friendly,
                model_used=model or "unknown",
                latency_ms=round(elapsed_ms, 1),
            )

    def _call_llm(
        self,
        provider: str,
        api_key: str,
        model: str,
        base_url: Optional[str],
        system_prompt: str,
        user_message: str,
    ) -> str:
        """Dispatch call to the appropriate AI provider."""
        if provider == "gemini":
            return self._call_gemini(api_key=api_key, model=model, system_prompt=system_prompt, user_message=user_message)
        elif provider == "anthropic":
            return self._call_anthropic(api_key=api_key, model=model, system_prompt=system_prompt, user_message=user_message)
        else:
            # All OpenAI-compatible providers: OpenAI, Grok, DeepSeek, Groq, OpenRouter, Ollama, LM Studio, Custom
            return self._call_openai_compatible(
                api_key=api_key,
                model=model,
                base_url=base_url,
                system_prompt=system_prompt,
                user_message=user_message,
            )

    def get_models(self, provider: str = "gemini") -> list:
        """Retrieve available model catalog for the given provider."""
        prov = (provider or "gemini").lower().strip()
        data = PROVIDER_DEFAULTS.get(prov, {})
        return data.get("models", [])

    def _call_gemini(self, api_key: str, model: str, system_prompt: str, user_message: str) -> str:
        """Call Google Gemini using google-genai or fallback to Gemini OpenAI-compatible endpoint."""
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)
            config_args = {
                "system_instruction": system_prompt,
                "temperature": 0.1,
            }
            # Thinking/experimental models may not accept response_mime_type
            if "thinking" not in model.lower():
                config_args["response_mime_type"] = "application/json"

            response = client.models.generate_content(
                model=model,
                contents=[user_message],
                config=types.GenerateContentConfig(**config_args),
            )
            if response.text:
                return response.text.strip()
            raise RuntimeError("Empty response received from Gemini.")
        except Exception as e:
            # Fallback to OpenAI compatible endpoint for Gemini if google-genai fails
            logger.warning(f"google-genai call failed ({str(e)}), attempting Gemini OpenAI-compatible endpoint fallback...")
            client = OpenAI(
                api_key=api_key,
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            )
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                temperature=0.1,
                max_tokens=1000,
            )
            return response.choices[0].message.content.strip()

    def _call_anthropic(self, api_key: str, model: str, system_prompt: str, user_message: str) -> str:
        """Call Anthropic Claude via REST API."""
        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": model,
            "max_tokens": 1000,
            "temperature": 0.1,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_message}],
        }
        with httpx.Client(timeout=60.0) as client:
            resp = client.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"Anthropic error ({resp.status_code}): {resp.text}")
            data = resp.json()
            content_list = data.get("content", [])
            if not content_list:
                raise RuntimeError("Empty content in Anthropic response")
            return content_list[0].get("text", "").strip()

    def _call_openai_compatible(
        self,
        api_key: str,
        model: str,
        base_url: Optional[str],
        system_prompt: str,
        user_message: str,
    ) -> str:
        """Call any OpenAI-compatible provider."""
        client_kwargs: Dict[str, Any] = {"api_key": api_key or "local-key"}
        if base_url:
            client_kwargs["base_url"] = base_url

        client = OpenAI(**client_kwargs)
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.1,
            max_tokens=1000,
        )
        return response.choices[0].message.content.strip()

    def _parse_json_result(self, content: str) -> dict:
        """Parse JSON from model response, stripping any markdown code fences."""
        cleaned = content.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            cleaned = "\n".join(lines).strip()

        try:
            result = json.loads(cleaned)
            if "sql" not in result:
                raise ValueError("LLM response missing 'sql' field")
            return {
                "sql": result["sql"],
                "explanation": result.get("explanation", "Query generated successfully."),
            }
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {content}")
            # Try finding first JSON object {...}
            start_idx = cleaned.find("{")
            end_idx = cleaned.rfind("}")
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                try:
                    candidate = json.loads(cleaned[start_idx:end_idx + 1])
                    if "sql" in candidate:
                        return {
                            "sql": candidate["sql"],
                            "explanation": candidate.get("explanation", "Query generated successfully."),
                        }
                except Exception:
                    pass

            # Fallback to extracting SQL directly if SELECT is present
            if "SELECT" in content.upper():
                sql_start = content.upper().find("SELECT")
                sql_part = content[sql_start:]
                if ";" in sql_part:
                    sql_part = sql_part[: sql_part.index(";") + 1]
                return {
                    "sql": sql_part,
                    "explanation": "Query generated (parsed from text response).",
                }
            raise RuntimeError(f"Failed to parse LLM response: {str(e)}")


llm_service = LLMService()

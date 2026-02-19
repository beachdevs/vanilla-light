/*
# `src/plugins/llm/openai.js`

## Purpose

Proxies chat completion requests to the configured LLM endpoint.

## Required Env

- `LLM_API_KEY`
- `LLM_ENDPOINT` (for example `https://openrouter.ai/api/v1/chat/completions`)

Optional:

- `USE_LLM_MODEL` (default model when request body omits `model`)

## Route

- `POST /llm/chat`
  - reads JSON request body
  - injects `USE_LLM_MODEL` if present and body has no `model`
  - forwards request to the URL in `LLM_ENDPOINT`
  - returns upstream JSON and status code

## Error Behavior

- when API key is missing, returns:
  - status `503`
  - `{ "error": "Missing LLM_API_KEY" }`
- when endpoint is missing, returns:
  - status `503`
  - `{ "error": "Missing LLM_ENDPOINT" }`

*/

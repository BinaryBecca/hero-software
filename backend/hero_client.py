import os
import logging

import httpx

logger = logging.getLogger(__name__)

HERO_GRAPHQL_URL = "https://login.hero-software.de/api/external/v9/graphql"

CREATE_DOCUMENT_MUTATION = """
mutation DokumentMitMehrerenArtikeln($input: Documents_CreateDocumentInput!, $actions: [Documents_DocumentBuilderActionInput!]!) {
  create_document(input: $input, actions: $actions) {
    id
    nr
    type
    status_code
    date
    value
    created
  }
}
"""


async def create_document(
    document_type_id: int,
    project_match_id: int,
    actions: list[dict],
    publish: bool = False,
) -> dict:
    variables = {
        "input": {
            "document_type_id": document_type_id,
            "project_match_id": project_match_id,
            "publish": publish,
        },
        "actions": actions,
    }

    headers = {
        "Authorization": f"Bearer {os.environ['HERO_API_TOKEN']}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            HERO_GRAPHQL_URL,
            headers=headers,
            json={"query": CREATE_DOCUMENT_MUTATION, "variables": variables},
        )
        response.raise_for_status()

    data = response.json()
    if "errors" in data:
        logger.error("GraphQL errors: %s", data["errors"])
        raise RuntimeError(f"GraphQL errors: {data['errors']}")

    result = data["data"]["create_document"]
    logger.info("Created document: %s", result)
    return result
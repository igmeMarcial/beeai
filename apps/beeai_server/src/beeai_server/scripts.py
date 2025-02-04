import os


def app():
    os.execvp(
        "uvicorn",
        [
            "uvicorn",
            "beeai_server.application:app",
            "--host=0.0.0.0",
            "--port=8333",
            "--timeout-graceful-shutdown=5",  # TODO: MCP server is not destroyed correctly
        ],
    )

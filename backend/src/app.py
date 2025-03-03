from http import HTTPStatus

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from src.routers import auth, collaborators, feedback, iago, leaders, users
from src.schemas.message import Message

app = FastAPI()

# 🚀 Adiciona CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],  # Permite requisições do frontend
    allow_credentials=True,
    allow_methods=['*'],  # Permite todos os métodos (GET, POST, etc.)
    allow_headers=['*'],  # Permite todos os headers
)

app.include_router(collaborators.router)
app.include_router(leaders.router)
app.include_router(auth.router)
app.include_router(feedback.router)
app.include_router(iago.router)
app.include_router(users.router)


@app.get(
    '/',
    status_code=HTTPStatus.OK,
    response_model=Message,
)
def read_root():
    return {'message': 'Hello World!'}


# Exercicio Aula2
@app.get('/hello', status_code=HTTPStatus.OK, response_class=HTMLResponse)
def read_hello():
    return """
    <html>
      <head>
        <title> Nosso olá mundo!</title>
      </head>
      <body>
        <h1>Hello World!</h1>
      </body>
    </html>"""

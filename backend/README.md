# Backend

Esta é a aplicação backend para o projeto GoCase, construída usando Python e FastAPI. Ela fornece uma API para gerenciar usuários, gerenciar auto avaliações e avaliações.

## Tecnologias Utilizadas

- **Python:** A linguagem de programação principal.
- **FastAPI:** Um framework web moderno, rápido (de alto desempenho) para construir APIs com Python 3.7+ baseado em dicas de tipo padrão do Python.
- **SQLAlchemy:** Um toolkit SQL para Python e sistema de Mapeamento Objeto-Relacional (ORM) que fornece um conjunto completo de padrões de persistência projetados para acesso eficiente e de alto desempenho ao banco de dados.
- **Alembic:** Uma ferramenta leve de migração de banco de dados para SQLAlchemy.
- **SQLite:** Um motor de banco de dados SQL autossuficiente, de alta confiabilidade, embutido, completo e de domínio público.
- **uv:** Uma ferramenta para gerenciamento de dependências e empacotamento em Python.

## Estrutura do Projeto

O backend está estruturado da seguinte forma:

- `alembic.ini`: Arquivo de configuração para o Alembic.
- `database.db`: Arquivo de banco de dados SQLite.
- `migrations`: Contém os scripts de migração do Alembic.
  - `versions`: Contém os arquivos de migração reais.
- `pyproject.toml`: Arquivo de configuração para o uv, definindo dependências do projeto e configurações de build.
- `src`: Contém o código principal da aplicação.
  - `app.py`: O ponto de entrada principal da aplicação, definindo a instância da aplicação FastAPI.
  - `assistant`: Contém arquivos relacionados ao assistente de IA.
    - `assistant_config.py`: Configuração para o assistente de IA.
    - `iago_assistant.yaml`: Arquivo YAML definindo a configuração do assistente de IA.
  - `database`: Contém arquivos relacionados ao banco de dados.
    - `database.py`: Define a conexão com o banco de dados e o gerenciamento de sessões.
    - `models.py`: Define os modelos SQLAlchemy para as tabelas do banco de dados.
  - `routers`: Contém as definições das rotas da API.
    - `auth.py`: Define rotas relacionadas à autenticação (login, registro).
    - `collaborators.py`: Define rotas para gerenciar colaboradores.
    - `feedback.py`: Define rotas para lidar com feedback.
    - `iago.py`: Define rotas relacionadas ao assistente IAGO.
    - `leaders.py`: Define rotas para gerenciar líderes.
    - `users.py`: Define rotas para gerenciar usuários.
  - `schemas`: Contém esquemas Pydantic para validação e serialização de dados.
    - `auth.py`: Define esquemas para dados de autenticação.
    - `feedback.py`: Define esquemas para dados de feedback.
    - `message.py`: Define esquemas para mensagens.
    - `users.py`: Define esquemas para dados de usuários.
  - `security.py`: Contém funções relacionadas à segurança, como hashing de senhas.
  - `settings.py`: Define configurações da aplicação e variáveis de ambiente.
  - `utils`: Contém funções utilitárias.
    - `yaml.py`: Funções utilitárias para trabalhar com arquivos YAML.

## Explicação Detalhada

### FastAPI

FastAPI é usado como o framework principal para construir a API. O arquivo `app.py` inicializa a aplicação FastAPI e inclui os roteadores definidos no diretório `src/routers`. Cada roteador define um conjunto de endpoints da API para funcionalidades específicas, como autenticação de usuários e gerenciamento de feedbacks.

### SQLAlchemy

SQLAlchemy é usado como o ORM para interagir com o banco de dados SQLite. O arquivo `src/database/models.py` define as tabelas do banco de dados como classes Python, permitindo que você interaja com o banco de dados usando código Python em vez de consultas SQL brutas. O arquivo `src/database/database.py` gerencia a conexão com o banco de dados e fornece um objeto de sessão para realizar operações no banco de dados.

### Tabelas do Banco de Dados

#### User

A tabela `users` armazena informações sobre os usuários do sistema. Cada usuário possui um ID único, nome, senha, email (único), um indicador se é líder, e timestamps de criação e atualização.

#### Feedback

A tabela `feedback` armazena feedbacks fornecidos pelos usuários. Cada feedback possui um ID único, referência ao ID do usuário que forneceu o feedback, um indicador se é um auto-feedback, e timestamps de criação e atualização.

#### FeedbackAnswer

A tabela `feedback_answers` armazena as respostas para cada feedback. Cada resposta possui um ID único, referência ao ID do feedback, número da pergunta, resposta (valor entre 1 e 5), explicação, e timestamps de criação e atualização.

#### IAMessageStore

A tabela `ia_message_store` armazena mensagens relacionadas ao assistente de IA. Cada mensagem possui um ID único, referência ao ID do usuário, o conteúdo da mensagem, uma pontuação indicando se a resposta foi boa ou ruim, e timestamps de criação e atualização.

### Alembic

Alembic é usado para gerenciar migrações de banco de dados. O diretório `migrations` contém os scripts de migração, que definem as mudanças a serem aplicadas ao esquema do banco de dados. Alembic permite que você atualize facilmente o esquema do banco de dados à medida que a aplicação evolui, sem perder dados existentes.

### Routers

O diretório `src/routers` contém as definições das rotas da API. Cada arquivo neste diretório define um conjunto de rotas para uma funcionalidade específica. Abaixo estão as explicações detalhadas de cada rota:

#### auth.py

- **/auth/token** (POST): Esta rota é usada para autenticação de usuários. Ela recebe um formulário com email e senha, verifica as credenciais e retorna um token de acesso JWT se as credenciais forem válidas. A senha é verificada usando a função `verify_password`, que compara a senha fornecida com o hash armazenado no banco de dados. O token de acesso é criado usando a função `create_access_token`.

- **/auth/refresh_token** (POST): Esta rota é usada para renovar o token de acesso. Ela recebe o usuário autenticado e gera um novo token de acesso JWT.

#### collaborators.py

- **/users** (POST): Esta rota é usada para criar novos colaboradores. Ela recebe um objeto `UserSchema` com os dados do usuário, verifica se o email já existe no banco de dados e, se não existir, cria um novo usuário com a senha hashada usando a função `get_password_hash`.

- **/users** (GET): Esta rota é usada para listar todos os colaboradores. Ela verifica se o usuário atual é um líder e, se for, retorna uma lista de colaboradores com paginação.

#### feedback.py

- **/feedback/collaborator/auto** (GET): Esta rota é usada para obter o auto-feedback de um colaborador. Ela verifica se o usuário atual é um colaborador e retorna o auto-feedback e suas respostas.

- **/feedback/collaborator/leader** (GET): Esta rota é usada para obter o feedback de um líder para um colaborador. Ela verifica se o usuário atual é um colaborador e retorna o feedback do líder e suas respostas.

- **/feedback/collaborator** (PUT): Esta rota é usada para atualizar o auto-feedback de um colaborador. Ela recebe um objeto `FeedbackRequest` com as novas respostas e atualiza as respostas existentes no banco de dados.

- **/feedback/collaborator** (POST): Esta rota é usada para submeter um novo auto-feedback de um colaborador. Ela recebe um objeto `FeedbackRequest` com as respostas e cria um novo feedback e suas respostas no banco de dados.

- **/feedback/leader** (POST): Esta rota é usada para submeter um feedback de um líder para um colaborador. Ela recebe um objeto `FeedbackRequest` com as respostas e o ID do usuário a ser avaliado, verifica se o usuário atual é um líder e cria um novo feedback e suas respostas no banco de dados.

#### iago.py

- **/iago** (GET): Esta rota é usada para obter o feedback do assistente IAGO. Ela verifica se o usuário atual é um colaborador, obtém o auto-feedback e o feedback do líder, calcula a pontuação final e envia os dados para o assistente IAGO, retornando a resposta do assistente.

#### leaders.py

- **/leaders** (POST): Esta rota é usada para criar novos líderes. Ela recebe um objeto `UserSchema` com os dados do usuário, verifica se o email já existe no banco de dados e, se não existir, cria um novo líder com a senha hashada usando a função `get_password_hash`.

#### users.py

- **/users/me** (GET): Esta rota é usada para obter as informações do usuário atual. Ela retorna os dados do usuário autenticado no formato definido pelo esquema `UserPublic`.

#### Boas Práticas Utilizadas

- **Hash de Senhas**: As senhas dos usuários são armazenadas no banco de dados de forma segura usando hashing. A função `get_password_hash` é usada para gerar o hash da senha, e a função `verify_password` é usada para verificar a senha fornecida durante a autenticação.
- **JWT para Autenticação**: Tokens JWT são usados para autenticação e autorização. Eles são gerados usando a função `create_access_token` e verificados em cada rota protegida usando a dependência `get_current_user`.
- **Validação de Dados com Pydantic**: Os dados recebidos nas requisições da API são validados usando esquemas Pydantic, garantindo que os dados estejam no formato correto antes de serem processados.
- **Gerenciamento de Sessões com SQLAlchemy**: As operações no banco de dados são realizadas usando sessões SQLAlchemy, garantindo que as transações sejam gerenciadas corretamente e que as alterações sejam confirmadas ou revertidas conforme necessário.
- **Tratamento de Erros**: As exceções são tratadas de forma adequada, retornando respostas HTTP apropriadas com mensagens de erro claras.

### Schemas

O diretório `src/schemas` contém os esquemas Pydantic para validação e serialização de dados. Pydantic é uma biblioteca de validação de dados e gerenciamento de configurações que usa anotações de tipo do Python para definir a estrutura e os tipos de dados. Os esquemas são usados para validar os dados recebidos das requisições da API e para serializar os dados enviados nas respostas da API.

#### auth.py

- **Token**: Define o esquema para o token de autenticação, contendo o token de acesso e o tipo de token.

#### feedback.py

- **FeedbackResponse**: Define o esquema para uma resposta de feedback, contendo o número da pergunta, a resposta e uma explicação opcional.
- **FeedbackRequest**: Define o esquema para uma solicitação de feedback, contendo uma lista de respostas de feedback.
- **FeedbackList**: Extende o esquema `FeedbackRequest` para incluir o ID do feedback, o ID do usuário e um indicador se é um auto-feedback.
- **FeedbackRequestDB**: Extende o esquema `FeedbackRequest` para incluir o ID do feedback, o ID do usuário e um indicador se é um auto-feedback, usado para interações com o banco de dados.

#### message.py

- **Message**: Define o esquema para uma mensagem simples, contendo apenas o conteúdo da mensagem.

#### users.py

- **UserSchema**: Define o esquema para os dados do usuário, contendo nome, email e senha.
- **UserDB**: Extende o esquema `UserSchema` para incluir o ID do usuário, usado para interações com o banco de dados.
- **UserPublic**: Define o esquema para os dados públicos do usuário, contendo ID, nome, email e um indicador se é líder.
- **UserList**: Define o esquema para uma lista de usuários, contendo uma lista de objetos `UserPublic`.

#### Por que Utilizamos Schemas Pydantic?

- **Validação de Dados**: Pydantic permite validar os dados recebidos nas requisições da API de forma simples e eficiente, garantindo que os dados estejam no formato correto antes de serem processados.
- **Serialização de Dados**: Pydantic facilita a serialização dos dados enviados nas respostas da API, convertendo objetos Python em formatos JSON de forma automática.
- **Anotações de Tipo**: Pydantic usa anotações de tipo do Python para definir a estrutura e os tipos de dados, tornando o código mais legível e fácil de entender.
- **Desempenho**: Pydantic é otimizado para desempenho, utilizando validação baseada em modelos e conversão de tipos de forma eficiente.
- **Facilidade de Uso**: Pydantic é fácil de usar e integrar com FastAPI, permitindo definir esquemas de dados de forma declarativa e intuitiva.

## Primeiros Passos

1. Instale o `uv` para poder instalar as dependências do projeto

   ```bash
   pipx install uv
   ```

   ou

   ```bash
   pip install uv
   ```

2. Simplesmente use
                  
```bash
uv run task run
```

Isso irá baixar todas as dependências necessárias do projeto e irá subir o backend para a porta `8000`

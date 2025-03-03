# Projeto Frontend GoCase

Este é o projeto frontend do GoCase, uma aplicação desenvolvida utilizando React, TypeScript e outras tecnologias modernas para criar uma interface de usuário interativa e responsiva.

## Tecnologias Utilizadas

- **React**: Biblioteca JavaScript para construção de interfaces de usuário.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática ao código.
- **Vite**: Ferramenta de build rápida e moderna para projetos frontend.
- **React Router**: Biblioteca para gerenciamento de rotas no React.
- **Axios**: Cliente HTTP para realizar requisições à API.
- **Tailwind CSS**: Framework CSS para estilização rápida e eficiente.
- **React Markdown**: Biblioteca para renderização de markdown no React.

## Boas Práticas

- **Componentização**: O código é dividido em componentes reutilizáveis para facilitar a manutenção e a escalabilidade.
- **Context API**: Utilização do Context API para gerenciamento de estado global, como autenticação.
- **Hooks**: Uso de hooks do React para gerenciar estado e efeitos colaterais.
- **Tipagem**: Utilização de TypeScript para garantir a tipagem estática e evitar erros comuns de JavaScript.
- **Responsividade**: Estilização responsiva utilizando Tailwind CSS para garantir uma boa experiência em diferentes dispositivos.
- **Autenticação**: Implementação de rotas privadas e gerenciamento de autenticação utilizando tokens JWT.

## Estrutura do Projeto

- `src/`: Contém todo o código fonte do projeto.
  - `assets/`: Imagens e outros arquivos estáticos.
  - `components/`: Componentes reutilizáveis.
  - `context/`: Contextos para gerenciamento de estado global.
  - `pages/`: Páginas da aplicação.
  - `routes.tsx`: Configuração das rotas da aplicação.
  - `index.css`: Estilos globais.
  - `main.tsx`: Ponto de entrada da aplicação.

## Como Rodar o Projeto

### Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

### Passos para rodar o projeto

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/yanndrade/gocase.git
   cd frontend
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. **Acesse a aplicação:**

   Abra o navegador e acesse `http://localhost:3000`.

## Scripts Disponíveis

- `dev`: Inicia o servidor de desenvolvimento.
- `build`: Cria uma build otimizada para produção.
- `serve`: Serve a build de produção localmente.

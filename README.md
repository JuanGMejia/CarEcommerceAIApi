# Car E-Commerce AI API

A modern, scalable backend API for a car e-commerce platform, built with [NestJS](https://nestjs.com/) and leveraging AI-powered chat, Azure Blob Storage, OpenAI embeddings, and Qdrant vector database for advanced search and conversational experiences.

---

## 🏗️ Architecture Overview

This project follows a modular, service-oriented architecture using [NestJS](https://nestjs.com/) as the core framework. Key components include:

- **NestJS**: Main application framework for scalable server-side Node.js development.
- **OpenAI**: Used for generating embeddings and chat completions to power intelligent conversational features.
- **Qdrant**: Vector database for semantic search and retrieval-augmented generation (RAG).
- **Azure Blob Storage**: Stores user conversations and data files for embedding.
- **Azure AD Authentication**: Secures endpoints using JWT tokens via Azure Active Directory.
- **Application Insights**: Integrated for telemetry and logging.
- **Docker**: Containerized for easy deployment and CI/CD integration.

### High-Level Flow

1. **User Authentication**: Secured via Azure AD JWT tokens.
2. **Chat Endpoint**: Receives user messages, generates embeddings, retrieves relevant context from Qdrant, and responds using OpenAI's GPT model.
3. **Embeddings**: Text data is chunked, embedded with OpenAI, and indexed in Qdrant for fast semantic search.
4. **Conversation Storage**: User conversations are persisted in Azure Blob Storage for context and continuity.
5. **Conversation Storage**: Prompt is downloaded from blob and stored in cache to optimize the response time.
6. **Observability**: Application Insights logs events and errors for monitoring.

---

## 🚀 Project Purpose

This repository provides a backend API for a car e-commerce platform, enabling:

- AI-powered chat assistant for car sales and advisory.
- Semantic search over car inventory and company information.
- Secure, scalable, and cloud-ready architecture.
- Easy integration with a frontend (e.g., Angular, React).

---

## 🛠️ Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-org/car-ecommerce-ai-api.git
cd car-ecommerce-ai-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
# Edit .env with your credentials (Azure, Qdrant, OpenAI, etc.)
```

### 4. Build the project

```bash
npm run build
```

### 5. Run the application

#### Development

```bash
npm run start:dev
```

#### Production

```bash
npm run start:prod
```

#### Docker

Build and run the Docker container:

```bash
docker build -t car-ecommerce-api .
docker run -p 3000:3000 --env-file .env car-ecommerce-api
```

---

## 🧪 Testing

- **Unit tests:**  
  `npm run test`
- **End-to-end tests:**  
  `npm run test:e2e`
- **Test coverage:**  
  `npm run test:cov`

---

## 📚 Key Endpoints

- `GET /health` — Health check endpoint.
- `POST /chat` — AI-powered chat (requires Azure AD authentication).
- `GET /conversations` — Retrieve user conversation history. (requires Azure AD authentication).
- `GET /embed` — (Re)generate embeddings from blob data (admin use and requires Azure AD authentication).

---

## 📦 Deployment

This project is ready for cloud deployment. See the [Dockerfile](Dockerfile) and [GitHub Actions workflow](.github/workflows/docker-image.yml) for CI/CD automation.  
Environment variables are injected at build time for secure configuration.

---

## 🤖 Main Components

- [`src/controllers/app.controller.ts`](src/controllers/app.controller.ts): API endpoints.
- [`src/services/chat.service.ts`](src/services/chat.service.ts): Chat logic and OpenAI integration.
- [`src/services/embed.service.ts`](src/services/embed.service.ts): Embedding and Qdrant logic.
- [`src/services/azure-blob.service.ts`](src/services/azure-blob.service.ts): Azure Blob Storage integration.
- [`src/services/jwt.service.ts`](src/services/jwt.service.ts): Azure AD JWT authentication.
- [`src/services/app-insights.service.ts`](src/services/app-insights.service.ts): Application Insights logging.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---
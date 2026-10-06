# Hono Todo API

Simple REST API built with:

- Hono
- Node.js
- TypeScript
- SQLite
- better-sqlite3
- pnpm

No PostgreSQL, MySQL, Redis, ORM, or external database server is required.

SQLite database is stored in:

```text
data/app.db
Requirements
Node.js 24+
pnpm 10+
Install
pnpm install
Development
pnpm dev

Server:

http://localhost:3000
Production

Build:

pnpm build

Start:

pnpm start
API
API information
GET /

Returns the API description and endpoint list.

Health check
GET /ping

Example:

curl http://localhost:3000/ping

Response:

{
  "pong": true
}
Todo endpoints
Get all todos
GET /api/todos
curl http://localhost:3000/api/todos
Get one todo
GET /api/todos/:id

Example:

curl http://localhost:3000/api/todos/1
Create todo
POST /api/todos
Content-Type: application/json

Example:

curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Hono"}'

Response:

{
  "data": {
    "id": 1,
    "title": "Learn Hono",
    "completed": false,
    "created_at": "2026-01-01 12:00:00",
    "updated_at": "2026-01-01 12:00:00"
  }
}
Replace todo
PUT /api/todos/:id
Content-Type: application/json

Example:

curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Hono REST API","completed":true}'
Update todo
PATCH /api/todos/:id
Content-Type: application/json

Update title:

curl -X PATCH http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn SQLite"}'

Mark completed:

curl -X PATCH http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
Delete todo
DELETE /api/todos/:id

Example:

curl -X DELETE http://localhost:3000/api/todos/1
Docker

Build:

docker build -t hono-todo .

Run:

docker run --rm \
  -p 3000:3000 \
  -v hono-todo-data:/app/data \
  hono-todo

API:

http://localhost:3000

Health check:

http://localhost:3000/ping

Todos:

http://localhost:3000/api/todos

The SQLite database is stored in the Docker volume:

hono-todo-data

Therefore removing the container does not remove the database.

Docker with local data directory

You can also store the database directly on the server:

mkdir -p data

docker run --rm \
  -p 3000:3000 \
  -v "$(pwd)/data:/app/data" \
  hono-todo

The database will be:

data/app.db
Environment variables
PORT

Default:

3000

Example:

PORT=8080 pnpm start
DATABASE_PATH

Default:

./data/app.db

Example:

DATABASE_PATH=./data/my-database.db pnpm start

Docker default:

/app/data/app.db
Project structure
hono-todo/
├── src/
│   ├── db.ts
│   └── index.ts
├── data/
│   └── .gitkeep
├── .dockerignore
├── .gitignore
├── Dockerfile
├── package.json
├── pnpm-lock.yaml
├── README.md
└── tsconfig.json
License

MIT

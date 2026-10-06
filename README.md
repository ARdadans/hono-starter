# Hono Todo API

A simple, lightweight REST API for managing todos, built with modern web technologies.

## Tech Stack

- **Hono** - Fast, lightweight web framework
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe JavaScript
- **SQLite** - Embedded database (via `better-sqlite3`)
- **pnpm** - Fast, disk-efficient package manager

> **No external database server required** — SQLite stores data locally in `data/app.db`

## Requirements

- Node.js 24+
- pnpm 10+

## Installation

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

Server runs at: **http://localhost:3000**

## Production

```bash
# Build TypeScript to JavaScript
pnpm build

# Start production server
pnpm start
```

## API Endpoints

### API Information
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Returns API description and endpoint list |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ping` | Health check endpoint |

```bash
curl http://localhost:3000/ping
```

**Response:**
```json
{
  "pong": true
}
```

### Todos

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/todos` | Get all todos |
| `GET` | `/api/todos/:id` | Get a single todo by ID |
| `POST` | `/api/todos` | Create a new todo |
| `PUT` | `/api/todos/:id` | Replace a todo (full update) |
| `PATCH` | `/api/todos/:id` | Partially update a todo |
| `DELETE` | `/api/todos/:id` | Delete a todo |

#### Get All Todos
```bash
curl http://localhost:3000/api/todos
```

#### Get One Todo
```bash
curl http://localhost:3000/api/todos/1
```

#### Create Todo
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Hono"}'
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "title": "Learn Hono",
    "completed": false,
    "created_at": "2026-01-01 12:00:00",
    "updated_at": "2026-01-01 12:00:00"
  }
}
```

#### Replace Todo (Full Update)
```bash
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Hono REST API","completed":true}'
```

#### Update Todo (Partial Update)
```bash
# Update title only
curl -X PATCH http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn SQLite"}'

# Mark as completed
curl -X PATCH http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

#### Delete Todo
```bash
curl -X DELETE http://localhost:3000/api/todos/1
```

## Docker

### Build Image
```bash
docker build -t hono-todo .
```

### Run with Volume (Recommended)
```bash
docker run --rm \
  -p 3000:3000 \
  -v hono-todo-data:/app/data \
  hono-todo
```

**API:** http://localhost:3000  
**Health:** http://localhost:3000/ping  
**Todos:** http://localhost:3000/api/todos

The SQLite database persists in the Docker volume `hono-todo-data`, so removing the container doesn't delete the data.

### Run with Local Data Directory
```bash
mkdir -p data
docker run --rm \
  -p 3000:3000 \
  -v "$(pwd)/data:/app/data" \
  hono-todo
```

Database will be stored at: `data/app.db`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `DATABASE_PATH` | `./data/app.db` | Path to SQLite database file |

### Examples

```bash
# Custom port
PORT=8080 pnpm start

# Custom database path
DATABASE_PATH=./data/my-database.db pnpm start
```

**Docker default:** `/app/data/app.db`

## Project Structure

```
hono-todo/
├── src/
│   ├── db.ts         # Database setup and queries
│   └── index.ts      # Application entry point & routes
├── data/
│   └── .gitkeep      # Keeps data directory in git
├── .dockerignore
├── .gitignore
├── Dockerfile
├── package.json
├── pnpm-lock.yaml
├── README.md
└── tsconfig.json
```

## License

MIT
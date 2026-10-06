import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { db, closeDatabase } from './db.js'

const app = new Hono()

type TodoRow = {
  id: number
  title: string
  completed: number
  created_at: string
  updated_at: string
}

function formatTodo(todo: TodoRow) {
  return {
    id: todo.id,
    title: todo.title,
    completed: Boolean(todo.completed),
    created_at: todo.created_at,
    updated_at: todo.updated_at,
  }
}

// -----------------------------------------------------
// Root / API documentation
// -----------------------------------------------------

app.get('/', (c) => {
  return c.json({
    name: 'Hono Todo API',
    version: '1.0.0',
    description: 'Simple Todo REST API built with Hono and SQLite',

    endpoints: {
      health: [
        {
          method: 'GET',
          path: '/ping',
          description: 'Health check',
        },
      ],

      todos: [
        {
          method: 'GET',
          path: '/api/todos',
          description: 'Get all todos',
        },
        {
          method: 'GET',
          path: '/api/todos/:id',
          description: 'Get one todo',
        },
        {
          method: 'POST',
          path: '/api/todos',
          description: 'Create a todo',
          body: {
            title: 'string',
          },
        },
        {
          method: 'PUT',
          path: '/api/todos/:id',
          description: 'Replace a todo',
          body: {
            title: 'string',
            completed: 'boolean',
          },
        },
        {
          method: 'PATCH',
          path: '/api/todos/:id',
          description: 'Update a todo',
          body: {
            title: 'string?',
            completed: 'boolean?',
          },
        },
        {
          method: 'DELETE',
          path: '/api/todos/:id',
          description: 'Delete a todo',
        },
      ],
    },

    examples: {
      get_all: 'GET /api/todos',
      get_one: 'GET /api/todos/1',
      create: 'POST /api/todos {"title":"Learn Hono"}',
      update: 'PATCH /api/todos/1 {"completed":true}',
      delete: 'DELETE /api/todos/1',
    },
  })
})

// -----------------------------------------------------
// Health
// -----------------------------------------------------

app.get('/ping', (c) => {
  return c.json({
    pong: true,
  })
})

// -----------------------------------------------------
// GET /api/todos
// -----------------------------------------------------

app.get('/api/todos', (c) => {
  const rows = db
    .prepare(`
      SELECT id, title, completed, created_at, updated_at
      FROM todos
      ORDER BY id DESC
    `)
    .all() as TodoRow[]

  return c.json({
    data: rows.map(formatTodo),
  })
})

// -----------------------------------------------------
// GET /api/todos/:id
// -----------------------------------------------------

app.get('/api/todos/:id', (c) => {
  const id = Number(c.req.param('id'))

  if (!Number.isInteger(id) || id <= 0) {
    return c.json(
      {
        error: 'Invalid todo ID',
      },
      400
    )
  }

  const todo = db
    .prepare(`
      SELECT id, title, completed, created_at, updated_at
      FROM todos
      WHERE id = ?
    `)
    .get(id) as TodoRow | undefined

  if (!todo) {
    return c.json(
      {
        error: 'Todo not found',
      },
      404
    )
  }

  return c.json({
    data: formatTodo(todo),
  })
})

// -----------------------------------------------------
// POST /api/todos
// -----------------------------------------------------

app.post('/api/todos', async (c) => {
  let body: {
    title?: unknown
  }

  try {
    body = await c.req.json()
  } catch {
    return c.json(
      {
        error: 'Invalid JSON body',
      },
      400
    )
  }

  if (typeof body.title !== 'string' || body.title.trim() === '') {
    return c.json(
      {
        error: 'title is required and must be a non-empty string',
      },
      400
    )
  }

  const title = body.title.trim()

  const result = db
    .prepare(`
      INSERT INTO todos (title)
      VALUES (?)
    `)
    .run(title)

  const todo = db
    .prepare(`
      SELECT id, title, completed, created_at, updated_at
      FROM todos
      WHERE id = ?
    `)
    .get(result.lastInsertRowid) as TodoRow

  return c.json(
    {
      data: formatTodo(todo),
    },
    201
  )
})

// -----------------------------------------------------
// PUT /api/todos/:id
// -----------------------------------------------------

app.put('/api/todos/:id', async (c) => {
  const id = Number(c.req.param('id'))

  if (!Number.isInteger(id) || id <= 0) {
    return c.json(
      {
        error: 'Invalid todo ID',
      },
      400
    )
  }

  let body: {
    title?: unknown
    completed?: unknown
  }

  try {
    body = await c.req.json()
  } catch {
    return c.json(
      {
        error: 'Invalid JSON body',
      },
      400
    )
  }

  if (
    typeof body.title !== 'string' ||
    body.title.trim() === '' ||
    typeof body.completed !== 'boolean'
  ) {
    return c.json(
      {
        error: 'title must be a non-empty string and completed must be boolean',
      },
      400
    )
  }

  const existing = db
    .prepare('SELECT id FROM todos WHERE id = ?')
    .get(id)

  if (!existing) {
    return c.json(
      {
        error: 'Todo not found',
      },
      404
    )
  }

  db.prepare(`
    UPDATE todos
    SET
      title = ?,
      completed = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    body.title.trim(),
    body.completed ? 1 : 0,
    id
  )

  const todo = db
    .prepare(`
      SELECT id, title, completed, created_at, updated_at
      FROM todos
      WHERE id = ?
    `)
    .get(id) as TodoRow

  return c.json({
    data: formatTodo(todo),
  })
})

// -----------------------------------------------------
// PATCH /api/todos/:id
// -----------------------------------------------------

app.patch('/api/todos/:id', async (c) => {
  const id = Number(c.req.param('id'))

  if (!Number.isInteger(id) || id <= 0) {
    return c.json(
      {
        error: 'Invalid todo ID',
      },
      400
    )
  }

  let body: {
    title?: unknown
    completed?: unknown
  }

  try {
    body = await c.req.json()
  } catch {
    return c.json(
      {
        error: 'Invalid JSON body',
      },
      400
    )
  }

  const existing = db
    .prepare(`
      SELECT id, title, completed, created_at, updated_at
      FROM todos
      WHERE id = ?
    `)
    .get(id) as TodoRow | undefined

  if (!existing) {
    return c.json(
      {
        error: 'Todo not found',
      },
      404
    )
  }

  let title = existing.title
  let completed = Boolean(existing.completed)

  if (body.title !== undefined) {
    if (
      typeof body.title !== 'string' ||
      body.title.trim() === ''
    ) {
      return c.json(
        {
          error: 'title must be a non-empty string',
        },
        400
      )
    }

    title = body.title.trim()
  }

  if (body.completed !== undefined) {
    if (typeof body.completed !== 'boolean') {
      return c.json(
        {
          error: 'completed must be boolean',
        },
        400
      )
    }

    completed = body.completed
  }

  db.prepare(`
    UPDATE todos
    SET
      title = ?,
      completed = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title,
    completed ? 1 : 0,
    id
  )

  const todo = db
    .prepare(`
      SELECT id, title, completed, created_at, updated_at
      FROM todos
      WHERE id = ?
    `)
    .get(id) as TodoRow

  return c.json({
    data: formatTodo(todo),
  })
})

// -----------------------------------------------------
// DELETE /api/todos/:id
// -----------------------------------------------------

app.delete('/api/todos/:id', (c) => {
  const id = Number(c.req.param('id'))

  if (!Number.isInteger(id) || id <= 0) {
    return c.json(
      {
        error: 'Invalid todo ID',
      },
      400
    )
  }

  const result = db
    .prepare('DELETE FROM todos WHERE id = ?')
    .run(id)

  if (result.changes === 0) {
    return c.json(
      {
        error: 'Todo not found',
      },
      404
    )
  }

  return c.json({
    message: 'Todo deleted successfully',
    id,
  })
})

// -----------------------------------------------------
// 404
// -----------------------------------------------------

app.notFound((c) => {
  return c.json(
    {
      error: 'Route not found',
      path: c.req.path,
    },
    404
  )
})

// -----------------------------------------------------
// Start server
// -----------------------------------------------------

const port = Number(process.env.PORT || 3000)

const server = serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0',
})

console.log(`Hono Todo API running on http://0.0.0.0:${port}`)

function shutdown() {
  console.log('Shutting down...')

  closeDatabase()
  server.close()

  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

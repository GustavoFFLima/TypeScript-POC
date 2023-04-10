import { Pool } from 'pg';
import { Todo } from '../models/todo';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'todosdb',
  password: 'postgres',
  port: 5432,
});

export class TodoService {
  async getTodos(): Promise<Todo[]> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM todos');
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getTodoById(id: number): Promise<Todo | null> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM todos WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        return null;
      }
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async createTodo(todo: Todo): Promise<Todo> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING id',
        [todo.title, todo.completed]
      );
      todo.id = result.rows[0].id;
      return todo;
    } finally {
      client.release();
    }
  }

  async updateTodoById(id: number, todo: Todo): Promise<Todo | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE todos SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
        [todo.title, todo.completed, id]
      );
      if (result.rowCount === 0) {
        return null;
      }
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteTodoById(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM todos WHERE id = $1', [id]);
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }
}

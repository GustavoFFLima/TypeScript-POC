var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import * as Joi from 'joi';
import { Pool } from 'pg';
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mytodos',
    password: 'mypassword',
    port: 5432,
});
const todoSchema = Joi.object({
    description: Joi.string().required(),
    completed: Joi.boolean().required(),
});
function getTodos() {
    return __awaiter(this, void 0, void 0, function* () {
        const { rows } = yield pool.query('SELECT * FROM todos ORDER BY id ASC');
        return rows;
    });
}
function getTodoById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const { rows } = yield pool.query('SELECT * FROM todos WHERE id = $1', [id]);
        if (rows.length) {
            return rows[0];
        }
        else {
            return null;
        }
    });
}
function createTodo(todo) {
    return __awaiter(this, void 0, void 0, function* () {
        const { description, completed } = todo;
        const { rows } = yield pool.query('INSERT INTO todos (description, completed) VALUES ($1, $2) RETURNING id', [description, completed]);
        const id = rows[0].id;
        return { id, description, completed };
    });
}
function updateTodoById(id, todo) {
    return __awaiter(this, void 0, void 0, function* () {
        const { description, completed } = todo;
        const { rowCount } = yield pool.query('UPDATE todos SET description = $1, completed = $2 WHERE id = $3', [description, completed, id]);
        if (rowCount) {
            return { id, description, completed };
        }
        else {
            return null;
        }
    });
}
function deleteTodoById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const { rowCount } = yield pool.query('DELETE FROM todos WHERE id = $1', [id]);
        return rowCount > 0;
    });
}
const todoRouter = express.Router();
todoRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const todos = yield getTodos();
    res.send(todos);
}));
todoRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const todo = yield getTodoById(id);
    if (todo) {
        res.send(todo);
    }
    else {
        res.status(404).send('Todo not found');
    }
}));
todoRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = todoSchema.validate(req.body);
        if (error) {
            throw new Error(error.message);
        }
        const newTodo = yield createTodo(req.body);
        res.send(newTodo);
    }
    catch (err) {
        res.status(400).send(err.message);
    }
}));
todoRouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        const { error } = todoSchema.validate(req.body);
        if (error) {
            throw new Error(error.message);
        }
        const updatedTodo = yield updateTodoById(id, req.body);
        if (updatedTodo) {
            res.send(updatedTodo);
        }
        else {
            res.status(404).send('Todo not found');
        }
    }
    catch (err) {
        res.status(400).send(err.message);
    }
}));
todoRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const deleted = yield deleteTodoById(id);
    if (deleted) {
        res.send(true);
    }
    else {
        res.status(404).send(false);
    }
}));
const app = express();
const PORT = 3000;
app.use(express.json());
app.use('/todos', todoRouter);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

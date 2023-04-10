import express, { Request, Response } from 'express';
import { TodoController } from '../controllers/todo.controller';
import { Todo } from '../models/todo';

const router = express.Router();
const todoController = new TodoController();

function wrapAsync(fn: Function) {
  return function(req: Request, res: Response, next: Function) {
    fn(req, res, next).catch(next);
  };
}

router.get('/todos', wrapAsync(todoController.getTodos));
router.get('/todos/:id', wrapAsync(todoController.getTodoById));
router.post('/todos', wrapAsync(todoController.createTodo));
router.put('/todos/:id', wrapAsync(todoController.updateTodoById));
router.delete('/todos/:id', wrapAsync(todoController.deleteTodoById));

export default router;


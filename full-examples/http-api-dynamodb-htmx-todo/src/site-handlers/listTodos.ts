import { defineRoute } from '@latcher/apigateway';

import { findTodos } from '../utils/dynamodb.js';
import { TodoListSchema } from '../utils/schemas.js';

export const listTodos = defineRoute({
  filters: {
    method: 'GET',
    path: '/api/todos',
  },
  responseType: 'json',
  responseSchema: TodoListSchema,
}).handle(async () => {
  const todos = await findTodos();
  return { todos };
});

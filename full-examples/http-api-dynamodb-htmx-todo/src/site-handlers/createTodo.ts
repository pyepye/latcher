import { Created, defineRoute } from '@latcher/apigateway';
import { logger } from '@latcher/base';

import { insertTodo } from '../utils/dynamodb.js';
import { TitleFormSchema } from '../utils/schemas.js';
import { render } from '../views.js';

export const createTodo = defineRoute({
  filters: {
    method: 'POST',
    path: '/todos',
  },
  responseType: 'html',
  bodySchema: TitleFormSchema,
}).handle(async (request) => {
  const todo = await insertTodo(request.body.title);

  logger.info({ message: 'To-do created', id: todo.id });

  return Created(render('todoItem.njk', { todo }));
});

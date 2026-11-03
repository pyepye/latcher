import { defineRoute, NotFound } from '@latcher/apigateway';

import { updateDone } from '../utils/dynamodb.js';
import { DoneFormSchema } from '../utils/schemas.js';
import { render } from '../views.js';

export const toggleTodo = defineRoute({
  filters: {
    method: 'PATCH',
    path: '/todos/:id',
  },
  responseType: 'html',
  bodySchema: DoneFormSchema,
}).handle(async (request) => {
  const { id } = request.path;

  const todo = await updateDone(id, request.body.done);
  if (!todo) throw NotFound(`To-do ${id} not found`);

  return render('todoItem.njk', { todo });
});

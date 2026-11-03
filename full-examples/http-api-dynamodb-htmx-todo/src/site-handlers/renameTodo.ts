import { defineRoute, NotFound } from '@latcher/apigateway';

import { updateTitle } from '../utils/dynamodb.js';
import { TitleFormSchema } from '../utils/schemas.js';
import { render } from '../views.js';

export const renameTodo = defineRoute({
  filters: {
    method: 'PUT',
    path: '/todos/:id',
  },
  responseType: 'html',
  bodySchema: TitleFormSchema,
}).handle(async (request) => {
  const { id } = request.path;

  const todo = await updateTitle(id, request.body.title);
  if (!todo) throw NotFound(`To-do ${id} not found`);

  return render('todoItem.njk', { todo });
});

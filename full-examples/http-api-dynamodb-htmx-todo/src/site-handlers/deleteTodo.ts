import { defineRoute, Html, NotFound } from '@latcher/apigateway';

import { removeTodo } from '../utils/dynamodb.js';

export const deleteTodo = defineRoute({
  filters: {
    method: 'DELETE',
    path: '/todos/:id',
  },
  responseType: 'html',
}).handle(async (request) => {
  const { id } = request.path;

  const removed = await removeTodo(id);
  if (!removed) throw NotFound(`To-do ${id} not found`);

  // HTMX swaps nothing for a 204, so an empty 200 is what removes the item from the page
  return Html('');
});

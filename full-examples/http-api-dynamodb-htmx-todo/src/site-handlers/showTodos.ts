import { defineRoute } from '@latcher/apigateway';

import { findTodos } from '../utils/dynamodb.js';
import { MAX_TITLE_LENGTH } from '../utils/schemas.js';
import { render } from '../views.js';

export const showTodos = defineRoute({
  filters: {
    method: 'GET',
    path: '/',
  },
  responseType: 'html',
}).handle(async () => {
  const todos = await findTodos();
  return render('index.njk', { title: 'To-dos', todos, maxTitleLength: MAX_TITLE_LENGTH });
});

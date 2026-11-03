import { createAPIGatewayMatcher } from '@latcher/apigateway';

import { logSiteInvocation } from './middleware/logInvocation.js';
import { createTodo } from './site-handlers/createTodo.js';
import { deleteTodo } from './site-handlers/deleteTodo.js';
import { listTodos } from './site-handlers/listTodos.js';
import { renameTodo } from './site-handlers/renameTodo.js';
import { showTodos } from './site-handlers/showTodos.js';
import { toggleTodo } from './site-handlers/toggleTodo.js';
import { errorPage } from './views.js';

export const siteMatcher = createAPIGatewayMatcher({
  responseType: 'html',
  errors: { html: errorPage },
  middleware: [logSiteInvocation],
});

siteMatcher.route(showTodos).route(createTodo).route(renameTodo).route(toggleTodo).route(deleteTodo).route(listTodos);

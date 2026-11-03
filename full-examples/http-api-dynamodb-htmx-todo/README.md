# Full example: HTML to-do site with HTMX and Alpine.js

A deployable CDK app that serves a to-do website from one Lambda function. The matcher's response type is
`html`, so the routes return pages and page fragments made with [Nunjucks](https://mozilla.github.io/nunjucks/).
[HTMX](https://htmx.org/) sends each change to the server and swaps in the HTML it gets back.
[Alpine.js](https://alpinejs.dev/) handles the parts that never need the server.

```
Browser
└── API Gateway (HTTP API, $default route)
    └── siteFn (siteMatcher, responseType 'html')
        ├── GET    /            showTodos   the full page
        ├── POST   /todos       createTodo  one new <li>
        ├── PUT    /todos/:id   renameTodo  the changed <li>
        ├── PATCH  /todos/:id   toggleTodo  the changed <li>
        ├── DELETE /todos/:id   deleteTodo  an empty body, which removes the <li>
        └── GET    /api/todos   listTodos   JSON, because the route sets responseType 'json'
            └── DynamoDB table, one row per to-do
```

The steps to run it are in [Prerequisites](#prerequisites), [Permissions](#permissions) and [Deploy](#deploy).

## What each part does

| Part | Where | Job |
| --- | --- | --- |
| HTML matcher | `src/site.ts` | Sets `responseType: 'html'` and `errors.html`, so every route and every error answers with HTML |
| Nunjucks | `src/views.ts`, `src/templates/` | Renders the templates with `autoescape` on, then wraps the result in `Html()` |
| HTMX | `hx-*` attributes in the templates | Sends forms and clicks to the routes, and swaps the returned HTML into the page |
| Alpine.js | `x-*` and `@` attributes in the templates | The all / active / done filter, the inline rename form and the characters-left counter |
| zod | `src/utils/schemas.ts` | Turns the form body into typed fields and checks the title |

### HTML routes and Html()

A route returns `Html(...)`, and the matcher sends the string as it is. The matcher does not escape anything,
so the template engine has to. `src/views.ts` turns on Nunjucks `autoescape`, so a title such as
`<script>` shows as text.

An HTML matcher needs `errors.html`. Here it is `errorPage` in `src/views.ts`, which renders
`error.njk` for every error. That includes a 404 for a path no route matches, and a 422 when the form body
fails its schema. For a 422 the page lists the schema's messages.

`GET /api/todos` sets `responseType: 'json'`, so one HTML matcher also serves a JSON route.

### Form bodies

HTMX sends forms as `application/x-www-form-urlencoded`, the same as a plain HTML form, and not as JSON.
The matcher gives a form body to the route as a string. `TitleFormSchema` and `DoneFormSchema` read it with
`URLSearchParams` and check the fields, so `request.body.title` is a string that is from 1 to 100
characters long.

### Errors in the page

HTMX does not swap a 4xx or 5xx response by default. The `htmx-config` meta tag in `layout.njk` changes
that. It takes the `#error` section from the error page and puts it in the `#errors` box at the top of the
page. Each new request clears the box.

### Scripts from the CDN

HTMX and Alpine.js load from jsDelivr. Each script tag pins an exact version and has an `integrity` hash,
so the browser refuses a file whose content is different. If you change a version, change its hash too:

```bash
curl -sL https://cdn.jsdelivr.net/npm/htmx.org@2.0.11/dist/htmx.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

### Templates in the bundle

esbuild bundles only code. An `afterBundling` hook in `lib/app-stack.ts` copies `src/templates` next to the
bundled `index.mjs`, where the Nunjucks `FileSystemLoader` reads them. The hook runs on your machine, so
the deploy uses the local `esbuild` from this package and not Docker.

## Prerequisites

- AWS account with credentials on the shell
- CDK bootstrap already run for the target account / region
- Node 24 and pnpm installed

## Permissions

`deploy-policy.json` holds the minimum permissions needed to deploy this example and test it. Attach it to
the user or role you run the commands with.

CloudFormation work is done by the CDK bootstrap roles, so the policy only allows assuming those roles. The
rest covers reading the table and the logs. Actions are locked down, resources are not.

The site and the `curl` calls below need no AWS credentials.

Note: the policy assumes the default bootstrap qualifier `hnb659fds`. Change the role and parameter ARNs if
your account uses a custom one.

## Deploy

From this directory:

```bash
pnpm -F @latcher/full-example-http-api-dynamodb-htmx-todo... install
pnpm -F @latcher/full-example-http-api-dynamodb-htmx-todo... build
pnpm -F @latcher/full-example-http-api-dynamodb-htmx-todo run deploy
```

CDK outputs include `SiteUrl` and `TableName`.

## Playing around

Open the `SiteUrl` output in a browser.

1. Add a few to-dos. Each one appears without a page reload.
2. Tick one off, then use the Active and Done buttons to filter the list.
3. Double-click a title, or press Rename, to change it. Escape cancels.
4. Type more than 100 characters and press Add. The counter turns red, and the server answers 422, which
   shows in the box at the top.
5. Open `<SiteUrl>/nope` to see the 404 page.

The same routes answer `curl`:

```bash
export SITE=<SiteUrl>

# Add a to-do. The answer is the <li> for it
curl -X POST -d 'title=Buy milk' "$SITE/todos"

# Read the list as JSON
curl "$SITE/api/todos"

# Send an empty title. The answer is a 422 error page
curl -i -X POST -d 'title=' "$SITE/todos"
```

`curl -d` sends `application/x-www-form-urlencoded`, the same as HTMX.

## Checking the logs

```bash
aws logs tail /aws/lambda/http-api-dynamodb-htmx-todo-site --since 10m --format short
```

The middleware in `src/middleware/logInvocation.ts` logs `Handling site request` for each request.
`isHtmxRequest` is `true` when HTMX sent it, which it shows with the `hx-request` header. `createTodo` also
logs `To-do created`.

Note: the group name is `/aws/lambda/<stackName>-site`, so it changes if you deploy with a different
`stackName`.

## Database

One DynamoDB table with `id` as its partition key. Each row holds `title`, `done` and `createdAt`.

The list is a scan sorted by `createdAt`, which suits a demo with a few rows. A real list would use a query
on a key that keeps the rows in order.

Rename, tick and delete use `attribute_exists(id)`, so a to-do that another tab deleted gets a 404.

## Iterating

```bash
pnpm -F @latcher/full-example-http-api-dynamodb-htmx-todo diff   # review pending changeset
pnpm -F @latcher/full-example-http-api-dynamodb-htmx-todo watch  # hotswap deploys
pnpm -F @latcher/full-example-http-api-dynamodb-htmx-todo synth  # render template
```

## Tear down

```bash
pnpm -F @latcher/full-example-http-api-dynamodb-htmx-todo destroy
```

This deletes the table and the log group.

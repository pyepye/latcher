import { fileURLToPath } from 'node:url';

import { type ErrorInput, Html } from '@latcher/apigateway';
import { Environment, FileSystemLoader } from 'nunjucks';
import z from 'zod';

// The CDK bundle copies src/templates next to the bundled index.mjs, so this path works in both places
const templatesDir = fileURLToPath(new URL('./templates', import.meta.url));

// Html() sends the string as it is, so autoescape is what keeps a to-do title from becoming markup
const nunjucks = new Environment(new FileSystemLoader(templatesDir), { autoescape: true });

const IssuesSchema = z.array(z.object({ message: z.string() }));

export function render(template: string, context: object): Html {
  return Html(nunjucks.render(template, context));
}

function issueMessages(context: ErrorInput['context']): string[] {
  const issues = IssuesSchema.safeParse(context);
  if (!issues.success) return [];
  return issues.data.map((issue) => issue.message);
}

export function errorPage({ statusCode, statusText, message, context }: ErrorInput): Html {
  return render('error.njk', {
    title: statusText,
    statusCode,
    statusText,
    message,
    issueMessages: issueMessages(context),
  });
}

import z from 'zod';

export const MAX_TITLE_LENGTH = 100;

export const TodoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(MAX_TITLE_LENGTH),
  done: z.boolean(),
  createdAt: z.string(),
});

export type TTodo = z.infer<typeof TodoSchema>;

export const TodoListSchema = z.object({
  todos: z.array(TodoSchema),
});

// HTMX posts forms as application/x-www-form-urlencoded, which the matcher hands over as a string
function formFields(body: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(body));
}

const TitleSchema = z
  .string()
  .trim()
  .min(1, 'Give the to-do a title')
  .max(MAX_TITLE_LENGTH, `Keep the title to ${MAX_TITLE_LENGTH} characters or fewer`);

export const TitleFormSchema = z
  .string()
  .transform(formFields)
  .pipe(z.object({ title: TitleSchema }));

export const DoneFormSchema = z
  .string()
  .transform(formFields)
  .pipe(z.object({ done: z.enum(['true', 'false']).transform((done) => done === 'true') }));

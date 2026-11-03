import { randomUUID } from 'node:crypto';

import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import z from 'zod';

import { ddb, TABLE_NAME } from '../config.js';
import { TodoSchema, type TTodo } from './schemas.js';

const TodoRowsSchema = z.array(TodoSchema);

function byCreatedAt(first: TTodo, second: TTodo): number {
  return first.createdAt.localeCompare(second.createdAt);
}

// A scan reads the whole table, which suits a demo list of a few items
export async function findTodos(): Promise<TTodo[]> {
  const result = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));
  const todos = TodoRowsSchema.parse(result.Items ?? []);
  return todos.toSorted(byCreatedAt);
}

export async function insertTodo(title: string): Promise<TTodo> {
  const todo: TTodo = {
    id: randomUUID(),
    title,
    done: false,
    createdAt: new Date().toISOString(),
  };
  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: todo }));
  return todo;
}

async function updateField(
  id: string,
  field: 'title' | 'done',
  fieldValue: string | boolean,
): Promise<TTodo | undefined> {
  try {
    const result = await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: 'SET #field = :fieldValue',
        ConditionExpression: 'attribute_exists(id)',
        ExpressionAttributeNames: { '#field': field },
        ExpressionAttributeValues: { ':fieldValue': fieldValue },
        ReturnValues: 'ALL_NEW',
      }),
    );
    return TodoSchema.parse(result.Attributes);
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) return undefined;
    throw error;
  }
}

export async function updateTitle(id: string, title: string): Promise<TTodo | undefined> {
  return updateField(id, 'title', title);
}

export async function updateDone(id: string, done: boolean): Promise<TTodo | undefined> {
  return updateField(id, 'done', done);
}

export async function removeTodo(id: string): Promise<boolean> {
  try {
    await ddb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id },
        ConditionExpression: 'attribute_exists(id)',
      }),
    );
    return true;
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) return false;
    throw error;
  }
}

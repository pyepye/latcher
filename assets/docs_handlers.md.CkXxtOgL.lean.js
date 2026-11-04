import{C as r,o as k,c as d,ak as i,E as h}from"./chunks/framework.C2AAou88.js";const c=JSON.parse('{"title":"Handlers","description":"","frontmatter":{},"headers":[],"relativePath":"docs/handlers.md","filePath":"docs/handlers.md"}'),o={name:"docs/handlers.md"},F=Object.assign(o,{setup(E){const a=`import type { Handler } from 'aws-lambda'
import { Latcher } from '@latcher/base'

import { sqsMatcher } from './sqs.js'

const latcher = new Latcher({
  matchers: [sqsMatcher],
})

export const handler: Handler = latcher.handler()`,e=`import { z } from 'zod'

export const OrderSchema = z.object({
  orderId: z.string(),
  customerEmail: z.string(),
  items: z.array(z.object({ sku: z.string(), price: z.number(), quantity: z.number() })),
})

export const OrderAttributesSchema = z.object({ dryRun: z.coerce.boolean().default(false) })`,t=`  const total = body.items.reduce((sum, { price, quantity }) => sum + price * quantity, 0)

  if (messageAttributes.dryRun) {
    logger.info('Dry run, order not saved', { orderId: body.orderId, total })
    return
  }

  await orders.save({ ...body, total, status: 'CONFIRMED' })
  await notifications.send(body.customerEmail, 'order-confirmed', { total })`,l=[{path:"routes/processOrder.ts",code:`import { logger } from '@latcher/base'
import { defineRoute } from '@latcher/sqs'

import { OrderAttributesSchema, OrderSchema } from '../schemas/order.js'
import { notifications, orders } from '../services/orders.js'

const ORDER_QUEUE_ARN = 'arn:aws:sqs:eu-west-2:123456789012:orders'

export const processOrderRoute = defineRoute({
  filters: { eventSourceArn: ORDER_QUEUE_ARN },
  bodySchema: OrderSchema,
  messageAttributesSchema: OrderAttributesSchema,
}).handle(async ({ body, messageAttributes }) => {
  // No types named anywhere. defineRoute infers the request from the two schemas
${t}
})`},{path:"schemas/order.ts",code:e},{path:"sqs.ts",code:`import { createSQSMatcher } from '@latcher/sqs'

import { processOrderRoute } from './routes/processOrder.js'

export const sqsMatcher = createSQSMatcher()

// The route arrives complete, filters and schemas included
sqsMatcher.route(processOrderRoute)`},{path:"index.ts",code:a}],p=[{path:"handlers/processOrder.ts",code:`import { logger } from '@latcher/base'
import type { SQSRequest, SQSResponse } from '@latcher/sqs'
import type { z } from 'zod'

import { OrderAttributesSchema, OrderSchema } from '../schemas/order.js'
import { notifications, orders } from '../services/orders.js'

// The types defineRoute would have inferred, named here instead
type Order = z.infer<typeof OrderSchema>
type OrderAttributes = z.infer<typeof OrderAttributesSchema>

export async function processOrder(request: SQSRequest<{ body: Order; messageAttributes: OrderAttributes }>): Promise<SQSResponse> {
  const { body, messageAttributes } = request
${t}
}`},{path:"schemas/order.ts",code:e},{path:"sqs.ts",code:`import { createSQSMatcher } from '@latcher/sqs'

import { processOrder } from './handlers/processOrder.js'
import { OrderAttributesSchema, OrderSchema } from './schemas/order.js'

const ORDER_QUEUE_ARN = 'arn:aws:sqs:eu-west-2:123456789012:orders'

export const sqsMatcher = createSQSMatcher()

// Filters, schemas and handler are brought together here instead
sqsMatcher.route({
  filters: { eventSourceArn: ORDER_QUEUE_ARN },
  bodySchema: OrderSchema,
  messageAttributesSchema: OrderAttributesSchema,
  handler: processOrder,
})`},{path:"index.ts",code:a}];return(g,s)=>{const n=r("CodeFileViewer");return k(),d("div",null,[s[0]||(s[0]=i("",34)),h(n,{files:l,id:"inferred-handlers","default-file":"routes/processOrder.ts","line-numbers":"","collapse-toggle":"","fixed-height":""}),s[1]||(s[1]=i("",5)),h(n,{files:p,id:"annotated-handlers","default-file":"handlers/processOrder.ts","line-numbers":"","collapse-toggle":"","fixed-height":""}),s[2]||(s[2]=i("",31))])}}});export{c as __pageData,F as default};

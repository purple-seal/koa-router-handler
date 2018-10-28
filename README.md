# koa-router-handler
koa middleware for wrapping router handler


## Introduction

This module lets you remove tedious codes related with request/response object.

* extract payload from ctx.query or ctx.request.body.
* add basic validation at request

## Example

``` javascript
const Koa = require('koa')
const Router = require('koa-router')
const bodyparser = require('koa-bodyparser')
const { wrap } = require('../index')

const app = new Koa()

const router = new Router({
  prefix: '/v1'
})

router.get('/todos/:todoId', wrap(({ todoId }) => {
  const todo = { id: todoId } // get object from todoId
  return todo
}, {
  createErrorBody: ({ message }) => {
    return {
      message
    }
  }
}))

router.post('/todos', wrap(({ title, body }) => {
  return 'OK'
}, {
  validations: {
    title: { required: true },
  },
  createErrorBody: ({ message }) => {
    return {
      message
    }
  }
}))

app.use(bodyparser()).use(router.routes())

app.listen(3000)
```
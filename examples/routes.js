const Koa = require('koa')
const Router = require('koa-router')
const bodyparser = require('koa-bodyparser')
const { wrap } = require('../index')

const app = new Koa()

const router = new Router({
  prefix: '/v1'
})

router.get('/todos/:todoId', wrap((params) => {
  const { todoId } = params
  const todo = { id: todoId } // get object from todoId
  return todo
}, {
  createErrorBody: ({ message }) => {
    return {
      message
    }
  }
}))

router.post('/todos', wrap((params) => {
  const { title, body } = params

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
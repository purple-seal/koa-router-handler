class HttpError {
  constructor (status, message) {
    this.status = status
    this.message = message
  }
}
function wrapHandler (handler) {
  return async function controllerHandler (ctx) {
    const method = ctx.method.toUpperCase()
    let params
    if (method === 'GET') {
      params = {
        ...ctx.query,
        ...ctx.params
      }
    } else {
      params = {
        ...ctx.request.body,
        ...ctx.params
      }
    }

    try {
      ctx.body = await handler(params)
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(e)
      }
      if (e instanceof HttpError) {
        ctx.status = e.status
        ctx.body = e.message
      } else {
        ctx.status = 500
        ctx.body = 'Internal server error'
      }
    }
  }
}

module.exports = {
  wrap: wrapHandler,
  HttpError
}

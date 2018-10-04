class HttpError {
  constructor (status, message) {
    this.status = status
    this.message = message
  }
}

function hasError (key, validation, params) {
  const value = params[key]
  return (validation.required && key in params === false
    || validation.type && typeof value !== validation.type
    || validation.pattern && !validation.pattern.test(value))
}

function createErrorMsg (key, validation, params) {
  const value = params[key]
  if (validation.required && key in params === false) {
     return `Required field missing: ${key}`
  }
  if (validation.type && typeof value !== validation.type) {
    return `The value ${key} is not expected type: ${validation.type}.`
  }
  if (validation.pattern && !validation.pattern.test(value)) {
    return `The value ${key} has not expected pattern: ${validation.pattern}.`
  }

  return false
}

function wrapHandler (handler, { validations, createErrorBody } = {}) {
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
      if (validations) {
        const key = Object.keys(validations).find(k => hasError(k, validations[k], params))
        if (key) {
          const msg = createErrorMsg(key, validations[key], params)
          ctx.status = 400
          ctx.body = createErrorBody ? createErrorBody(key, { status: 400, message: msg }) : msg
          return
        }
      }

      ctx.body = await handler(params)
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(e)
      }
      if (e instanceof HttpError) {
        ctx.status = e.status
        ctx.body = e.message
      } else {
        const message = 'Internal server error'
        ctx.status = 500
        ctx.body = createErrorBody ? createErrorBody(null, { status: 500, message }) : message
      }
    }
  }
}

module.exports = {
  wrap: wrapHandler,
  HttpError
}

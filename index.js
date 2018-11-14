class HttpError {
  constructor(status, error) {
    this.status = status
    this.error = error
  }
}

class ValidationError {
  constructor(type) {
    this.type = type
  }

  createErrorMsg(key, validation) {
    if (this.type === 'required') {
      return `Required field missing: ${key}`
    }
    if (this.type === 'type') {
      return `The value ${key} is not expected type: ${validation.type}.`
    }
    if (this.type === 'pattern') {
      return `The value ${key} has not expected pattern: ${validation.pattern}.`
    }
  }
}

function validatePattern(pattern, value) {
  return pattern.test(value) && pattern.exec(value)[0] === String(value)
}

function hasRequiredError(validation, hasValue) {
  return validation.required && !hasValue
}

function hasTypeError(validation, value, hasValue) {
  return hasValue && validation.type && typeof value !== validation.type
}

function hasPatternError(validation, value, hasValue) {
  return hasValue && validation.pattern && !validatePattern(validation.pattern, value)
}

function findError(key, validation, params) {
  const value = params[key]
  const hasValue = key in params
  if (hasRequiredError(validation, hasValue)) {
    return new ValidationError('required')
  }
  if (hasTypeError(validation, value, hasValue)) {
    return new ValidationError('type')
  }
  if (hasPatternError(validation, value, hasValue)) {
    return new ValidationError('pattern')
  }
  return false
}

function dummyCatchHandler (e) {
  throw e
}

function wrapHandler(handler, {validations, createErrorBody, catchHandler = dummyCatchHandler} = {}) {
  return async function controllerHandler(ctx) {
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
        const keys = Object.keys(validations)
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i]
          const error = findError(k, validations[k], params)
          if (error) {
            const msg = error.createErrorMsg(k, validations[k])
            ctx.status = 400
            ctx.body = createErrorBody ? createErrorBody({status: 400, message: msg, key: k}) : msg
            return
          }
        }
      }

      const response = await handler(params, ctx).catch(catchHandler)
      if (response) {
        ctx.status = 200
        ctx.body = response
      } else {
        ctx.status = 204
      }
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(e)
      }
      if (e instanceof HttpError) {
        const error = e.error
        ctx.status = e.status
        ctx.body = createErrorBody ? createErrorBody({status: e.status, error}) : error
      } else {
        const message = 'Internal server error'
        ctx.status = 500
        ctx.body = createErrorBody ? createErrorBody({status: 500, message}) : message
      }
    }
  }
}

module.exports = {
  wrap: wrapHandler,
  HttpError
}

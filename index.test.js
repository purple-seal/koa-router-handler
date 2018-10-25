const { wrap } = require('./index')

describe('wrapper for router handler', () => {
  test('create body with query parameter', async () => {
    const handler = wrap((params) => ({ data: params['a'] }))
    const ctx = {
      method: 'GET',
      query: { 'a': 'OK' }
    }
    await handler(ctx)

    expect(ctx.body).toHaveProperty('data', 'OK')
  })

  test('check validation of required field', async () => {
    const handler = wrap((params) => ({ data: params['a'] }), {
      validations: {
        b: {
          required: true
        }
      }
    })
    const ctx = {
      method: 'GET',
      query: { 'a': 'OK' }
    }
    await handler(ctx)

    expect(ctx.status).toEqual(400)
    expect(ctx.body).toEqual('Required field missing: b')
  })

  test('check validation of type', async () => {
    const handler = wrap((params) => ({ data: params['a'] }), {
      validations: {
        a: {
          type: 'number'
        }
      }
    })
    const ctx = {
      method: 'GET',
      query: { 'a': 'OK' }
    }
    await handler(ctx)

    expect(ctx.status).toEqual(400)
    expect(ctx.body).toEqual('The value a is not expected type: number.')
  })

  test('check validation of pattern', async () => {
    const handler = wrap((params) => ({ data: 'ok' }), {
      validations: {
        c: {
          pattern: /([0-9]+,?)+/
        }
      },
      createErrorBody: ({ status, message, key }) => ({
        code: 102,
        message
      })
    })
    const ctx = {
      method: 'GET',
      query: { 'c': 'a,b' }
    }
    await handler(ctx)

    expect(ctx.status).toEqual(400)
    expect(ctx.body).toHaveProperty('code', 102)
    expect(ctx.body).toHaveProperty('message', 'The value c has not expected pattern: /([0-9]+,?)+/.')
  })

  test('check validation of pattern for valid number', async () => {
    const handler = wrap((params) => ({ data: 'ok' }), {
      validations: {
        c: {
          pattern: /[0-9]+/
        }
      },
      createErrorBody: ({ status, message, key}) => ({
        code: 102,
        message
      })
    })
    const ctx = {
      method: 'GET',
      query: { 'c': 12345 }
    }
    await handler(ctx)

    expect(ctx.status).toBeUndefined()
  })

  test('pass checking validation if the value is none', async () => {
    const handler = wrap((params) => ({ data: 'ok' }), {
      validations: {
        c: {
          pattern: /([0-9]+,?)+/
        }
      },
      createErrorBody: ({ status, message, key }) => ({
        code: 102,
        message
      })
    })
    const ctx = {
      method: 'GET',
      query: { 'a': 'OK' }
    }
    await handler(ctx)

    expect(ctx.body).toHaveProperty('data', 'ok')
  })

  test('check validation with "createErrorBody"', async () => {
    const handler = wrap((params) => ({ data: params['a'] }), {
      validations: {
        b: {
          required: true
        }
      },
      createErrorBody: ({ status, message, key }) => ({
        code: 102,
        message
      })
    })
    const ctx = {
      method: 'GET',
      query: { 'a': 'OK' }
    }
    await handler(ctx)

    expect(ctx.status).toEqual(400)
    expect(ctx.body).toHaveProperty('code', 102)
    expect(ctx.body).toHaveProperty('message', 'Required field missing: b')
  })

})


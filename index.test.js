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

  test('check validation with "createErrorBody"', async () => {
    const handler = wrap((params) => ({ data: params['a'] }), {
      validations: {
        b: {
          required: true
        }
      },
      createErrorBody: (key, { status, message}) => ({
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


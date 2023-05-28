import { createServer } from '../src/server'
import Hapi from '@hapi/hapi'

describe('Courses endpoint', () => {
    let server: Hapi.Server

    beforeAll(async () => {
        server = await createServer()
    })

    afterAll(async () => {
        await server.stop()
    })

    test('images endpoint returns 401 without authorization', async () => {
        const res = await server.inject({
            method: 'GET',
            url: '/images',
        })
        expect(res.statusCode).toEqual(404)
    })

    test('images endpoint returns 200 with valid authorization', async () => {
        const res = await server.inject({
            method: 'GET',
            url: '/',
            headers: {
                'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbklkIjozfQ.XxNAzxBBZHcOAXBbh0GQOQG0SOQUEOrPr2eO0-a1U2A'
            }
        })
        expect(res.statusCode).toEqual(200)
        // add more expectations based on your success response
    })
})
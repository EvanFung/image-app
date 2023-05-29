import { API_AUTH_STATEGY } from '../src/plugins/auth'
import { createServer } from '../src/server'
import Hapi, { AuthCredentials } from '@hapi/hapi'
import { createUserCredentials } from './test-helpers'

describe('users endpoints', () => {
    let server: Hapi.Server
    let testUserCredentials: AuthCredentials
    let testAdminCredentials: AuthCredentials

    beforeAll(async () => {
        server = await createServer()
        testUserCredentials = await createUserCredentials(server.app.prisma, false)
        testAdminCredentials = await createUserCredentials(server.app.prisma, true)

    })

    afterAll(async () => {
        await server.stop()
    })

    let userId: number
    test('create user', async () => {
        const response = await server.inject({
            method: 'POST',
            url: '/users',
            auth: {
                strategy: API_AUTH_STATEGY,
                credentials: testAdminCredentials,
            },
            payload: {
                firstName: 'test-first-name',
                lastName: 'test-last-name',
                email: `test-${Date.now()}@prisma.io`,
            },
        })

        expect(response.statusCode).toEqual(201)
        userId = JSON.parse(response.payload)?.id
        expect(typeof userId === 'number').toBeTruthy()

    })


    test('create user validation', async () => {
        const response = await server.inject({
            method: 'POST',
            url: '/users',
            auth: {
                strategy: API_AUTH_STATEGY,
                credentials: testAdminCredentials,
            },
            payload: {
                lastName: 'test-last-name',
                email: `test-${Date.now()}@prisma.io`,
            },
        })

        expect(response.statusCode).toEqual(400)
    })


    test('get user returns 404 for non existant user', async () => {
        const response = await server.inject({
            method: 'GET',
            url: '/users/9999',
            auth: {
                strategy: API_AUTH_STATEGY,
                credentials: testAdminCredentials,
            },
        })

        expect(response.statusCode).toEqual(404)
    })

    test('get user returns user', async () => {
        const response = await server.inject({
            method: 'GET',
            url: `/users/${testUserCredentials.userId}`,
            auth: {
                strategy: API_AUTH_STATEGY,
                credentials: testUserCredentials,
            },
        })
        expect(response.statusCode).toEqual(200)
        const user = JSON.parse(response.payload)

        expect(user.id).toBe(testUserCredentials.userId)
    })


    test('update user fails with invalid userId parameter', async () => {
        const response = await server.inject({
            method: 'GET',
            url: '/users/a123',
            auth: {
                strategy: API_AUTH_STATEGY,
                credentials: testUserCredentials,
            },
        })
        expect(response.statusCode).toEqual(400)
    })


    test('update user fails with invalid userId parameter', async () => {
        const response = await server.inject({
            method: 'PUT',
            url: `/users/aa22`,
            auth: {
                strategy: API_AUTH_STATEGY,
                credentials: testUserCredentials,
            },
        })
        expect(response.statusCode).toEqual(400)
    })


    test('update user', async () => {
        const updatedFirstName = 'test-first-name-UPDATED'
        const updatedLastName = 'test-last-name-UPDATED'

        const response = await server.inject({
            method: 'PUT',
            url: `/users/${testUserCredentials.userId}`,
            auth: {
                strategy: API_AUTH_STATEGY,
                credentials: testUserCredentials,
            },
            payload: {
                firstName: updatedFirstName,
                lastName: updatedLastName,
            },
        })
        expect(response.statusCode).toEqual(200)
        const user = JSON.parse(response.payload)
        expect(user.firstName).toEqual(updatedFirstName)
        expect(user.lastName).toEqual(updatedLastName)
    })

    test('delete user fails with invalid userId parameter', async () => {
        const response = await server.inject({
            method: 'DELETE',
            url: `/users/aa22`,
            auth: {
                strategy: API_AUTH_STATEGY,
                credentials: testUserCredentials,
            },
        })
        expect(response.statusCode).toEqual(400)
    })

    test('delete user', async () => {
        const response = await server.inject({
            method: 'DELETE',
            url: `/users/${testUserCredentials.userId}`,
            auth: {
                strategy: API_AUTH_STATEGY,
                credentials: testUserCredentials,
            },
        })
        expect(response.statusCode).toEqual(204)
    })
})
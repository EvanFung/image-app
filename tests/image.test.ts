import { API_AUTH_STATEGY } from '../src/plugins/auth'
import { createServer } from '../src/server'
import Hapi, { AuthCredentials } from '@hapi/hapi'
import { createUserCredentials } from './test-helpers'
import fs from 'fs'
import path from 'path'

describe('images endpoints', () => {
    let server: Hapi.Server
    let testUserCredentials: AuthCredentials
    let testAdminCredentials: AuthCredentials
    let imageId: number
    let testImageUrl: string

    beforeAll(async () => {
        server = await createServer()
        testUserCredentials = await createUserCredentials(server.app.prisma, false)
        testAdminCredentials = await createUserCredentials(server.app.prisma, true)
    })

    afterAll(async () => {
        await server.stop()
    })

    test('create image', async () => {
        // Assuming you have some test image file to send
        // const file = fs.createReadStream(path.resolve(__dirname, 'test-image.png'))

        // const response = await server.inject({
        //     method: 'POST',
        //     url: '/images',
        //     auth: {
        //         strategy: API_AUTH_STATEGY,
        //         credentials: testUserCredentials,
        //     },
        //     payload: {
        //         image: file
        //     },
        // })

        // expect(response.statusCode).toEqual(201)
        // testImageUrl = response.payload
    })

    // test('get image returns 404 for non existant image', async () => {
    //     const response = await server.inject({
    //         method: 'GET',
    //         url: '/images/9999',
    //         auth: {
    //             strategy: API_AUTH_STATEGY,
    //             credentials: testUserCredentials,
    //         },
    //     })

    //     expect(response.statusCode).toEqual(404)
    // })

    // test('get image returns image', async () => {
    //     const response = await server.inject({
    //         method: 'GET',
    //         url: `/images/${imageId}`,
    //         auth: {
    //             strategy: API_AUTH_STATEGY,
    //             credentials: testUserCredentials,
    //         },
    //     })
    //     expect(response.statusCode).toEqual(200)
    //     const image = JSON.parse(response.payload)

    //     expect(image.id).toBe(imageId)
    //     expect(image.imageUrl).toBe(testImageUrl)
    // })

    // test('get all user images', async () => {
    //     const response = await server.inject({
    //         method: 'GET',
    //         url: '/images',
    //         auth: {
    //             strategy: API_AUTH_STATEGY,
    //             credentials: testUserCredentials,
    //         },
    //     })
    //     expect(response.statusCode).toEqual(200)
    //     const images = JSON.parse(response.payload)

    //     // Depending on what your logic is, you might want to check that the image is in the returned array
    //     expect(images).toEqual(expect.arrayContaining([expect.objectContaining({ id: imageId, imageUrl: testImageUrl })]))
    // })

    // test('delete image', async () => {
    //     const response = await server.inject({
    //         method: 'DELETE',
    //         url: `/images/${imageId}`,
    //         auth: {
    //             strategy: API_AUTH_STATEGY,
    //             credentials: testUserCredentials,
    //         },
    //     })
    //     expect(response.statusCode).toEqual(204)
    // })

    // test('delete image returns 404 for non existant image', async () => {
    //     const response = await server.inject({
    //         method: 'DELETE',
    //         url: '/images/9999',
    //         auth: {
    //             strategy: API_AUTH_STATEGY,
    //             credentials: testUserCredentials,
    //         },
    //     })
    //     expect(response.statusCode).toEqual(404)
    // })
})
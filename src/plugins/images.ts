import Hapi from '@hapi/hapi'
import Joi, { required } from 'joi'
import Boom, { boomify } from '@hapi/boom'
import { API_AUTH_STATEGY } from './auth'
import fs from 'fs'
import path from 'path'
import uploadImage from '../services/storage-service'

const imagesPlugin = {
    name: 'app/images',
    dependencies: ['prisma'],
    register: async function (server: Hapi.Server) {
        server.route([
            {
                method: 'POST',
                path: '/images',
                options: {
                    auth: {
                        mode: 'required',
                        strategy: API_AUTH_STATEGY,
                    },
                    payload: {
                        parse: true,
                        allow: 'multipart/form-data',
                        multipart: { output: 'stream' },
                    }
                },
                handler: createImageHandler,
            },
            {
                method: 'GET',
                path: '/images/{imageId}',
                handler: getImageHandler,
                options: {
                    auth: {
                        mode: 'required',
                        strategy: API_AUTH_STATEGY,
                    },
                    validate: {
                        params: Joi.object({
                            imageId: Joi.number().integer(),
                        }),
                        failAction: (request, h, err) => {
                            // show validation errors to user https://github.com/hapijs/hapi/issues/3706
                            throw err
                        },
                    }
                }
            },
            {
                method: 'GET',
                path: '/images',
                handler: getImagesHandler,
                options: {
                    auth: {
                        mode: 'required',
                        strategy: API_AUTH_STATEGY,
                    },
                }
            },
            {
                method: 'DELETE',
                path: '/images/{imageId}',
                handler: deleteImageHandler,
                options: {
                    auth: {
                        mode: 'required',
                        strategy: API_AUTH_STATEGY,
                    },
                    validate: {
                        params: Joi.object({
                            imageId: Joi.number().integer(),
                        }),
                        failAction: (request, h, err) => {
                            // show validation errors to user
                            throw err
                        },
                    },
                }
            }
        ]);
    }
}

export default imagesPlugin


async function createImageHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app
    const { userId } = request.auth.credentials
    const data = request.payload as any
    try {
        if (data['image']) {
            const name = Date.now() + '-' + data['image'].hapi.filename;
            const file = data['image']

            //convert the file stream to a buffer
            let chunks: any[] = []
            for await (const chunk of file) {
                chunks.push(chunk)
            }
            const buffer = Buffer.concat(chunks)
            //upload the image to aws s3 and get the url
            const imageUrl = await uploadImage(buffer, name)
            //create the image in the database
            const result = await prisma.image.create({
                data: {
                    imageUrl: imageUrl,
                    user: {
                        connect: {
                            id: userId
                        }
                    }
                }
            })
            return h.response(imageUrl).code(201)
        }
        return h.response('No image uploaded.').code(400);
    } catch (err: any) {
        request.log(err)
        throw Boom.badImplementation('failed to upload image')
    }

}

async function getImageHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app
    const imageId = parseInt(request.params.imageId, 10)
    try {
        const image = await prisma.image.findUnique({
            where: {
                id: imageId
            },
            include: {
                user: true
            }
        })
        if (!image) {
            return h.response().code(404)
        } else {
            return h.response(image).code(200)
        }
    } catch (err: any) {
        request.log(err)
        throw Boom.badImplementation('failed to get image')
    }
}

//get all images for a user
async function getImagesHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app
    const { userId } = request.auth.credentials

    try {
        const images = await prisma.image.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                imageUrl: true,
            }
        })
        if (!images) {
            return h.response().code(404)
        }
        return h.response(images).code(200)
    } catch (err: any) {
        request.log('error', err)
        return Boom.badImplementation('failed to get images')
    }
}

//delete an image
async function deleteImageHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app
    const imageId = parseInt(request.params.imageId, 10)

    try {
        await prisma.image.delete({
            where: {
                id: imageId,
            }
        });
        return h.response().code(204)
    }
    catch (err: any) {
        request.log('error', err)
        return Boom.badImplementation('failed to delete image')
    }

}
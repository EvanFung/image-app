import Hapi from '@hapi/hapi'
import de from 'date-fns/locale/de';
import Joi from 'joi'
import Boom from '@hapi/boom'
import { API_AUTH_STATEGY } from './auth'

const usersPlugin = {
    name: 'app/users',
    dependencies: ['prisma'],
    register: async function (server: Hapi.Server) {
        server.route([
            {
                method: 'POST',
                path: '/users',
                handler: createUserHandler,
                options: {
                    validate: {
                        payload: createUserValidator,
                        failAction: (request, h, err) => {
                            // show validation errors to user https://github.com/hapijs/hapi/issues/3706
                            throw err
                        },
                    }
                }
            },
            {
                method: 'GET',
                path: '/users/{userId}',

                handler: getUserHandler,
                options: {
                    pre: [isRequestedUserOrAdmin],
                    auth: {
                        mode: 'required',
                        strategy: API_AUTH_STATEGY,
                    },
                    validate: {
                        params: Joi.object({
                            userId: Joi.number().integer(),
                        }),
                    }
                }
            },
            {
                method: 'DELETE',
                path: '/users/{userId}',
                handler: deleteUserHandler,
                options: {
                    validate: {
                        params: Joi.object({
                            userId: Joi.number().integer(),
                        }),
                    },
                },
            },
            {
                method: 'PUT',
                path: '/users/{userId}',
                handler: updateUserHandler,
                options: {
                    validate: {
                        params: Joi.object({
                            userId: Joi.number().integer(),
                        }),
                        payload: updateUserValidator,
                    },
                }
            },


        ]);
    }
}

export default usersPlugin;

const userInputValidator = Joi.object({
    firstName: Joi.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    lastName: Joi.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    email: Joi.string()
        .email()
        .alter({
            create: (schema) => schema.required(),
            update: (schema) => schema.optional(),
        }),
})

const createUserValidator = userInputValidator.tailor('create')
const updateUserValidator = userInputValidator.tailor('update')

interface UserInput {
    email: string
    firstName: string,
    lastName: string,
}

async function createUserHandler(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit,
) {
    const { prisma } = request.server.app
    const payload = request.payload as UserInput

    try {
        const createdUser = await prisma.user.create({
            data: {
                firstName: payload.firstName,
                lastName: payload.lastName,
                email: payload.email,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },

        })
        return h.response(createdUser).code(201)
    } catch (err) {
        // request.log('error', err)
        return Boom.badImplementation('failed to create user')
    }
}


async function getUserHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app
    const userId = parseInt(request.params.userId, 10)

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
        })
        if (!user) {
            return h.response().code(404)
        } else {
            return h.response(user).code(200)
        }
    } catch (err: any) {
        request.log('error', err)
        return Boom.badImplementation('failed to get user')
    }
}


async function deleteUserHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app
    const userId = parseInt(request.params.userId, 10)

    try {
        await prisma.user.delete({
            where: {
                id: userId,
            },
        })
        return h.response().code(204)
    } catch (err) {
        console.log(err)
        return h.response().code(500)
    }
}


async function updateUserHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app
    const userId = parseInt(request.params.userId, 10)
    const payload = request.payload as Partial<UserInput>

    try {
        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: payload,
        })
        return h.response(updatedUser).code(200)
    } catch (err: any) {
        request.log('error', err)
        return Boom.badImplementation('failed to update user')
    }
}


// Pre-function to check if the authenticated user matches the requested user
export async function isRequestedUserOrAdmin(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    // 👇 userId and isAdmin are populated by the `validateAPIToken` function
    const { userId, isAdmin } = request.auth.credentials

    if (isAdmin) {
        // If the user is an admin allow
        return h.continue
    }

    const requestedUserId = parseInt(request.params.userId, 10)

    // 👇 Check that the requested userId matches the authenticated userId
    if (requestedUserId === userId) {
        return h.continue
    }

    // The authenticated user is not authorized
    throw Boom.forbidden()
}
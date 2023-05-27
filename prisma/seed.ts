import { PrismaClient } from '@prisma/client'
import { add } from 'date-fns'
// Instantiate Prisma Client
const prisma = new PrismaClient()

async function main() {
    await prisma.token.deleteMany({})
    await prisma.user.deleteMany({})
    const evan = await prisma.user.create({
        data: {
            email: 'evan@abc.com',
            username: 'evan',
        }
    })
}

main()
    .catch((e: Error) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
import {
  PrismaClient,
  Role,
  BookCondition,
  MovementType,
  ExchangeStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Crear usuarios con wallets anidadas
  const user1 = await prisma.user.create({
    data: {
      name: 'Angela',
      email: 'angela@example.com',
      password: '1234', // Recuerda hashearlo en prod
      role: Role.USER,
      wallet: {
        create: {
          balance: 50,
        },
      },
    },
    include: { wallet: true }, // incluir wallet para obtener wallet.id
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Carlos',
      email: 'carlos@example.com',
      password: '1234',
      role: Role.USER,
      wallet: {
        create: {
          balance: 30,
        },
      },
    },
    include: { wallet: true },
  });

  // 2. Crear libros
  const book1 = await prisma.book.create({
    data: {
      title: '1984',
      author: 'George Orwell',
      isbn: '9780451524935',
      description: 'Distopía clásica sobre vigilancia y control.',
      imageUrl: 'https://example.com/1984.jpg',
      condition: BookCondition.GOOD,
      price: 10,
      location: 'Tarragona',
      owner: {
        connect: { id: user1.id },
      },
    },
  });

  const book2 = await prisma.book.create({
    data: {
      title: 'El Principito',
      author: 'Antoine de Saint-Exupéry',
      isbn: '9780156012195',
      description: 'Un cuento filosófico para todas las edades.',
      imageUrl: 'https://example.com/principito.jpg',
      condition: BookCondition.FAIR,
      price: 10,
      location: 'Tarragona',
      owner: {
        connect: { id: user2.id },
      },
    },
  });

  // 3. Crear movimientos de Bookis (usando wallet.id que ya tenemos)
  await prisma.movement.createMany({
    data: [
      {
        walletId: user1.wallet.id,
        amount: 50,
        type: MovementType.INCOME,
        reason: 'Saldo inicial',
      },
      {
        walletId: user2.wallet.id,
        amount: 30,
        type: MovementType.INCOME,
        reason: 'Saldo inicial',
      },
    ],
  });

  // 4. Simular un intercambio (pendiente)
  await prisma.exchange.create({
    data: {
      bookId: book2.id,
      senderId: user2.id,
      receiverId: user1.id,
      status: ExchangeStatus.PENDING,
    },
  });

  console.log(`✅ Seed completado:
- Usuarios: ${user1.email}, ${user2.email}
- Libros: ${book1.title}, ${book2.title}
- Intercambio creado entre ${user2.name} y ${user1.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export async function load() {
  return {
    users: [
      {
        id: 1,
        name: 'Bob',
        email: 'bob@bob.com',
        forbidden: [2],
      },
      {
        id: 2,
        name: 'Alice',
        email: 'alice@bob.com',
        forbidden: [3],
      },
      {
        id: 3,
        name: 'Charlie',
        email: 'charlie@bob.com',
        forbidden: [2],
      },
      {
        id: 4,
        name: 'Daniel',
        email: 'daniel@bob.com',
        forbidden: [1],
      },
    ],
  };
}

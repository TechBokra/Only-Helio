import { seedDatabase } from '../services/seeder';

console.log('🚀 Initializing Database Seed...');

seedDatabase()
    .then((message) => {
        console.log(message);
        console.log('✨ Database seeding process completed successfully.');
        (process as any).exit(0);
    })
    .catch((error) => {
        console.error('❌ Database seeding failed:', error);
        (process as any).exit(1);
    });
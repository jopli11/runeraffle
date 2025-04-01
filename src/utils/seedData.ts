import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { firebaseConfig } from '../config/firebase';

export async function seedDatabase() {
    console.log('Starting database seeding...');

    try {
        // Initialize Firebase if it's not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        const db = firebase.firestore();

        // Add some users
        const users = [
            {
                email: 'admin@example.com',
                displayName: 'Admin User',
                credits: 1000,
                isAdmin: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                email: 'user@example.com',
                displayName: 'Regular User',
                credits: 100,
                isAdmin: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        // Add some competitions
        const competitions = [
            {
                title: 'OSRS Gold Giveaway',
                description: 'Win 10M OSRS gold!',
                prize: '10M OSRS Gold',
                prizeValue: '5 USD',
                ticketPrice: 10,
                totalTickets: 100,
                ticketsSold: 25,
                difficulty: 'easy',
                status: 'active',
                image: 'https://example.com/gold.jpg',
                createdAt: new Date(),
                updatedAt: new Date(),
                endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            },
            {
                title: 'Rare Item Competition',
                description: 'Win a Dragon Warhammer!',
                prize: 'Dragon Warhammer',
                prizeValue: '25 USD',
                ticketPrice: 25,
                totalTickets: 200,
                ticketsSold: 50,
                difficulty: 'medium',
                status: 'active',
                image: 'https://example.com/dwh.jpg',
                createdAt: new Date(),
                updatedAt: new Date(),
                endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
            },
            {
                title: 'Completed Competition',
                description: 'This competition has ended',
                prize: 'Abyssal Whip',
                prizeValue: '10 USD',
                ticketPrice: 15,
                totalTickets: 50,
                ticketsSold: 50,
                difficulty: 'easy',
                status: 'completed',
                image: 'https://example.com/whip.jpg',
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
                updatedAt: new Date(),
                endsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                winnerId: 'user@example.com',
                winningTicket: 42,
                drawSeed: 'abcdef1234567890',
                verificationHash: 'hash123456789'
            }
        ];

        // Add users to Firestore
        for (const user of users) {
            await db.collection('users').doc(user.email).set(user);
            console.log(`Added user: ${user.email}`);
        }

        // Add competitions to Firestore
        for (const competition of competitions) {
            await db.collection('competitions').add(competition);
            console.log(`Added competition: ${competition.title}`);
        }

        console.log('Database seeding completed successfully!');
        return true;
    } catch (error) {
        console.error('Error seeding database:', error);
        return false;
    }
} 
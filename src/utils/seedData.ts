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
                createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
                updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
            },
            {
                email: 'user@example.com',
                displayName: 'Regular User',
                credits: 100,
                isAdmin: false,
                createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
                updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
            },
            {
                email: 'player1@example.com',
                displayName: 'Lucky Player',
                credits: 250,
                isAdmin: false,
                createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
                updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
            },
            {
                email: 'player2@example.com',
                displayName: 'Big Winner',
                credits: 500,
                isAdmin: false,
                createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
                updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
            }
        ];

        // Common competition images
        const competitionImages = [
            'https://oldschool.runescape.wiki/images/Dragon_claws_detail.png',
            'https://oldschool.runescape.wiki/images/Abyssal_whip_detail.png',
            'https://oldschool.runescape.wiki/images/Twisted_bow_detail.png',
            'https://oldschool.runescape.wiki/images/3rd_age_platebody_detail.png',
            'https://oldschool.runescape.wiki/images/Bandos_chestplate_detail.png',
            'https://oldschool.runescape.wiki/images/Dragon_warhammer_detail.png',
            'https://oldschool.runescape.wiki/images/Saradomin_godsword_detail.png',
            'https://oldschool.runescape.wiki/images/Elder_maul_detail.png',
            'https://oldschool.runescape.wiki/images/Ancestral_robe_top_detail.png',
            'https://oldschool.runescape.wiki/images/Scythe_of_vitur_%28uncharged%29_detail.png'
        ];

        // Add some active competitions
        const activeCompetitions = [
            {
                title: 'OSRS Gold Giveaway',
                description: 'Win 10M OSRS gold! This competition is perfect for players looking to boost their wealth with some easy gold.',
                prize: '10M OSRS Gold',
                prizeValue: '5 USD',
                imageUrl: 'https://oldschool.runescape.wiki/images/Gold_coin_10000.png',
                ticketPrice: 10,
                totalTickets: 100,
                ticketsSold: 25,
                difficulty: 'easy',
                status: 'active',
                createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
                updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
                endsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days from now
            },
            {
                title: 'Dragon Warhammer Giveaway',
                description: 'Win a Dragon Warhammer, one of the most sought-after weapons for PvM content!',
                prize: 'Dragon Warhammer',
                prizeValue: '25 USD',
                imageUrl: competitionImages[5],
                ticketPrice: 25,
                totalTickets: 200,
                ticketsSold: 50,
                difficulty: 'medium',
                status: 'active',
                createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
                updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
                endsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)) // 14 days from now
            },
            {
                title: 'Twisted Bow Challenge',
                description: 'The ultimate OSRS prize - win a Twisted Bow, the most powerful ranged weapon in the game!',
                prize: 'Twisted Bow',
                prizeValue: '100 USD',
                imageUrl: competitionImages[2],
                ticketPrice: 50,
                totalTickets: 500,
                ticketsSold: 125,
                difficulty: 'hard',
                status: 'active',
                createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
                updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
                endsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)) // 21 days from now
            },
            {
                title: '3rd Age Armor Set',
                description: 'Show off your wealth with this ultra-rare 3rd Age armor set!',
                prize: '3rd Age Full Armor Set',
                prizeValue: '75 USD',
                imageUrl: competitionImages[3],
                ticketPrice: 40,
                totalTickets: 300,
                ticketsSold: 89,
                difficulty: 'hard',
                status: 'active',
                createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
                updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
                endsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)) // 10 days from now
            },
            {
                title: 'Bandos Armor Giveaway',
                description: 'Win the complete Bandos armor set, perfect for melee training and bossing!',
                prize: 'Full Bandos Armor Set',
                prizeValue: '30 USD',
                imageUrl: competitionImages[4],
                ticketPrice: 20,
                totalTickets: 150,
                ticketsSold: 62,
                difficulty: 'medium',
                status: 'active',
                createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
                updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
                endsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)) // 5 days from now
            }
        ];

        // Add some completed competitions with winners
        const completedCompetitions = [
            {
                title: 'Abyssal Whip Giveaway',
                description: 'This competition has ended. The winner received an Abyssal Whip!',
                prize: 'Abyssal Whip',
                prizeValue: '10 USD',
                imageUrl: competitionImages[1],
                ticketPrice: 15,
                totalTickets: 50,
                ticketsSold: 50,
                difficulty: 'easy',
                status: 'complete',
                createdAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)), // 14 days ago
                updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
                endsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // 7 days ago
                completedAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
                winner: {
                    userId: 'user@example.com',
                    username: 'Regular User',
                    email: 'user@example.com'
                },
                seed: 'abcdef1234567890',
                blockHash: 'block123456789',
                winningTicket: 42
            },
            {
                title: 'Dragon Claws Competition',
                description: 'This competition has ended. The winner received Dragon Claws!',
                prize: 'Dragon Claws',
                prizeValue: '40 USD',
                imageUrl: competitionImages[0],
                ticketPrice: 35,
                totalTickets: 200,
                ticketsSold: 198,
                difficulty: 'hard',
                status: 'complete',
                createdAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
                updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
                endsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)), // 15 days ago
                completedAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)),
                winner: {
                    userId: 'player1@example.com',
                    username: 'Lucky Player',
                    email: 'player1@example.com'
                },
                seed: 'lucky123456789',
                blockHash: 'block987654321',
                winningTicket: 137
            },
            {
                title: 'Saradomin Godsword Raffle',
                description: 'This competition has ended. The winner received a Saradomin Godsword!',
                prize: 'Saradomin Godsword',
                prizeValue: '20 USD',
                imageUrl: competitionImages[6],
                ticketPrice: 20,
                totalTickets: 100,
                ticketsSold: 100,
                difficulty: 'medium',
                status: 'complete',
                createdAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)), // 21 days ago
                updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
                endsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)), // 10 days ago
                completedAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
                winner: {
                    userId: 'player2@example.com',
                    username: 'Big Winner',
                    email: 'player2@example.com'
                },
                seed: 'winner987654321',
                blockHash: 'block555666777',
                winningTicket: 73
            },
            {
                title: 'Elder Maul Giveaway',
                description: 'This competition has ended. The winner received an Elder Maul!',
                prize: 'Elder Maul',
                prizeValue: '35 USD',
                imageUrl: competitionImages[7],
                ticketPrice: 30,
                totalTickets: 150,
                ticketsSold: 142,
                difficulty: 'medium',
                status: 'complete',
                createdAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)), // 45 days ago
                updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
                endsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
                completedAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
                winner: {
                    userId: 'player1@example.com',
                    username: 'Lucky Player',
                    email: 'player1@example.com'
                },
                seed: 'maul123456789',
                blockHash: 'block444555666',
                winningTicket: 89
            },
            {
                title: 'Ancestral Robes Competition',
                description: 'This competition has ended. The winner received Ancestral Robes!',
                prize: 'Ancestral Robes Set',
                prizeValue: '60 USD',
                imageUrl: competitionImages[8],
                ticketPrice: 45,
                totalTickets: 250,
                ticketsSold: 243,
                difficulty: 'hard',
                status: 'complete',
                createdAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)), // 60 days ago
                updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
                endsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)), // 45 days ago
                completedAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)),
                winner: {
                    userId: 'player2@example.com',
                    username: 'Big Winner',
                    email: 'player2@example.com'
                },
                seed: 'robes987654321',
                blockHash: 'block111222333',
                winningTicket: 175
            }
        ];

        // Combine all competitions
        const competitions = [...activeCompetitions, ...completedCompetitions];

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

        // Create tickets for the completed competitions
        for (const competition of completedCompetitions) {
            const competitionRef = await db.collection('competitions').where('title', '==', competition.title).get();
            
            if (!competitionRef.empty) {
                const competitionId = competitionRef.docs[0].id;
                
                // Add winning ticket for the winner
                await db.collection('tickets').add({
                    competitionId: competitionId,
                    userId: competition.winner.userId,
                    purchasedAt: competition.completedAt,
                    ticketNumber: competition.winningTicket,
                    isWinner: true
                });
                
                console.log(`Added winning ticket for competition: ${competition.title}`);
                
                // Add some random tickets for other users to populate the ticket history
                const userIds = users.map(user => user.email);
                
                for (let i = 0; i < Math.min(competition.ticketsSold - 1, 10); i++) {
                    // Select a random user, but not the winner
                    let randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
                    while (randomUserId === competition.winner.userId) {
                        randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
                    }
                    
                    // Generate a random ticket number that's not the winning number
                    let ticketNumber = Math.floor(Math.random() * competition.totalTickets) + 1;
                    while (ticketNumber === competition.winningTicket) {
                        ticketNumber = Math.floor(Math.random() * competition.totalTickets) + 1;
                    }
                    
                    await db.collection('tickets').add({
                        competitionId: competitionId,
                        userId: randomUserId,
                        purchasedAt: firebase.firestore.Timestamp.fromDate(new Date(competition.completedAt.toDate().getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random time before completion
                        ticketNumber: ticketNumber,
                        isWinner: false
                    });
                }
                
                console.log(`Added ${Math.min(competition.ticketsSold - 1, 10)} random tickets for competition: ${competition.title}`);
            }
        }

        console.log('Database seeding completed successfully!');
        return true;
    } catch (error) {
        console.error('Error seeding database:', error);
        return false;
    }
} 
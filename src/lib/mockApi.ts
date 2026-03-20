import { SEED_ACTIVITIES, Activity } from '@/data/activities';
import { User, UserType } from '@/contexts/AuthContext';
import { Ticket } from '@/contexts/TicketStoreContext';

const USERS_KEY = 'dooble_demo_users';
const ACTIVITIES_KEY = 'dooble_demo_activities';
const TICKETS_KEY = 'dooble_demo_tickets';

// Seed demo users
const initUsers = () => {
    const defaultUsers: User[] = [
        { id: '1', email: 'funny@email.com', type: 'visitor' },
        { id: '2', email: 'mail@chalmers.com', type: 'company', companyName: 'Demo Provider' },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
};

// Seed demo tickets for funny@email.com (userId:'1')
const SEED_TICKETS: Ticket[] = [
    // Past – museum visit → archived activity 901, availableUntil 2025-11-30 (past)
    {
        ticketId: 'demo-ticket-001',
        userId: '1',
        activityId: '901',
        activityTitle: 'Röhsska Museum Visit',
        companyName: 'Röhsska Museet',
        purchasedAt: '2025-11-15T10:00:00.000Z',
        quantity: 2,
        totalPaid: 120,
        qrCodeData: 'QR-DEMO001MUSEUM',
        status: 'Used',
    },
    // Past – seafood brunch → archived activity 902, availableUntil 2025-10-31 (past)
    {
        ticketId: 'demo-ticket-002',
        userId: '1',
        activityId: '902',
        activityTitle: 'West Coast Seafood Brunch',
        companyName: 'Kajutan GBG',
        purchasedAt: '2025-10-01T09:00:00.000Z',
        quantity: 1,
        totalPaid: 395,
        qrCodeData: 'QR-DEMO002SEAFOOD',
        status: 'Used',
    },
    // Past – yoga → archived activity 903, availableUntil 2025-09-30 (past)
    {
        ticketId: 'demo-ticket-003',
        userId: '1',
        activityId: '903',
        activityTitle: 'Morning Yoga by the Sea',
        companyName: 'Yoga Gothenburg',
        purchasedAt: '2025-09-10T07:30:00.000Z',
        quantity: 1,
        totalPaid: 0,
        qrCodeData: 'QR-DEMO003YOGA',
        status: 'Used',
    },
    // Upcoming – Liseberg Amusement Park → id '1', availableUntil 2026-09-30 (future)
    {
        ticketId: 'demo-ticket-004',
        userId: '1',
        activityId: '1',
        activityTitle: 'Liseberg Amusement Park',
        companyName: 'Liseberg AB',
        purchasedAt: '2026-02-14T12:00:00.000Z',
        quantity: 2,
        totalPaid: 790,
        qrCodeData: 'QR-DEMO004LISEBERG',
        status: 'Valid',
    },
];

const initTickets = (): Ticket[] => {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(SEED_TICKETS));
    return SEED_TICKETS;
};

// Demo mock backend
export class MockBackend {
    static get users(): User[] {
        const data = localStorage.getItem(USERS_KEY);
        if (!data) return initUsers();
        return JSON.parse(data);
    }

    static get activities(): Activity[] {
        const data = localStorage.getItem(ACTIVITIES_KEY);
        if (!data) {
            localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(SEED_ACTIVITIES));
            return SEED_ACTIVITIES;
        }
        return JSON.parse(data);
    }

    static set activities(acts: Activity[]) {
        localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(acts));
    }

    static get tickets(): Ticket[] {
        const data = localStorage.getItem(TICKETS_KEY);
        if (!data) return initTickets();
        return JSON.parse(data);
    }

    static set tickets(tix: Ticket[]) {
        localStorage.setItem(TICKETS_KEY, JSON.stringify(tix));
    }

    // Handlers
    static async handleGet(endpoint: string) {
        if (endpoint === '/auth/me') {
            const token = localStorage.getItem('token');
            if (!token) throw new Error(JSON.stringify({ message: 'Unauthorized' }));
            const user = this.users.find(u => u.email === token);
            if (!user) throw new Error(JSON.stringify({ message: 'User not found' }));
            return { id: user.id, email: user.email, role: user.type, companyName: user.companyName };
        }
        if (endpoint === '/activities') {
            return this.activities;
        }
        if (endpoint === '/tickets') {
            const token = localStorage.getItem('token');
            const currentUser = this.users.find(u => u.email === token);
            return this.tickets.filter(t => t.userId === currentUser?.id);
        }
        throw new Error(`Unhandled GET endpoint: ${endpoint}`);
    }

    static async handlePost(endpoint: string, body: any) {
        if (endpoint === '/auth/login') {
            if (body.password !== '123456') {
                throw new Error(JSON.stringify({ message: 'Invalid password. (Use 123456 for demo)' }));
            }
            const user = this.users.find(u => u.email === body.email);
            if (!user) {
                // For demo friendliness, create the user if it doesn't exist
                const newUser: User = {
                    id: String(Date.now()),
                    email: body.email,
                    type: 'visitor'
                };
                const users = this.users;
                users.push(newUser);
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
                return { token: newUser.email, user: { ...newUser, role: newUser.type } };
            }
            return { token: user.email, user: { ...user, role: user.type } };
        }
        if (endpoint === '/auth/signup') {
            const users = this.users;
            if (users.find(u => u.email === body.email)) {
                throw new Error(JSON.stringify({ message: 'User already exists' }));
            }
            const newUser: User = {
                id: String(Date.now()),
                email: body.email,
                type: body.role,
                companyName: body.companyName
            };
            users.push(newUser);
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            return { token: newUser.email, user: { ...newUser, role: newUser.type } };
        }
        if (endpoint === '/activities') {
            const acts = this.activities;
            const newAct = {
                ...body,
                id: String(Date.now()), // Just a string ID generator
                status: 'active'
            } as Activity;
            acts.push(newAct);
            this.activities = acts;
            return newAct;
        }
        if (endpoint === '/tickets') {
            const token = localStorage.getItem('token');
            const currentUser = this.users.find(u => u.email === token);
            const tix = this.tickets;
            const newTicket = {
                ...body,
                ticketId: String(Date.now()),
                userId: currentUser?.id || 'guest',
                purchasedAt: new Date().toISOString()
            };
            tix.push(newTicket);
            this.tickets = tix;
            return newTicket;
        }
        throw new Error(`Unhandled POST endpoint: ${endpoint}`);
    }

    static async handlePatch(endpoint: string, body: any) {
        if (endpoint.startsWith('/activities/')) {
            const id = endpoint.split('/')[2];
            const acts = this.activities;
            const index = acts.findIndex(a => String(a.id) === id);
            if (index > -1) {
                acts[index] = { ...acts[index], ...body };
                this.activities = acts;
                return acts[index];
            }
            throw new Error('Activity not found');
        }
        throw new Error(`Unhandled PATCH endpoint: ${endpoint}`);
    }

    static async handleDelete(endpoint: string, body?: any) {
        throw new Error(`Unhandled DELETE endpoint: ${endpoint}`);
    }

    static async handleUpload(file: File): Promise<string> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            if (file) {
                reader.readAsDataURL(file);
            } else {
                resolve('/test-upload.jpg');
            }
        });
    }
}

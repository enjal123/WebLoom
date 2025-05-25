require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Accept']
}));
app.use(bodyParser.json());
app.use(express.static('public'));

// Log environment variables (for debugging)
console.log('Database Configuration:');
console.log({
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'webloom',
    user: process.env.PG_USER || 'postgres',
    port: process.env.PG_PORT || 5432
});

// PostgreSQL connection
const pool = new Pool({
    user: process.env.PG_USER || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'webloom',
    password: process.env.PG_PASSWORD || 'postgres',
    port: parseInt(process.env.PG_PORT) || 5432
});

// Test database connection and verify table structure
async function initializeDatabase() {
    try {
        // Test connection
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL database');
        
        // Verify table exists and has correct structure
        const tableCheck = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        
        console.log('Table structure:', tableCheck.rows);
        
        // Create table if it doesn't exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                response TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        await client.query(createTableQuery);
        console.log('Users table verified/created');
        
        client.release();
    } catch (err) {
        console.error('Database initialization error:', err);
        process.exit(1);
    }
}

// Initialize database
initializeDatabase();

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// POST route for form submission
app.post('/submit', async (req, res) => {
    console.log('Received form submission:', req.body);
    
    const { name, email, response } = req.body;

    // Validate required fields
    if (!name || !email || !response) {
        console.log('Missing required fields:', { name, email, response });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO users(name, email, response) VALUES($1, $2, $3) RETURNING *';
    
    try {
        console.log('Executing query:', query, 'with values:', [name, email, response]);
        const result = await pool.query(query, [name, email, response]);
        console.log('Query result:', result.rows[0]);
        res.status(201).json({
            message: 'Form submitted successfully',
            user: result.rows[0]
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ 
            error: 'Error saving data to database',
            details: err.message 
        });
    }
});

// GET route to fetch all users (for testing)
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        console.log('Fetched users:', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Test endpoint to verify database connection
app.get('/test', async (req, res) => {
    try {
        // Try to insert a test record
        const testQuery = 'INSERT INTO users(name, email, response) VALUES($1, $2, $3) RETURNING *';
        const testResult = await pool.query(testQuery, ['Test User', 'test@example.com', 'Test message']);
        
        // Get all records
        const allUsers = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        
        res.json({
            message: 'Database test successful',
            inserted: testResult.rows[0],
            allUsers: allUsers.rows
        });
    } catch (err) {
        console.error('Test error:', err);
        res.status(500).json({ 
            error: 'Test failed',
            details: err.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

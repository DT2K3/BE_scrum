const express = require("express");
const cors = require("cors");
const mysql = require("mysql");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'scrum',
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection failed: ' + err.message);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Define your API routes here

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// Example route to check MySQL connection status
app.get('/check-connection', (req, res) => {
    if (db.state === 'authenticated') {
        res.json({ message: 'MySQL connection is established' });
    } else {
        res.json({ message: 'MySQL connection is not established' });
    }
});

app.post('/signup', (req, res) => {
    // Validate inputs
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: 'Password hashing error' });
        }

        // Check if the email already exists
        db.query('SELECT * FROM login WHERE email = ?', [email], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length > 0) {
                return res.status(400).json({ error: 'Email already in use' });
            }

            // Insert the new user
            db.query('INSERT INTO login (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hash, role], (err, data) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                return res.status(201).json({ message: 'User registration successful' });
            });
        });
    });
});

// Add a testing route to retrieve all data from the "signup" table
app.get('/users', (req, res) => {
    db.query('SELECT * FROM user', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        return res.status(200).json(results);
    });
});
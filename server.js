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

// Định nghĩa tuyến dẫn API để lấy tất cả các dự án
app.get('/cl/projects', (req, res) => {
    // Sử dụng truy vấn SQL để lấy tất cả các dự án
    const sql = 'SELECT * FROM Project';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            res.status(500).json({ error: 'Failed to fetch projects.' });
        } else {
            res.json(results);
        }
    });
});


app.post('/cl/projects', (req, res) => {
    const projectData = req.body;
    const sql = 'INSERT INTO Project (IDProject, Project_Name, Description, Quantity, BeginDate, EndDate, Address, Photo, UserID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    const values = [
        projectData.IDProject,
        projectData.Project_Name,
        projectData.Description,
        projectData.Quantity,
        projectData.BeginDate,
        projectData.EndDate,
        projectData.Address,
        projectData.Photo,
        projectData.UserID
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting project:', err);
            res.status(500).json({ error: 'Failed to create a new project.' });
        } else {
            res.status(201).json({ message: 'Project created successfully.' });
        }
    });
});

app.delete('/cl/projects/:id', (req, res) => {
    const projectId = req.params.id;
    const sql = 'DELETE FROM Project WHERE IDProject = ?';

    db.query(sql, [projectId], (err, result) => {
        if (err) {
            console.error('Error deleting project:', err);
            res.status(500).json({ error: 'Failed to delete the project.' });
        } else {
            res.json({ message: 'Project deleted successfully.' });
        }
    });
});

app.put('/cl/projects/:id', (req, res) => {
    const projectId = req.params.id;
    const projectData = req.body;
    const sql = 'UPDATE Project SET Project_Name = ?, Description = ?, Quantity = ?, BeginDate = ?, EndDate = ?, Address = ?, Photo = ?, UserID = ? WHERE IDProject = ?';

    const values = [
        projectData.Project_Name,
        projectData.Description,
        projectData.Quantity,
        projectData.BeginDate,
        projectData.EndDate,
        projectData.Address,
        projectData.Photo,
        projectData.UserID,
        projectId
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating project:', err);
            res.status(500).json({ error: 'Failed to update the project.' });
        } else {
            res.json({ message: 'Project updated successfully.' });
        }
    });
});







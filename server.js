const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => res.send('API is running'));

// --- AUTH ENDPOINT ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query(
            'SELECT staff_id, first_name, last_name, email, position FROM Staff WHERE email = ? AND password = ?',
            [email, password]
        );
        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// (a) Hall managers report
app.get('/api/reports/hall-managers', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT h.hall_name, s.staff_id, s.first_name, s.last_name, s.phone
            FROM Hall h
            JOIN Staff s ON h.manager_id = s.staff_id
            ORDER BY h.hall_name
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// (b) Student leases report
app.get('/api/reports/student-leases', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.first_name, s.last_name, s.banner_id, l.lease_id, l.start_date, l.end_date, l.semester
            FROM Student s
            JOIN Lease l ON s.banner_id = l.banner_id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// (c) Summer leases report
app.get('/api/reports/summer-leases', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT * FROM Lease WHERE semester = 'Summer'
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// (d) Total rent paid by all students
app.get('/api/reports/total-rent', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.banner_id, s.first_name, s.last_name,
                   COUNT(i.invoice_id) AS invoices_paid,
                   SUM(i.amount) AS total_rent_paid
            FROM Student s
            JOIN Lease l ON s.banner_id = l.banner_id
            JOIN Invoice i ON l.lease_id = i.lease_id
            WHERE i.paid_date IS NOT NULL
            GROUP BY s.banner_id, s.first_name, s.last_name
            ORDER BY total_rent_paid DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// (e) Unpaid invoices report by a given date
app.get('/api/reports/unpaid-invoices', async (req, res) => {
    try {
        const { date } = req.query; 
        if (!date) return res.status(400).json({ error: 'Date parameter is required' });
        
        const [rows] = await db.query(`
            SELECT s.banner_id, s.first_name, s.last_name,
                   i.invoice_id, i.amount AS payment_due, i.due_date
            FROM Student s
            JOIN Lease l ON s.banner_id = l.banner_id
            JOIN Invoice i ON l.lease_id = i.lease_id
            WHERE i.paid_date IS NULL AND i.due_date <= ?
            ORDER BY i.due_date ASC
        `, [date]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// (f) Unsatisfactory condition inspections
app.get('/api/reports/unsatisfactory-inspections', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT i.id, i.hall_name, i.date,
                   CONCAT(s.first_name, ' ', s.last_name) AS inspector_name,
                   i.comments
            FROM Inspection i
            JOIN Staff s ON i.staff_id = s.staff_id
            WHERE i.status = FALSE
            ORDER BY i.date DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// (g) Students in a particular hall
app.get('/api/reports/hall-students/:hall_name', async (req, res) => {
    try {
        const { hall_name } = req.params;
        const [rows] = await db.query(`
            SELECT s.banner_id, s.first_name, s.last_name,
                   r.room_no AS room_number, r.place_id AS place_number,
                   r.rent, l.semester
            FROM Student s
            JOIN Lease l ON s.banner_id = l.banner_id
            JOIN Room r ON l.place_id = r.place_id
            WHERE r.hall_name = ?
            ORDER BY r.room_no
        `, [hall_name]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// (h) Waiting list students
app.get('/api/reports/waiting-list', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.banner_id, s.first_name, s.last_name,
                   s.email, s.phone, s.category, s.major, s.nationality
            FROM Student s
            WHERE s.status = 'waiting'
            ORDER BY s.banner_id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// (i) Student count by category
app.get('/api/reports/student-categories', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT category, COUNT(*) as student_count
            FROM Student
            GROUP BY category
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// (j) Missing next-of-kin report
app.get('/api/reports/missing-next-of-kin', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.first_name, s.last_name, s.banner_id
            FROM Student s
            LEFT JOIN NextOfKin n ON s.banner_id = n.banner_id
            WHERE n.banner_id IS NULL
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// (k) Student advisers list
app.get('/api/reports/student-adviser', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.banner_id, s.first_name AS student_first, s.last_name AS student_last, 
                   st.first_name AS adviser_first, st.last_name AS adviser_last, st.phone AS telephone
            FROM Student s
            JOIN Staff st ON s.adviser_id = st.staff_id
            ORDER BY s.banner_id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// (l) Rent statistics report
app.get('/api/reports/rent-stats', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT MIN(rent) as min_rent, MAX(rent) as max_rent, AVG(rent) as avg_rent
            FROM Room
        `);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// (m) Hall places report
app.get('/api/reports/hall-places', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT hall_name, COUNT(*) as total_places
            FROM Room
            GROUP BY hall_name
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Flat students report
app.get('/api/reports/flat-students', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.banner_id, s.first_name, s.last_name,
                   r.room_no, r.hall_name AS flat_name, f.capacity,
                   r.rent, l.semester
            FROM Student s
            JOIN Lease l ON s.banner_id = l.banner_id
            JOIN Room r ON l.place_id = r.place_id
            JOIN Flat f ON r.hall_name = f.flat_name
            ORDER BY r.hall_name, r.room_no
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Flat capacity report
app.get('/api/reports/flat-capacity', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT f.flat_name, f.capacity AS persons_per_unit,
                   COUNT(DISTINCT r.place_id) AS total_units,
                   COUNT(DISTINCT r.place_id) * f.capacity AS total_beds,
                   COUNT(DISTINCT l.banner_id) AS occupied,
                   (COUNT(DISTINCT r.place_id) * f.capacity) - COUNT(DISTINCT l.banner_id) AS available
            FROM Flat f
            JOIN Room r ON f.flat_name = r.hall_name
            LEFT JOIN Lease l ON r.place_id = l.place_id
            GROUP BY f.flat_name, f.capacity
            ORDER BY f.flat_name
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// (n) Senior staff report
app.get('/api/reports/senior-staff', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT staff_id, first_name, last_name, 
                   TIMESTAMPDIFF(YEAR, dob, CURDATE()) AS age, 
                   location
            FROM Staff
            WHERE TIMESTAMPDIFF(YEAR, dob, CURDATE()) > 60
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// All Staff Report
app.get('/api/reports/all-staff', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT staff_id, first_name, last_name, position, department, phone, email, location
            FROM Staff
            ORDER BY staff_id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dynamic Active Percentage Stats
app.get('/api/stats/active-percentage', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM Student WHERE status = 'placed') AS placed_count,
                (
                    SELECT SUM(capacity) FROM (
                        SELECT 1 AS capacity FROM Room r LEFT JOIN Flat f ON r.hall_name = f.flat_name WHERE f.flat_name IS NULL
                        UNION ALL
                        SELECT f.capacity FROM Room r JOIN Flat f ON r.hall_name = f.flat_name
                    ) as cap
                ) AS total_capacity
        `);
        const { placed_count, total_capacity } = rows[0];
        const percentage = total_capacity > 0 ? ((placed_count / total_capacity) * 100).toFixed(0) : 0;
        res.json({ percentage: `${percentage}%` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new Student
app.post('/api/students', async (req, res) => {
    try {
        const { 
            banner_id, first_name, last_name, city, phone, email, dob, gender, category,
            nationality, status, major, minor, adviser_id, course_id, preference
        } = req.body;

        await db.query(`
            INSERT INTO Student (
                banner_id, first_name, last_name, city, phone, email, dob, gender, category,
                nationality, status, preference, major, minor, adviser_id, course_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            banner_id, first_name, last_name, city || null, phone || null, email, dob, gender, category,
            nationality || null, status || 'waiting', preference || null, major || null, minor || null, 
            adviser_id || null, course_id || null
        ]);

        res.status(201).json({ message: 'Student registered successfully', banner_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Inspection
app.post('/api/inspections', async (req, res) => {
    try {
        const { hall_name, staff_id, date, status, comments } = req.body;
        await db.query(`
            INSERT INTO Inspection (hall_name, staff_id, date, status, comments)
            VALUES (?, ?, ?, ?, ?)
        `, [hall_name, staff_id, date, status, comments || null]);
        res.status(201).json({ message: 'Inspection recorded successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Record
app.put('/api/reports/:reportId/:id', async (req, res) => {
    const { reportId, id } = req.params;
    const data = req.body;
    try {
        let tableName = '';
        let idColumn = '';
        let updateData = {};

        if (reportId === 'waiting-list' || reportId === 'missing-next-of-kin') {
            tableName = 'Student'; idColumn = 'banner_id';
            if(data.first_name) updateData.first_name = data.first_name;
            if(data.last_name) updateData.last_name = data.last_name;
            if(data.email) updateData.email = data.email;
        } else if (reportId === 'senior-staff' || reportId === 'hall-managers') {
            tableName = 'Staff'; idColumn = 'staff_id';
            if(data.location) updateData.location = data.location;
            if(data.phone) updateData.phone = data.phone;
        } else if (reportId === 'unsatisfactory-inspections') {
            tableName = 'Inspection'; idColumn = 'id';
            updateData = { comments: data.comments, status: data.status };
        } else if (reportId === 'student-leases' || reportId === 'summer-leases') {
            tableName = 'Lease'; idColumn = 'lease_id';
            if(data.semester) updateData.semester = data.semester;
        }

        if (Object.keys(updateData).length === 0) return res.json({ message: 'No valid fields to update' });
        await db.query(`UPDATE ${tableName} SET ? WHERE ${idColumn} = ?`, [updateData, id]);
        res.json({ message: 'Record updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Record
app.delete('/api/reports/:reportId/:id', async (req, res) => {
    const { reportId, id } = req.params;
    try {
        let tableName = '';
        let idColumn = '';

        if (reportId === 'unsatisfactory-inspections') {
            tableName = 'Inspection'; idColumn = 'id';
        } else {
            return res.status(400).json({ error: 'Delete not supported for this report' });
        }

        await db.query(`DELETE FROM ${tableName} WHERE ${idColumn} = ?`, [id]);
        res.json({ message: 'Record deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => { res.send('University Accommodation API is running'); });
app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`); });

-- University Accommodation Office Management Queries (Corrected a-n)
-- ---------------------------------------------------------
-- These queries correspond exactly to requirements (a) through (n).

USE accommodation_db;

-- (a) Manager name & phone for each hall
SELECT s.first_name, s.last_name, s.phone, h.hall_name
FROM Hall h
JOIN Staff s ON h.manager_id = s.staff_id;

-- (b) Students with lease details
SELECT s.banner_id, s.first_name, s.last_name, l.lease_id, l.semester
FROM Student s
JOIN Lease l ON s.banner_id = l.banner_id;

-- (c) Leases including summer semester
SELECT * FROM Lease WHERE semester = 'Summer';

-- (d) Total rent paid by each student
SELECT s.banner_id, s.first_name, SUM(i.amount) AS total_paid
FROM Student s
JOIN Lease l ON s.banner_id = l.banner_id
JOIN Invoice i ON l.lease_id = i.lease_id
WHERE i.paid_date IS NOT NULL
GROUP BY s.banner_id;

-- (e) Students who have NOT paid invoices
SELECT s.banner_id, s.first_name, i.invoice_id
FROM Student s
JOIN Lease l ON s.banner_id = l.banner_id
JOIN Invoice i ON l.lease_id = i.lease_id
WHERE i.paid_date IS NULL;

-- (f) Unsatisfactory inspections
SELECT * FROM Inspection WHERE status = FALSE;

-- (g) Students with room + place details
SELECT s.banner_id, s.first_name, r.room_no, r.place_id, r.hall_name
FROM Student s
JOIN Lease l ON s.banner_id = l.banner_id
JOIN Room r ON l.place_id = r.place_id;

-- (h) Students on waiting list
SELECT * FROM Student WHERE status = 'waiting';

-- (i) Number of students per category
SELECT category, COUNT(*) AS total_students
FROM Student
GROUP BY category;

-- (j) Students without next-of-kin
SELECT s.banner_id, s.first_name
FROM Student s
LEFT JOIN NextOfKin n ON s.banner_id = n.banner_id
WHERE n.banner_id IS NULL;

-- (k) Adviser details for a student
SELECT s.first_name AS student_name, st.first_name AS adviser_name, st.phone
FROM Student s
JOIN Staff st ON s.adviser_id = st.staff_id
WHERE s.banner_id = 'B1';

-- (l) Min, Max, Avg rent in halls
SELECT MIN(rent) AS min_rent, MAX(rent) AS max_rent, AVG(rent) AS avg_rent
FROM Room;

-- (m) Total number of rooms in each hall
SELECT hall_name, COUNT(*) AS total_rooms
FROM Room
GROUP BY hall_name;

-- (n) Staff over 60 years old
SELECT staff_id, first_name, last_name, TIMESTAMPDIFF(YEAR, dob, CURDATE()) AS age, location
FROM Staff
WHERE TIMESTAMPDIFF(YEAR, dob, CURDATE()) > 60;

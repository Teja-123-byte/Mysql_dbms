-- Schema for University Accommodation Office (Simple, MySQL 8+)
DROP DATABASE IF EXISTS accommodation_db;
CREATE DATABASE accommodation_db;
USE accommodation_db;

-- DROP existing tables in correct order (child then parent)
DROP TABLE IF EXISTS Inspection;
DROP TABLE IF EXISTS Invoice;
DROP TABLE IF EXISTS Lease;
DROP TABLE IF EXISTS Flat;
DROP TABLE IF EXISTS Room;
DROP TABLE IF EXISTS Hall;
DROP TABLE IF EXISTS NextOfKin;
DROP TABLE IF EXISTS Student;
DROP TABLE IF EXISTS Course;
DROP TABLE IF EXISTS Staff;

-- STAFF
CREATE TABLE Staff (
    staff_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    position VARCHAR(50),
    department VARCHAR(50),
    location VARCHAR(50),
    dob DATE,
    password VARCHAR(255) DEFAULT 'staff123'
);

-- COURSE
CREATE TABLE Course (
    course_id VARCHAR(10) PRIMARY KEY,
    title VARCHAR(100),
    instructor VARCHAR(100),
    phone VARCHAR(15),
    email VARCHAR(100),
    room VARCHAR(20),
    department VARCHAR(50)
);

-- STUDENT
CREATE TABLE Student (
    banner_id VARCHAR(10) PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    city VARCHAR(50),
    phone VARCHAR(15),
    email VARCHAR(100) UNIQUE,
    dob DATE,
    gender ENUM('M','F'),
    category VARCHAR(50),
    nationality VARCHAR(50),
    status ENUM('placed','waiting'),
    preference VARCHAR(50) DEFAULT NULL,
    major VARCHAR(50),
    minor VARCHAR(50),
    adviser_id INT,
    course_id VARCHAR(10),
    FOREIGN KEY (adviser_id) REFERENCES Staff(staff_id),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);

-- NEXT OF KIN
CREATE TABLE NextOfKin (
    banner_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100),
    relation VARCHAR(50),
    phone VARCHAR(15),
    FOREIGN KEY (banner_id) REFERENCES Student(banner_id)
);

-- HALL
CREATE TABLE Hall (
    hall_name VARCHAR(50) PRIMARY KEY,
    phone VARCHAR(15),
    manager_id INT,
    FOREIGN KEY (manager_id) REFERENCES Staff(staff_id)
);

-- ROOM
CREATE TABLE Room (
    place_id INT PRIMARY KEY AUTO_INCREMENT,
    room_no VARCHAR(10),
    rent INT,
    hall_name VARCHAR(50),
    FOREIGN KEY (hall_name) REFERENCES Hall(hall_name)
);

-- FLAT (tracks capacity per flat/hall)
CREATE TABLE Flat (
    flat_name VARCHAR(50) PRIMARY KEY,
    capacity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (flat_name) REFERENCES Hall(hall_name)
);

-- LEASE
CREATE TABLE Lease (
    lease_id INT PRIMARY KEY AUTO_INCREMENT,
    banner_id VARCHAR(10),
    place_id INT,
    start_date DATE,
    end_date DATE,
    semester VARCHAR(20),
    FOREIGN KEY (banner_id) REFERENCES Student(banner_id),
    FOREIGN KEY (place_id) REFERENCES Room(place_id)
);

-- INVOICE
CREATE TABLE Invoice (
    invoice_id INT PRIMARY KEY AUTO_INCREMENT,
    lease_id INT,
    amount INT,
    due_date DATE,
    paid_date DATE,
    FOREIGN KEY (lease_id) REFERENCES Lease(lease_id)
);

-- INSPECTION
CREATE TABLE Inspection (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hall_name VARCHAR(50),
    staff_id INT,
    date DATE,
    status BOOLEAN,
    comments TEXT,
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id)
);

import os

students_data = [
    ('B1','Isha','Mehta','Mumbai','9000000001','isha1@student.edu','2004-01-01','M','Undergraduate','India','placed','CSE','Math',6,'CS1'),
    ('B2','Meera','Singh','Hyderabad','9000000002','meera2@student.edu','2004-01-01','M','Undergraduate','India','placed','CSE','Math',10,'CS1'),
    ('B3','Sneha','Rao','Delhi','9000000003','sneha3@student.edu','2004-01-01','M','Undergraduate','India','placed','CSE','Math',9,'CS1'),
    ('B4','Sneha','Mehta','Hyderabad','9000000004','sneha4@student.edu','2004-01-01','M','Undergraduate','India','placed','CSE','Math',9,'CS1'),
    ('B5','Meera','Patel','Pune','9000000005','meera5@student.edu','2004-01-01','M','Undergraduate','India','waiting','CSE','Math',8,'CS1'),
    ('B6','Sai','Gupta','Bangalore','9000000006','sai6@student.edu','2004-01-01','M','Undergraduate','India','placed','CSE','Math',1,'CS1'),
    ('B7','Divya','Singh','Delhi','9000000007','divya7@student.edu','2004-01-01','M','Undergraduate','India','placed','CSE','Math',10,'CS1'),
    ('B8','Sai','Mehta','Mumbai','9000000008','sai8@student.edu','2004-01-01','M','Undergraduate','India','placed','CSE','Math',5,'CS1'),
    ('B9','Isha','Verma','Delhi','9000000009','isha9@student.edu','2004-01-01','M','Undergraduate','India','placed','CSE','Math',1,'CS1'),
    ('B10','Aarav','Iyer','Hyderabad','9000000010','aarav10@student.edu','2004-01-01','M','Undergraduate','India','waiting','CSE','Math',6,'CS1')
    # ... I will generate up to 300 procedurally to reach the count requested
]

with open('seed.sql', 'w', encoding='utf-8') as f:
    f.write("USE accommodation_db;\n\n")
    f.write("-- Staff\n")
    f.write("INSERT INTO Staff (staff_id, first_name, last_name, email, phone, position, department, location, dob) VALUES\n")
    f.write("(1,'Ananya','Iyer','ananya1@univ.edu','9001','Adviser','CSE','Office','1970-01-01'),\n")
    f.write("(2,'Ananya','Nair','ananya2@univ.edu','9002','Adviser','CSE','Office','1970-01-01'),\n")
    f.write("(3,'Rohan','Gupta','rohan3@univ.edu','9003','Adviser','CSE','Office','1970-01-01'),\n")
    f.write("(4,'Meera','Rao','meera4@univ.edu','9004','Adviser','CSE','Office','1970-01-01'),\n")
    f.write("(5,'Vivaan','Gupta','vivaan5@univ.edu','9005','Adviser','CSE','Office','1970-01-01'),\n")
    f.write("(6,'Krishna','Gupta','krishna6@univ.edu','9006','Adviser','CSE','Office','1970-01-01'),\n")
    f.write("(7,'Isha','Patel','isha7@univ.edu','9007','Adviser','CSE','Office','1970-01-01'),\n")
    f.write("(8,'Varun','Reddy','varun8@univ.edu','9008','Adviser','CSE','Office','1970-01-01'),\n")
    f.write("(9,'Priya','Singh','priya9@univ.edu','9009','Adviser','CSE','Office','1970-01-01'),\n")
    f.write("(10,'Pooja','Iyer','pooja10@univ.edu','90010','Adviser','CSE','Office','1970-01-01');\n\n")
    
    f.write("-- Courses\n")
    f.write("INSERT INTO Course VALUES ('CS1','Course1','Dr.X','111','c1@univ.edu','L1','CSE'),('CS2','Course2','Dr.X','111','c2@univ.edu','L2','CSE'),('CS3','Course3','Dr.X','111','c3@univ.edu','L3','CSE');\n\n")
    
    f.write("-- Hall\n")
    f.write("INSERT INTO Hall VALUES ('Hall A','5551',1), ('Hall B','5552',2), ('Hall C','5553',3), ('Hall D','5554',4), ('Hall E','5555',5);\n\n")
    
    f.write("-- Rooms (250 rooms across 5 halls)\n")
    f.write("INSERT INTO Room (room_no, rent, hall_name) VALUES \n")
    rooms = []
    for h in ['A', 'B', 'C', 'D', 'E']:
        base_rent = 400 + (ord(h) - ord('A')) * 50
        for i in range(1, 51):
            rooms.append(f"('{h}{i}', {base_rent + (i%10 * 50)}, 'Hall {h}')")
    f.write(",\n".join(rooms) + ";\n\n")
    
    f.write("-- Students (300 students)\n")
    f.write("INSERT INTO Student (banner_id, first_name, last_name, city, phone, email, dob, gender, category, nationality, status, major, minor, adviser_id, course_id) VALUES \n")
    
    cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad']
    first_names = ['Isha', 'Meera', 'Sneha', 'Sai', 'Divya', 'Aarav', 'Krishna', 'Vivaan', 'Arjun', 'Varun', 'Aditya', 'Priya', 'Karthik', 'Rahul', 'Ananya']
    last_names = ['Mehta', 'Singh', 'Rao', 'Patel', 'Gupta', 'Verma', 'Sharma', 'Nair', 'Reddy', 'Iyer']
    
    student_rows = []
    for i in range(1, 301):
        bid = f"B{i}"
        fname = first_names[i % len(first_names)]
        lname = last_names[i % len(last_names)]
        city = cities[i % len(cities)]
        phone = f"9000000{i:03d}"
        email = f"{fname.lower()}{i}@student.edu"
        status = 'placed' if i <= 250 else 'waiting'
        row = f"('{bid}','{fname}','{lname}','{city}','{phone}','{email}','2004-01-01','M','Undergraduate','India','{status}','CSE','Math',{ (i%10)+1 },'CS1')"
        student_rows.append(row)
    
    f.write(",\n".join(student_rows) + ";\n\n")
    
    f.write("-- Leases\n")
    f.write("INSERT INTO Lease (banner_id, place_id, start_date, end_date, semester) \n")
    f.write("SELECT banner_id, (CAST(SUBSTRING(banner_id, 2) AS UNSIGNED) % 250) + 1, \n")
    f.write("'2026-06-01', '2026-08-31', IF(CAST(SUBSTRING(banner_id, 2) AS UNSIGNED) % 5 = 0, 'Summer', 'Fall') \n")
    f.write("FROM Student WHERE status='placed';\n\n")
    
    f.write("-- Invoices\n")
    f.write("INSERT INTO Invoice (lease_id, amount, due_date, paid_date) \n")
    f.write("SELECT lease_id, 1000, '2026-09-01', IF(lease_id%2=0, '2026-08-01', NULL) FROM Lease;\n")

print("seed.sql generated successfully with 300 records.")

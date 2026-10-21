-- ============================================================================
-- Library Management System using DBMS
-- Full Relational Schema, Sample Data, and Practice Queries
-- ============================================================================

-- 1. Create Database (Run if not already created)
-- CREATE DATABASE library_management;
-- \c library_management;

-- 2. Drop existing tables if re-creating
DROP TABLE IF EXISTS Borrowings;
DROP TABLE IF EXISTS Members;
DROP TABLE IF EXISTS Books;

-- Table 1: Books
CREATE TABLE Books (
    book_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(100) NOT NULL,
    genre VARCHAR(50),
    quantity INT NOT NULL CHECK (quantity >= 0),
    available_copies INT NOT NULL CHECK (available_copies >= 0),
    CHECK (available_copies <= quantity)
);

-- Table 2: Members
CREATE TABLE Members (
    member_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    department VARCHAR(50)
);

-- Table 3: Borrowings
CREATE TABLE Borrowings (
    borrow_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    book_id INT NOT NULL REFERENCES Books(book_id),
    member_id INT NOT NULL REFERENCES Members(member_id),
    borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    CHECK (due_date >= borrow_date),
    CHECK (return_date IS NULL OR return_date >= borrow_date)
);

-- Check whether all three tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- INSERT SEED DATA
-- ============================================================================

INSERT INTO Books (title, author, genre, quantity, available_copies)
VALUES
('The Alchemist', 'Paulo Coelho', 'Fiction', 5, 4),
('Wings of Fire', 'A.P.J. Abdul Kalam', 'Biography', 5, 4),
('Atomic Habits', 'James Clear', 'Self-Help', 5, 4),
('Rich Dad Poor Dad', 'Robert Kiyosaki', 'Finance', 5, 4),
('Harry Potter', 'J.K. Rowling', 'Fantasy', 5, 4),
('Ikigai', 'Hector Garcia', 'Self-Help', 5, 5),
('Clean Code', 'Robert C. Martin', 'Technology', 5, 5),
('The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 5, 5),
('Think Like a Monk', 'Jay Shetty', 'Self-Help', 5, 5),
('Introduction to Algorithms', 'Thomas H. Cormen', 'Technology', 5, 5);

INSERT INTO Members (name, email, phone, department)
VALUES
('Aarav Sharma', 'aarav@example.com', '9876500001', 'Computer Engineering'),
('Ananya Patel', 'ananya@example.com', '9876500002', 'Information Technology'),
('Rohan Mehta', 'rohan@example.com', '9876500003', 'Computer Engineering'),
('Priya Nair', 'priya@example.com', '9876500004', 'Electronics'),
('Ishaan Shah', 'ishaan@example.com', '9876500005', 'Mechanical'),
('Sneha Rao', 'sneha@example.com', '9876500006', 'Computer Engineering'),
('Kabir Desai', 'kabir@example.com', '9876500007', 'Information Technology'),
('Aditi Joshi', 'aditi@example.com', '9876500008', 'Electronics'),
('Neel Verma', 'neel@example.com', '9876500009', 'Mechanical'),
('Meera Iyer', 'meera@example.com', '9876500010', 'Computer Engineering');

INSERT INTO Borrowings
    (book_id, member_id, borrow_date, due_date, return_date)
VALUES
-- Currently borrowed books (active loans)
(1, 1, '2026-10-10', '2026-10-20', NULL),
(2, 2, '2026-10-15', '2026-10-25', NULL),
(3, 3, '2026-10-16', '2026-10-23', NULL),
(4, 4, '2026-10-18', '2026-10-28', NULL),
(5, 5, '2026-10-19', '2026-10-29', NULL),

-- Returned books
(6, 6, '2026-09-01', '2026-09-10', '2026-09-08'),
(7, 7, '2026-09-03', '2026-09-13', '2026-09-12'),
(8, 8, '2026-09-05', '2026-09-15', '2026-09-14'),
(9, 9, '2026-09-08', '2026-09-18', '2026-09-17'),
(10, 10, '2026-09-10', '2026-09-20', '2026-09-19'),
(1, 3, '2026-09-12', '2026-09-22', '2026-09-20'),
(2, 5, '2026-09-15', '2026-09-25', '2026-09-24'),
(3, 7, '2026-09-18', '2026-09-28', '2026-09-27'),
(4, 9, '2026-09-20', '2026-09-30', '2026-09-29'),
(5, 10, '2026-09-22', '2026-10-02', '2026-10-01');

-- Verify records
SELECT COUNT(*) AS total_books FROM Books;
SELECT COUNT(*) AS total_members FROM Members;
SELECT COUNT(*) AS total_borrowings FROM Borrowings;

-- Check all three tables with UNION ALL
SELECT 'Books' AS table_name, COUNT(*) AS total_records FROM books
UNION ALL
SELECT 'Members', COUNT(*) FROM members
UNION ALL
SELECT 'Borrowings', COUNT(*) FROM borrowings;

-- ============================================================================
-- PRACTICE SQL QUERIES
-- ============================================================================

-- 1. Display all books
SELECT * FROM books;

-- 2. Search for a particular genre
SELECT title, author, genre
FROM books
WHERE genre = 'Fiction';

-- 3. Sort books alphabetically
SELECT title, author, quantity
FROM books
ORDER BY title ASC;

-- 4. Count books by genre
SELECT genre, COUNT(*) AS total_books
FROM books
GROUP BY genre
ORDER BY total_books DESC;

-- 5. Find genres with at least two books
SELECT genre, COUNT(*) AS total_books
FROM books
GROUP BY genre
HAVING COUNT(*) >= 2;

-- 6. Join books, members, and borrowing records
SELECT
    b.title,
    m.name AS member_name,
    br.borrow_date,
    br.due_date,
    br.return_date
FROM borrowings br
JOIN books b ON br.book_id = b.book_id
JOIN members m ON br.member_id = m.member_id;

-- 7. Generate an overdue-books report
SELECT
    b.title,
    m.name AS member_name,
    m.email,
    br.due_date
FROM borrowings br
JOIN books b ON br.book_id = b.book_id
JOIN members m ON br.member_id = m.member_id
WHERE br.return_date IS NULL
  AND br.due_date < CURRENT_DATE
ORDER BY br.due_date;

-- 8.1 Check the average quantity
SELECT AVG(quantity) AS average_quantity
FROM books;

-- 8.2 Subquery: Find books with above-average quantity
SELECT title, quantity
FROM books
WHERE quantity > (
    SELECT AVG(quantity)
    FROM books
);

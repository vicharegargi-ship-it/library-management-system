/**
 * Pre-configured SQL queries from the Library Management System DBMS specification
 * with explanations for learning, presentation, and viva.
 */

const PRACTICE_QUERIES = [
    {
        id: 'q_verify_schema',
        category: 'Schema Verification',
        title: 'Check All Three Tables (UNION ALL)',
        description: 'Combines row counts from Books, Members, and Borrowings using UNION ALL.',
        sql: `SELECT 'Books' AS table_name, COUNT(*) AS total_records FROM books
UNION ALL
SELECT 'Members', COUNT(*) FROM members
UNION ALL
SELECT 'Borrowings', COUNT(*) FROM borrowings;`,
        explanation: 'UNION ALL combines the results of multiple SELECT queries into a single result set without removing duplicates.'
    },
    {
        id: 'q_tables_exist',
        category: 'Schema Verification',
        title: 'Check Table Existence in Schema',
        description: 'Queries information_schema to verify base tables in the public schema.',
        sql: `SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;`,
        explanation: 'information_schema is the ANSI-standard catalog view providing metadata about tables, columns, and constraints in the database.'
    },
    {
        id: 'q1_all_books',
        category: 'Basic Retrieval',
        title: '1. Display All Books',
        description: 'Retrieves all columns and rows from the Books table.',
        sql: `SELECT * FROM books;`,
        explanation: 'The asterisk (*) wildcard selects all columns defined in the table schema.'
    },
    {
        id: 'q2_search_genre',
        category: 'Filtering & Sorting',
        title: '2. Search for a Particular Genre',
        description: 'Filters the book catalog for books classified under the Fiction genre.',
        sql: `SELECT title, author, genre
FROM books
WHERE genre = 'Fiction';`,
        explanation: 'The WHERE clause filters rows based on a boolean condition before any grouping or sorting occurs.'
    },
    {
        id: 'q3_sort_books',
        category: 'Filtering & Sorting',
        title: '3. Sort Books Alphabetically',
        description: 'Lists book title, author, and quantity sorted alphabetically by title.',
        sql: `SELECT title, author, quantity
FROM books
ORDER BY title ASC;`,
        explanation: 'ORDER BY specifies the sort direction (ASC for ascending, DESC for descending). ASC is default if omitted.'
    },
    {
        id: 'q4_count_by_genre',
        category: 'Aggregation',
        title: '4. Count Books by Genre',
        description: 'Groups books by genre and calculates the total count for each category.',
        sql: `SELECT genre, COUNT(*) AS total_books
FROM books
GROUP BY genre
ORDER BY total_books DESC;`,
        explanation: 'GROUP BY aggregates rows that have identical values in the specified column(s). COUNT(*) counts rows in each group.'
    },
    {
        id: 'q5_having_genre',
        category: 'Aggregation',
        title: '5. Find Genres with at Least Two Books',
        description: 'Uses the HAVING clause to filter aggregated genre groups.',
        sql: `SELECT genre, COUNT(*) AS total_books
FROM books
GROUP BY genre
HAVING COUNT(*) >= 2;`,
        explanation: 'Key Viva Concept: WHERE filters individual rows BEFORE grouping. HAVING filters aggregated groups AFTER GROUP BY.'
    },
    {
        id: 'q6_join_records',
        category: 'Relational Joins',
        title: '6. Join Books, Members, and Borrowings',
        description: 'Shows which member borrowed which book with borrow and return dates.',
        sql: `SELECT
    b.title,
    m.name AS member_name,
    br.borrow_date,
    br.due_date,
    br.return_date
FROM borrowings br
JOIN books b ON br.book_id = b.book_id
JOIN members m ON br.member_id = m.member_id;`,
        explanation: 'INNER JOIN combines matching rows across 3 tables using Primary Key to Foreign Key relationships.'
    },
    {
        id: 'q7_overdue_report',
        category: 'Reports & Business Logic',
        title: '7. Generate Overdue Books Report',
        description: 'Finds books currently not returned whose due date has passed.',
        sql: `SELECT
    b.title,
    m.name AS member_name,
    m.email,
    br.due_date
FROM borrowings br
JOIN books b ON br.book_id = b.book_id
JOIN members m ON br.member_id = m.member_id
WHERE br.return_date IS NULL
  AND br.due_date < CURRENT_DATE
ORDER BY br.due_date;`,
        explanation: 'Identifies active borrowings (return_date IS NULL) where due_date < CURRENT_DATE, sorted chronologically.'
    },
    {
        id: 'q8_avg_quantity',
        category: 'Subqueries & Aggregates',
        title: '8.1 Check the Average Quantity of Books',
        description: 'Calculates the arithmetic mean of the quantity column in the Books table.',
        sql: `SELECT AVG(quantity) AS average_quantity
FROM books;`,
        explanation: 'AVG() is an aggregate function that computes the average numerical value across all rows in the table.'
    },
    {
        id: 'q8_subquery_above_avg',
        category: 'Subqueries & Aggregates',
        title: '8.2 Subquery: Books with Above-Average Quantity',
        description: 'Finds books with stock greater than the global average quantity.',
        sql: `SELECT title, quantity
FROM books
WHERE quantity > (
    SELECT AVG(quantity)
    FROM books
);`,
        explanation: 'The nested subquery (SELECT AVG(quantity)...) executes first, returning a single scalar value that the outer query compares against.'
    },
    {
        id: 'q_active_borrowings',
        category: 'Reports & Business Logic',
        title: 'View Currently Borrowed Books',
        description: 'Lists all unreturned borrowings with member and book details.',
        sql: `SELECT
    b.title,
    m.name AS member_name,
    br.borrow_date,
    br.due_date
FROM Borrowings br
JOIN Books b ON br.book_id = b.book_id
JOIN Members m ON br.member_id = m.member_id
WHERE br.return_date IS NULL
ORDER BY br.borrow_date DESC;`,
        explanation: 'Filters active loans (return_date IS NULL) to monitor outstanding library assets.'
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PRACTICE_QUERIES;
}

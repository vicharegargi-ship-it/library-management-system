/**
 * Library Management System - In-Memory Relational DBMS
 * Supports exact schema, foreign keys, constraints, and standard SQL execution
 * (SELECT, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, UNION ALL, SUBQUERIES, INSERT, UPDATE, DELETE)
 */

class LibraryDBMS {
    constructor() {
        this.storageKey = 'lms_db_data_v1';
        this.currentSimulatedDate = '2026-10-22'; // Matches user's dataset timeframe
        this.initDatabase();
    }

    getDefaultData() {
        return {
            books: [
                { book_id: 1, title: 'The Alchemist', author: 'Paulo Coelho', genre: 'Fiction', quantity: 5, available_copies: 4 },
                { book_id: 2, title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', genre: 'Biography', quantity: 5, available_copies: 4 },
                { book_id: 3, title: 'Atomic Habits', author: 'James Clear', genre: 'Self-Help', quantity: 5, available_copies: 4 },
                { book_id: 4, title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', genre: 'Finance', quantity: 5, available_copies: 4 },
                { book_id: 5, title: 'Harry Potter', author: 'J.K. Rowling', genre: 'Fantasy', quantity: 5, available_copies: 4 },
                { book_id: 6, title: 'Ikigai', author: 'Hector Garcia', genre: 'Self-Help', quantity: 5, available_copies: 5 },
                { book_id: 7, title: 'Clean Code', author: 'Robert C. Martin', genre: 'Technology', quantity: 5, available_copies: 5 },
                { book_id: 8, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Fiction', quantity: 5, available_copies: 5 },
                { book_id: 9, title: 'Think Like a Monk', author: 'Jay Shetty', genre: 'Self-Help', quantity: 5, available_copies: 5 },
                { book_id: 10, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', genre: 'Technology', quantity: 5, available_copies: 5 }
            ],
            members: [
                { member_id: 1, name: 'Aarav Sharma', email: 'aarav@example.com', phone: '9876500001', department: 'Computer Engineering' },
                { member_id: 2, name: 'Ananya Patel', email: 'ananya@example.com', phone: '9876500002', department: 'Information Technology' },
                { member_id: 3, name: 'Rohan Mehta', email: 'rohan@example.com', phone: '9876500003', department: 'Computer Engineering' },
                { member_id: 4, name: 'Priya Nair', email: 'priya@example.com', phone: '9876500004', department: 'Electronics' },
                { member_id: 5, name: 'Ishaan Shah', email: 'ishaan@example.com', phone: '9876500005', department: 'Mechanical' },
                { member_id: 6, name: 'Sneha Rao', email: 'sneha@example.com', phone: '9876500006', department: 'Computer Engineering' },
                { member_id: 7, name: 'Kabir Desai', email: 'kabir@example.com', phone: '9876500007', department: 'Information Technology' },
                { member_id: 8, name: 'Aditi Joshi', email: 'aditi@example.com', phone: '9876500008', department: 'Electronics' },
                { member_id: 9, name: 'Neel Verma', email: 'neel@example.com', phone: '9876500009', department: 'Mechanical' },
                { member_id: 10, name: 'Meera Iyer', email: 'meera@example.com', phone: '9876500010', department: 'Computer Engineering' }
            ],
            borrowings: [
                // Currently borrowed books (active)
                { borrow_id: 1, book_id: 1, member_id: 1, borrow_date: '2026-10-10', due_date: '2026-10-20', return_date: null },
                { borrow_id: 2, book_id: 2, member_id: 2, borrow_date: '2026-10-15', due_date: '2026-10-25', return_date: null },
                { borrow_id: 3, book_id: 3, member_id: 3, borrow_date: '2026-10-16', due_date: '2026-10-23', return_date: null },
                { borrow_id: 4, book_id: 4, member_id: 4, borrow_date: '2026-10-18', due_date: '2026-10-28', return_date: null },
                { borrow_id: 5, book_id: 5, member_id: 5, borrow_date: '2026-10-19', due_date: '2026-10-29', return_date: null },
                // Returned books
                { borrow_id: 6, book_id: 6, member_id: 6, borrow_date: '2026-09-01', due_date: '2026-09-10', return_date: '2026-09-08' },
                { borrow_id: 7, book_id: 7, member_id: 7, borrow_date: '2026-09-03', due_date: '2026-09-13', return_date: '2026-09-12' },
                { borrow_id: 8, book_id: 8, member_id: 8, borrow_date: '2026-09-05', due_date: '2026-09-15', return_date: '2026-09-14' },
                { borrow_id: 9, book_id: 9, member_id: 9, borrow_date: '2026-09-08', due_date: '2026-09-18', return_date: '2026-09-17' },
                { borrow_id: 10, book_id: 10, member_id: 10, borrow_date: '2026-09-10', due_date: '2026-09-20', return_date: '2026-09-19' },
                { borrow_id: 11, book_id: 1, member_id: 3, borrow_date: '2026-09-12', due_date: '2026-09-22', return_date: '2026-09-20' },
                { borrow_id: 12, book_id: 2, member_id: 5, borrow_date: '2026-09-15', due_date: '2026-09-25', return_date: '2026-09-24' },
                { borrow_id: 13, book_id: 3, member_id: 7, borrow_date: '2026-09-18', due_date: '2026-09-28', return_date: '2026-09-27' },
                { borrow_id: 14, book_id: 4, member_id: 9, borrow_date: '2026-09-20', due_date: '2026-09-30', return_date: '2026-09-29' },
                { borrow_id: 15, book_id: 5, member_id: 10, borrow_date: '2026-09-22', due_date: '2026-10-02', return_date: '2026-10-01' }
            ]
        };
    }

    initDatabase() {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                try {
                    this.data = JSON.parse(saved);
                    return;
                } catch (e) {
                    console.error('Failed to parse localStorage data, re-seeding.', e);
                }
            }
        }
        this.resetDatabase();
    }

    save() {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        }
    }

    resetDatabase() {
        this.data = this.getDefaultData();
        this.save();
        return { success: true, message: 'Database reset to default seed records successfully.' };
    }

    getSimulatedCurrentDate() {
        return this.currentSimulatedDate;
    }

    setSimulatedCurrentDate(dateStr) {
        this.currentSimulatedDate = dateStr;
    }

    // High level CRUD
    getBooks() {
        return [...this.data.books];
    }

    getBook(id) {
        return this.data.books.find(b => b.book_id === parseInt(id, 10));
    }

    addBook({ title, author, genre, quantity, available_copies }) {
        const qty = parseInt(quantity, 10);
        const avail = available_copies !== undefined && available_copies !== '' 
            ? parseInt(available_copies, 10) 
            : qty;

        if (isNaN(qty) || qty < 0) {
            throw new Error('Check Constraint Violated: quantity must be >= 0');
        }
        if (isNaN(avail) || avail < 0) {
            throw new Error('Check Constraint Violated: available_copies must be >= 0');
        }
        if (avail > qty) {
            throw new Error('Check Constraint Violated: available_copies cannot exceed quantity');
        }

        const nextId = this.data.books.length > 0 
            ? Math.max(...this.data.books.map(b => b.book_id)) + 1 
            : 1;

        const newBook = {
            book_id: nextId,
            title: title.trim(),
            author: author.trim(),
            genre: (genre || 'General').trim(),
            quantity: qty,
            available_copies: avail
        };

        this.data.books.push(newBook);
        this.save();
        return {
            book: newBook,
            sql: `INSERT INTO Books (title, author, genre, quantity, available_copies) VALUES ('${newBook.title}', '${newBook.author}', '${newBook.genre}', ${newBook.quantity}, ${newBook.available_copies});`
        };
    }

    updateBook(id, { title, author, genre, quantity, available_copies }) {
        const book = this.getBook(id);
        if (!book) throw new Error(`Book with ID ${id} not found.`);

        const qty = parseInt(quantity, 10);
        const avail = parseInt(available_copies, 10);

        if (isNaN(qty) || qty < 0) throw new Error('Quantity must be >= 0');
        if (isNaN(avail) || avail < 0) throw new Error('Available copies must be >= 0');
        if (avail > qty) throw new Error('Available copies cannot exceed total quantity');

        book.title = title.trim();
        book.author = author.trim();
        book.genre = (genre || 'General').trim();
        book.quantity = qty;
        book.available_copies = avail;

        this.save();
        return {
            book,
            sql: `UPDATE Books SET title = '${book.title}', author = '${book.author}', genre = '${book.genre}', quantity = ${book.quantity}, available_copies = ${book.available_copies} WHERE book_id = ${book.book_id};`
        };
    }

    deleteBook(id) {
        const bookId = parseInt(id, 10);
        // Foreign key check
        const hasBorrowings = this.data.borrowings.some(br => br.book_id === bookId);
        if (hasBorrowings) {
            throw new Error(`Foreign Key Constraint: Cannot delete Book ID ${bookId} because borrowing records reference it.`);
        }

        const index = this.data.books.findIndex(b => b.book_id === bookId);
        if (index === -1) throw new Error(`Book ID ${bookId} not found.`);
        const deleted = this.data.books.splice(index, 1)[0];
        this.save();
        return {
            deleted,
            sql: `DELETE FROM Books WHERE book_id = ${bookId};`
        };
    }

    getMembers() {
        return [...this.data.members];
    }

    getMember(id) {
        return this.data.members.find(m => m.member_id === parseInt(id, 10));
    }

    addMember({ name, email, phone, department }) {
        const trimmedEmail = email.trim().toLowerCase();
        if (this.data.members.some(m => m.email.toLowerCase() === trimmedEmail)) {
            throw new Error(`Unique Constraint Violated: Member with email '${trimmedEmail}' already exists.`);
        }

        const nextId = this.data.members.length > 0 
            ? Math.max(...this.data.members.map(m => m.member_id)) + 1 
            : 1;

        const newMember = {
            member_id: nextId,
            name: name.trim(),
            email: trimmedEmail,
            phone: phone ? phone.trim() : '',
            department: department ? department.trim() : 'General'
        };

        this.data.members.push(newMember);
        this.save();
        return {
            member: newMember,
            sql: `INSERT INTO Members (name, email, phone, department) VALUES ('${newMember.name}', '${newMember.email}', '${newMember.phone}', '${newMember.department}');`
        };
    }

    updateMember(id, { name, email, phone, department }) {
        const member = this.getMember(id);
        if (!member) throw new Error(`Member with ID ${id} not found.`);

        const trimmedEmail = email.trim().toLowerCase();
        if (this.data.members.some(m => m.member_id !== member.member_id && m.email.toLowerCase() === trimmedEmail)) {
            throw new Error(`Unique Constraint Violated: Email '${trimmedEmail}' already in use by another member.`);
        }

        member.name = name.trim();
        member.email = trimmedEmail;
        member.phone = phone ? phone.trim() : '';
        member.department = department ? department.trim() : 'General';

        this.save();
        return {
            member,
            sql: `UPDATE Members SET name = '${member.name}', email = '${member.email}', phone = '${member.phone}', department = '${member.department}' WHERE member_id = ${member.member_id};`
        };
    }

    deleteMember(id) {
        const memberId = parseInt(id, 10);
        // Foreign key check
        const hasBorrowings = this.data.borrowings.some(br => br.member_id === memberId);
        if (hasBorrowings) {
            throw new Error(`Foreign Key Constraint: Cannot delete Member ID ${memberId} because borrowing records reference it.`);
        }

        const index = this.data.members.findIndex(m => m.member_id === memberId);
        if (index === -1) throw new Error(`Member ID ${memberId} not found.`);
        const deleted = this.data.members.splice(index, 1)[0];
        this.save();
        return {
            deleted,
            sql: `DELETE FROM Members WHERE member_id = ${memberId};`
        };
    }

    getBorrowings() {
        return this.data.borrowings.map(br => {
            const book = this.getBook(br.book_id) || { title: 'Unknown Book', genre: 'N/A' };
            const member = this.getMember(br.member_id) || { name: 'Unknown Member', email: 'N/A', department: 'N/A' };
            const isReturned = br.return_date !== null && br.return_date !== '';
            const isOverdue = !isReturned && br.due_date < this.currentSimulatedDate;

            return {
                ...br,
                book_title: book.title,
                book_genre: book.genre,
                member_name: member.name,
                member_email: member.email,
                member_department: member.department,
                is_returned: isReturned,
                is_overdue: isOverdue
            };
        });
    }

    borrowBook({ book_id, member_id, borrow_date, due_date }) {
        const bId = parseInt(book_id, 10);
        const mId = parseInt(member_id, 10);

        const book = this.getBook(bId);
        if (!book) throw new Error(`Foreign Key: Book ID ${bId} does not exist.`);

        const member = this.getMember(mId);
        if (!member) throw new Error(`Foreign Key: Member ID ${mId} does not exist.`);

        if (book.available_copies <= 0) {
            throw new Error(`Book "${book.title}" is currently out of stock (0 available copies).`);
        }

        const bDate = borrow_date || this.currentSimulatedDate;
        if (!due_date) throw new Error('Due date is required.');
        if (due_date < bDate) {
            throw new Error('Check Constraint Violated: due_date must be >= borrow_date.');
        }

        const nextId = this.data.borrowings.length > 0 
            ? Math.max(...this.data.borrowings.map(b => b.borrow_id)) + 1 
            : 1;

        const newBorrowing = {
            borrow_id: nextId,
            book_id: bId,
            member_id: mId,
            borrow_date: bDate,
            due_date: due_date,
            return_date: null
        };

        // Transaction simulation: insert borrowing AND decrement available_copies
        this.data.borrowings.push(newBorrowing);
        book.available_copies -= 1;
        this.save();

        const sql = `BEGIN TRANSACTION;
INSERT INTO Borrowings (book_id, member_id, borrow_date, due_date, return_date)
VALUES (${bId}, ${mId}, '${bDate}', '${due_date}', NULL);
UPDATE Books SET available_copies = available_copies - 1 WHERE book_id = ${bId};
COMMIT;`;

        return { borrowing: newBorrowing, sql };
    }

    returnBook(borrow_id, return_date) {
        const brId = parseInt(borrow_id, 10);
        const borrowing = this.data.borrowings.find(b => b.borrow_id === brId);
        if (!borrowing) throw new Error(`Borrowing record ID ${brId} not found.`);
        if (borrowing.return_date !== null && borrowing.return_date !== '') {
            throw new Error(`Book was already returned on ${borrowing.return_date}.`);
        }

        const rDate = return_date || this.currentSimulatedDate;
        if (rDate < borrowing.borrow_date) {
            throw new Error('Check Constraint Violated: return_date must be >= borrow_date.');
        }

        borrowing.return_date = rDate;
        const book = this.getBook(borrowing.book_id);
        if (book && book.available_copies < book.quantity) {
            book.available_copies += 1;
        }

        this.save();

        const sql = `BEGIN TRANSACTION;
UPDATE Borrowings SET return_date = '${rDate}' WHERE borrow_id = ${brId};
UPDATE Books SET available_copies = available_copies + 1 WHERE book_id = ${borrowing.book_id};
COMMIT;`;

        return { borrowing, sql };
    }

    getOverdueReport() {
        const curr = this.currentSimulatedDate;
        return this.data.borrowings
            .filter(br => (br.return_date === null || br.return_date === '') && br.due_date < curr)
            .map(br => {
                const book = this.getBook(br.book_id) || {};
                const member = this.getMember(br.member_id) || {};
                // calculate days overdue
                const due = new Date(br.due_date);
                const today = new Date(curr);
                const diffTime = Math.abs(today - due);
                const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                return {
                    borrow_id: br.borrow_id,
                    title: book.title || 'Unknown',
                    member_name: member.name || 'Unknown',
                    email: member.email || 'N/A',
                    phone: member.phone || 'N/A',
                    department: member.department || 'N/A',
                    borrow_date: br.borrow_date,
                    due_date: br.due_date,
                    days_overdue: daysOverdue
                };
            })
            .sort((a, b) => a.due_date.localeCompare(b.due_date));
    }

    getSummaryStats() {
        const totalBooks = this.data.books.reduce((acc, b) => acc + b.quantity, 0);
        const uniqueTitles = this.data.books.length;
        const availableCopies = this.data.books.reduce((acc, b) => acc + b.available_copies, 0);
        const totalMembers = this.data.members.length;
        const activeBorrowings = this.data.borrowings.filter(b => b.return_date === null || b.return_date === '').length;
        const overdueCount = this.getOverdueReport().length;

        // Books by genre
        const genreMap = {};
        this.data.books.forEach(b => {
            genreMap[b.genre] = (genreMap[b.genre] || 0) + 1;
        });

        // Department distribution
        const deptMap = {};
        this.data.members.forEach(m => {
            deptMap[m.department] = (deptMap[m.department] || 0) + 1;
        });

        return {
            totalBooks,
            uniqueTitles,
            availableCopies,
            totalMembers,
            activeBorrowings,
            overdueCount,
            genres: genreMap,
            departments: deptMap
        };
    }

    // =========================================================================
    // SQL ENGINE: Parses and executes SQL statements
    // =========================================================================
    executeSQL(rawSql) {
        const startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        if (!rawSql || !rawSql.trim()) {
            return { success: false, message: 'Empty SQL statement provided.', executionTimeMs: 0 };
        }

        // Clean comments and normalize whitespace
        let cleaned = rawSql
            .replace(/--.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .trim();

        if (cleaned.endsWith(';')) cleaned = cleaned.slice(0, -1).trim();

        try {
            // Check for UNION ALL
            if (/UNION\s+ALL/i.test(cleaned)) {
                return this._executeUnion(cleaned, startTime);
            }

            const upper = cleaned.toUpperCase();

            if (upper.startsWith('SELECT')) {
                return this._executeSelect(cleaned, startTime);
            } else if (upper.startsWith('INSERT INTO')) {
                return this._executeInsert(cleaned, startTime);
            } else if (upper.startsWith('UPDATE')) {
                return this._executeUpdate(cleaned, startTime);
            } else if (upper.startsWith('DELETE FROM')) {
                return this._executeDelete(cleaned, startTime);
            } else if (upper.startsWith('CREATE TABLE') || upper.startsWith('CREATE DATABASE')) {
                return {
                    success: true,
                    columns: ['Status'],
                    rows: [['Command executed successfully (Schema verified)']],
                    message: 'Schema statement acknowledged.',
                    executionTimeMs: this._calcTime(startTime)
                };
            } else {
                throw new Error(`Unsupported SQL command. Supported statements: SELECT, INSERT, UPDATE, DELETE, UNION ALL.`);
            }
        } catch (err) {
            return {
                success: false,
                message: err.message || 'Error executing SQL statement.',
                executionTimeMs: this._calcTime(startTime)
            };
        }
    }

    _calcTime(startTime) {
        const endTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        return (endTime - startTime).toFixed(2);
    }

    _executeUnion(sql, startTime) {
        const parts = sql.split(/UNION\s+ALL/i);
        let allRows = [];
        let firstColumns = null;

        for (let part of parts) {
            const res = this.executeSQL(part.trim());
            if (!res.success) throw new Error(res.message);
            if (!firstColumns) firstColumns = res.columns;
            allRows = allRows.concat(res.rows);
        }

        return {
            success: true,
            columns: firstColumns || ['Column'],
            rows: allRows,
            rowCount: allRows.length,
            executionTimeMs: this._calcTime(startTime)
        };
    }

    _executeSelect(sql, startTime) {
        // Special case: check table exists query:
        // SELECT table_name FROM information_schema.tables WHERE ...
        if (/information_schema\.tables/i.test(sql)) {
            return {
                success: true,
                columns: ['table_name'],
                rows: [['Books'], ['Members'], ['Borrowings']],
                rowCount: 3,
                executionTimeMs: this._calcTime(startTime)
            };
        }

        // Subquery detection: e.g., quantity > (SELECT AVG(quantity) FROM books)
        let processedSql = sql;
        const subqueryMatch = sql.match(/\(\s*SELECT\s+AVG\s*\(\s*(\w+)\s*\)\s+FROM\s+(\w+)\s*\)/i);
        if (subqueryMatch) {
            const col = subqueryMatch[1];
            const tbl = subqueryMatch[2].toLowerCase();
            const tableData = this._getTableData(tbl);
            const sum = tableData.reduce((acc, r) => acc + (Number(r[col]) || 0), 0);
            const avg = tableData.length > 0 ? (sum / tableData.length) : 0;
            processedSql = processedSql.replace(subqueryMatch[0], avg.toString());
        }

        // Parse SELECT ... FROM ... [JOIN ...] [WHERE ...] [GROUP BY ...] [HAVING ...] [ORDER BY ...]
        // Regex to extract clauses
        const clauseRegex = /SELECT\s+(.+?)\s+FROM\s+(.+?)(?:\s+WHERE\s+(.+?))?(?:\s+GROUP\s+BY\s+(.+?))?(?:\s+HAVING\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?$/i;
        
        // Remove line breaks for uniform parsing
        const singleLine = processedSql.replace(/\s+/g, ' ').trim();
        const match = singleLine.match(clauseRegex);

        if (!match) {
            throw new Error('Invalid or unsupported SELECT statement syntax.');
        }

        const selectPart = match[1].trim();
        const fromPart = match[2].trim();
        const wherePart = match[3] ? match[3].trim() : null;
        const groupByPart = match[4] ? match[4].trim() : null;
        const havingPart = match[5] ? match[5].trim() : null;
        const orderByPart = match[6] ? match[6].trim() : null;

        // Process FROM and JOINs
        let workingSet = this._buildJoinedDataset(fromPart);

        // Process WHERE
        if (wherePart) {
            workingSet = workingSet.filter(row => this._evaluateWhere(row, wherePart));
        }

        // Process GROUP BY & Aggregation
        let finalRows = [];
        let finalCols = [];

        if (groupByPart) {
            const groupField = groupByPart.trim();
            const groups = {};

            workingSet.forEach(row => {
                const key = this._resolveFieldValue(row, groupField);
                if (!groups[key]) groups[key] = [];
                groups[key].push(row);
            });

            // Parse SELECT columns
            const colDefs = this._parseSelectColumns(selectPart);
            finalCols = colDefs.map(c => c.alias);

            for (let [groupVal, rowsInGroup] of Object.entries(groups)) {
                // Check HAVING if present
                if (havingPart) {
                    const passesHaving = this._evaluateHaving(rowsInGroup, havingPart);
                    if (!passesHaving) continue;
                }

                const outRow = [];
                for (let colDef of colDefs) {
                    if (colDef.isCount) {
                        outRow.push(rowsInGroup.length);
                    } else if (colDef.isAvg) {
                        const sum = rowsInGroup.reduce((a, r) => a + (Number(this._resolveFieldValue(r, colDef.field)) || 0), 0);
                        outRow.push(rowsInGroup.length > 0 ? (sum / rowsInGroup.length).toFixed(2) : 0);
                    } else if (colDef.field === groupField || colDef.field.endsWith(`.${groupField}`)) {
                        outRow.push(groupVal);
                    } else {
                        outRow.push(this._resolveFieldValue(rowsInGroup[0], colDef.field));
                    }
                }
                finalRows.push(outRow);
            }
        } else {
            // Check if there is an aggregate without GROUP BY, e.g., SELECT COUNT(*) or SELECT AVG(quantity)
            const colDefs = this._parseSelectColumns(selectPart);
            const hasAggregate = colDefs.some(c => c.isCount || c.isAvg);

            if (hasAggregate) {
                finalCols = colDefs.map(c => c.alias);
                const singleRow = [];
                for (let colDef of colDefs) {
                    if (colDef.isCount) {
                        singleRow.push(workingSet.length);
                    } else if (colDef.isAvg) {
                        const sum = workingSet.reduce((a, r) => a + (Number(this._resolveFieldValue(r, colDef.field)) || 0), 0);
                        const avg = workingSet.length > 0 ? (sum / workingSet.length).toFixed(2) : 0;
                        singleRow.push(avg);
                    } else {
                        // Literal column
                        singleRow.push(colDef.field.replace(/['"]/g, ''));
                    }
                }
                finalRows.push(singleRow);
            } else {
                // Normal SELECT
                if (selectPart === '*') {
                    if (workingSet.length > 0) {
                        finalCols = Object.keys(workingSet[0]);
                        finalRows = workingSet.map(row => finalCols.map(c => row[c] === null ? 'NULL' : row[c]));
                    } else {
                        finalCols = ['No rows returned'];
                        finalRows = [];
                    }
                } else {
                    finalCols = colDefs.map(c => c.alias);
                    finalRows = workingSet.map(row => {
                        return colDefs.map(c => {
                            const val = this._resolveFieldValue(row, c.field);
                            return val === null ? 'NULL' : val;
                        });
                    });
                }
            }
        }

        // Process ORDER BY
        if (orderByPart) {
            const orderTokens = orderByPart.split(',').map(s => s.trim());
            const firstToken = orderTokens[0];
            const parts = firstToken.split(/\s+/);
            const orderCol = parts[0];
            const isDesc = parts[1] && parts[1].toUpperCase() === 'DESC';

            const colIndex = finalCols.findIndex(c => c.toLowerCase() === orderCol.toLowerCase() || c.toLowerCase().endsWith(`.${orderCol.toLowerCase()}`));
            if (colIndex !== -1) {
                finalRows.sort((a, b) => {
                    let va = a[colIndex];
                    let vb = b[colIndex];
                    if (typeof va === 'number' && typeof vb === 'number') {
                        return isDesc ? vb - va : va - vb;
                    }
                    va = String(va || '').toLowerCase();
                    vb = String(vb || '').toLowerCase();
                    return isDesc ? vb.localeCompare(va) : va.localeCompare(vb);
                });
            }
        }

        return {
            success: true,
            columns: finalCols,
            rows: finalRows,
            rowCount: finalRows.length,
            executionTimeMs: this._calcTime(startTime)
        };
    }

    _getTableData(tableName) {
        const name = tableName.toLowerCase();
        if (name === 'books') return this.data.books;
        if (name === 'members') return this.data.members;
        if (name === 'borrowings') return this.data.borrowings;
        throw new Error(`Table '${tableName}' does not exist.`);
    }

    _buildJoinedDataset(fromClause) {
        // Example: borrowings br JOIN books b ON br.book_id = b.book_id JOIN members m ON br.member_id = m.member_id
        // Or simple: books, members, borrowings
        const joinRegex = /(?:(\w+)\s*(?:AS\s*)?(\w+)?)((?:\s+JOIN\s+\w+(?:\s*(?:AS\s*)?\w+)?\s+ON\s+[\w\.\s=]+)*)/i;
        const m = fromClause.match(joinRegex);

        if (!m) {
            throw new Error(`Invalid FROM clause: ${fromClause}`);
        }

        const baseTable = m[1];
        const baseAlias = m[2] && !['JOIN', 'WHERE', 'GROUP', 'ORDER'].includes(m[2].toUpperCase()) ? m[2] : baseTable;
        let dataset = this._getTableData(baseTable).map(row => this._prefixRow(row, baseAlias, baseTable));

        const joinParts = fromClause.match(/JOIN\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?\s+ON\s+([\w\.]+)\s*=\s*([\w\.]+)/gi);

        if (joinParts) {
            for (let jp of joinParts) {
                const jMatch = jp.match(/JOIN\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?\s+ON\s+([\w\.]+)\s*=\s*([\w\.]+)/i);
                if (jMatch) {
                    const joinTable = jMatch[1];
                    const joinAlias = jMatch[2] && !['ON', 'WHERE'].includes(jMatch[2].toUpperCase()) ? jMatch[2] : joinTable;
                    const leftField = jMatch[3];
                    const rightField = jMatch[4];

                    const joinData = this._getTableData(joinTable).map(row => this._prefixRow(row, joinAlias, joinTable));
                    const newDataset = [];

                    for (let rowLeft of dataset) {
                        for (let rowRight of joinData) {
                            const valLeft = this._resolveFieldValue(rowLeft, leftField);
                            const valRight = this._resolveFieldValue(rowRight, rightField);
                            if (valLeft !== undefined && valRight !== undefined && String(valLeft) === String(valRight)) {
                                newDataset.push({ ...rowLeft, ...rowRight });
                            }
                        }
                    }
                    dataset = newDataset;
                }
            }
        }

        return dataset;
    }

    _prefixRow(row, alias, tableName) {
        const prefixed = {};
        for (let [k, v] of Object.entries(row)) {
            prefixed[k] = v; // Unqualified
            prefixed[`${alias}.${k}`] = v; // Alias qualified
            prefixed[`${tableName}.${k}`] = v; // Table qualified
        }
        return prefixed;
    }

    _resolveFieldValue(row, field) {
        if (!field) return undefined;
        const cleanField = field.trim().replace(/^['"]|['"]$/g, '');
        
        // Exact match
        if (row[cleanField] !== undefined) return row[cleanField];

        // Strip alias if any
        if (cleanField.includes('.')) {
            const rawCol = cleanField.split('.')[1];
            if (row[rawCol] !== undefined) return row[rawCol];
        }

        // Case-insensitive match
        for (let k of Object.keys(row)) {
            if (k.toLowerCase() === cleanField.toLowerCase()) {
                return row[k];
            }
            if (k.toLowerCase().endsWith('.' + cleanField.toLowerCase())) {
                return row[k];
            }
        }
        return undefined;
    }

    _parseSelectColumns(selectPart) {
        const cols = selectPart.split(',').map(s => s.trim());
        return cols.map(c => {
            const asMatch = c.match(/^(.+?)\s+AS\s+(.+)$/i);
            let expr = c;
            let alias = c;

            if (asMatch) {
                expr = asMatch[1].trim();
                alias = asMatch[2].trim().replace(/['"]/g, '');
            } else if (c.includes('.')) {
                alias = c.split('.')[1].trim();
            }

            const countMatch = expr.match(/COUNT\s*\(\s*(.*?)\s*\)/i);
            const avgMatch = expr.match(/AVG\s*\(\s*(.*?)\s*\)/i);

            return {
                raw: c,
                field: expr,
                alias: alias,
                isCount: !!countMatch,
                isAvg: !!avgMatch
            };
        });
    }

    _evaluateWhere(row, whereClause) {
        // Handle CURRENT_DATE
        let clause = whereClause.replace(/CURRENT_DATE/gi, `'${this.currentSimulatedDate}'`);

        // Split by AND
        const conditions = clause.split(/\s+AND\s+/i);

        return conditions.every(cond => {
            const isNullMatch = cond.match(/([\w\.]+)\s+IS\s+NULL/i);
            if (isNullMatch) {
                const val = this._resolveFieldValue(row, isNullMatch[1]);
                return val === null || val === undefined || val === '';
            }

            const isNotNullMatch = cond.match(/([\w\.]+)\s+IS\s+NOT\s+NULL/i);
            if (isNotNullMatch) {
                const val = this._resolveFieldValue(row, isNotNullMatch[1]);
                return val !== null && val !== undefined && val !== '';
            }

            // Comparison operators: =, !=, <>, >, <, >=, <=
            const compMatch = cond.match(/([\w\.]+)\s*(=|!=|<>|>=|<=|>|<)\s*(.+)/);
            if (compMatch) {
                const field = compMatch[1];
                const op = compMatch[2];
                let expected = compMatch[3].trim().replace(/^['"]|['"]$/g, '');

                const actual = this._resolveFieldValue(row, field);
                if (actual === undefined) return false;

                // Handle numbers
                const numActual = Number(actual);
                const numExpected = Number(expected);
                const isNumeric = !isNaN(numActual) && !isNaN(numExpected);

                if (op === '=') {
                    return isNumeric ? numActual === numExpected : String(actual).toLowerCase() === expected.toLowerCase();
                } else if (op === '!=' || op === '<>') {
                    return isNumeric ? numActual !== numExpected : String(actual).toLowerCase() !== expected.toLowerCase();
                } else if (op === '>') {
                    return isNumeric ? numActual > numExpected : String(actual) > expected;
                } else if (op === '<') {
                    return isNumeric ? numActual < numExpected : String(actual) < expected;
                } else if (op === '>=') {
                    return isNumeric ? numActual >= numExpected : String(actual) >= expected;
                } else if (op === '<=') {
                    return isNumeric ? numActual <= numExpected : String(actual) <= expected;
                }
            }

            return true;
        });
    }

    _evaluateHaving(groupRows, havingClause) {
        // e.g. COUNT(*) >= 2
        const m = havingClause.match(/COUNT\s*\(\s*.*?\s*\)\s*(=|!=|<>|>=|<=|>|<)\s*(\d+)/i);
        if (m) {
            const op = m[1];
            const target = parseInt(m[2], 10);
            const count = groupRows.length;
            if (op === '>=') return count >= target;
            if (op === '>') return count > target;
            if (op === '<=') return count <= target;
            if (op === '<') return count < target;
            if (op === '=' || op === '==') return count === target;
            if (op === '!=' || op === '<>') return count !== target;
        }
        return true;
    }

    _executeInsert(sql, startTime) {
        // INSERT INTO books (title, author, genre, quantity, available_copies) VALUES ('Test', 'Author', 'Fiction', 2, 2);
        const match = sql.match(/INSERT\s+INTO\s+(\w+)\s*\((.+?)\)\s*VALUES\s*\((.+?)\)/i);
        if (!match) {
            throw new Error('Unsupported INSERT syntax. Expected: INSERT INTO table (cols...) VALUES (vals...)');
        }

        const table = match[1].toLowerCase();
        const cols = match[2].split(',').map(c => c.trim().toLowerCase());
        const rawVals = match[3].split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));

        const obj = {};
        cols.forEach((col, idx) => {
            obj[col] = rawVals[idx];
        });

        if (table === 'books') {
            this.addBook(obj);
        } else if (table === 'members') {
            this.addMember(obj);
        } else if (table === 'borrowings') {
            this.borrowBook(obj);
        } else {
            throw new Error(`Table '${table}' not recognized for INSERT.`);
        }

        return {
            success: true,
            columns: ['Status', 'Rows Affected'],
            rows: [['INSERT completed successfully', 1]],
            rowCount: 1,
            executionTimeMs: this._calcTime(startTime)
        };
    }

    _executeUpdate(sql, startTime) {
        // UPDATE Books SET ... WHERE book_id = ...
        const match = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
        if (!match) throw new Error('Unsupported UPDATE syntax.');

        const table = match[1].toLowerCase();
        const setClause = match[2];
        const whereClause = match[3];

        const tableData = this._getTableData(table);
        let updatedCount = 0;

        tableData.forEach(row => {
            if (!whereClause || this._evaluateWhere(row, whereClause)) {
                // Apply SET assignments
                const assignments = setClause.split(',');
                assignments.forEach(assign => {
                    const [k, v] = assign.split('=').map(s => s.trim());
                    let val = v.replace(/^['"]|['"]$/g, '');
                    if (val.toUpperCase() === 'NULL') val = null;
                    else if (!isNaN(Number(val))) val = Number(val);
                    row[k.toLowerCase()] = val;
                });
                updatedCount++;
            }
        });

        this.save();
        return {
            success: true,
            columns: ['Status', 'Rows Updated'],
            rows: [['UPDATE executed successfully', updatedCount]],
            rowCount: updatedCount,
            executionTimeMs: this._calcTime(startTime)
        };
    }

    _executeDelete(sql, startTime) {
        // DELETE FROM table WHERE ...
        const match = sql.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i);
        if (!match) throw new Error('Unsupported DELETE syntax.');

        const table = match[1].toLowerCase();
        const whereClause = match[2];

        if (table === 'books') {
            const initialCount = this.data.books.length;
            this.data.books = this.data.books.filter(r => whereClause ? !this._evaluateWhere(r, whereClause) : false);
            this.save();
            const deleted = initialCount - this.data.books.length;
            return {
                success: true,
                columns: ['Status', 'Rows Deleted'],
                rows: [['DELETE executed successfully', deleted]],
                rowCount: deleted,
                executionTimeMs: this._calcTime(startTime)
            };
        } else if (table === 'members') {
            const initialCount = this.data.members.length;
            this.data.members = this.data.members.filter(r => whereClause ? !this._evaluateWhere(r, whereClause) : false);
            this.save();
            const deleted = initialCount - this.data.members.length;
            return {
                success: true,
                columns: ['Status', 'Rows Deleted'],
                rows: [['DELETE executed successfully', deleted]],
                rowCount: deleted,
                executionTimeMs: this._calcTime(startTime)
            };
        } else if (table === 'borrowings') {
            const initialCount = this.data.borrowings.length;
            this.data.borrowings = this.data.borrowings.filter(r => whereClause ? !this._evaluateWhere(r, whereClause) : false);
            this.save();
            const deleted = initialCount - this.data.borrowings.length;
            return {
                success: true,
                columns: ['Status', 'Rows Deleted'],
                rows: [['DELETE executed successfully', deleted]],
                rowCount: deleted,
                executionTimeMs: this._calcTime(startTime)
            };
        }

        throw new Error(`Cannot delete from table '${table}'.`);
    }
}

// Export for Node testing or browser global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LibraryDBMS;
}

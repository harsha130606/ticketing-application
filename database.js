const mysql = require('mysql');
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ticketing'
});

const sql = `ALTER TABLE bookings 
ADD COLUMN name VARCHAR(255),
ADD COLUMN email VARCHAR(255),
ADD COLUMN phone VARCHAR(20),
ADD COLUMN location VARCHAR(255),
ADD COLUMN movie VARCHAR(255),
ADD COLUMN theatre VARCHAR(255),
ADD COLUMN time VARCHAR(255);

`;

conn.query(sql, (err, res) => {
    if (err) {
        console.log('Failed to create table: ' + err);
        return;
    }
    console.log('Bookings table created successfully');
});

const express = require('express');
const cors = require('cors');
const bodyp = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(bodyp.json());

// Database connection
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ticketing'
});

// Nodemailer transporter
const transportobj = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'mulukuntlaharsha123@gmail.com', pass: 'kppw qpnh fkby npyn' }
});

// Register API
app.post("/register", async (req, res) => {
    const { name, email, phone, password, location } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `INSERT INTO users (name, email, phone, password, location) VALUES (?, ?, ?, ?, ?)`;

        conn.query(sql, [name, email, phone, hashedPassword, location], (err, result) => {
            if (err) {
                console.log('Failed to execute: ' + err);
                return res.status(500).send('Error occurred while registering');
            }

            const option = {
                from: "mulukuntlaharsha123@gmail.com",
                to: `${email}`,
                subject: "Registration Successful",
                text: `Hey ${name}, your registration for the ticketing app is successful. Enjoy our services!`
            };

            transportobj.sendMail(option, (err, info) => {
                if (err) {
                    console.log('Failed to send email');
                } else {
                    console.log('Email sent successfully');
                }
            });

            console.log('User inserted');
            return res.send("Registration successful");
        });
    } catch (error) {
        console.error('Error in registration: ', error);
        return res.status(500).send('Server error during registration');
    }
});

// Login API
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = `SELECT * FROM users WHERE email = ?`;
    conn.query(sql, [email], async (err, results) => {
        if (err) {
            console.log('Failed to execute: ' + err);
            return res.status(500).send("Server error");
        }

        if (results.length > 0) {
            const user = results[0];

            try {
                const isPasswordValid = await bcrypt.compare(password, user.password);

                if (isPasswordValid) {
                    console.log('Login success');

                    const option = {
                        from: "mulukuntlaharsha123@gmail.com",
                        to: `${email}`,
                        subject: "Login Detected",
                        text: `Hey ${user.name}, a new login was detected into your ticketing account.`
                    };

                    transportobj.sendMail(option, (err, info) => {
                        if (err) {
                            console.log('Failed to send email');
                        } else {
                            console.log('Email sent successfully');
                        }
                    });

                    return res.json({
                        message: "Login successful!",
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            location: user.location
                        }
                    });
                } else {
                    return res.status(401).send("Invalid email or password");
                }
            } catch (error) {
                console.error("Error comparing passwords: ", error); 
                return res.status(500).send("Server error during password verification");
            }
        } else {
            return res.status(401).send("Invalid email or password");
        }
    });
});

// Ticket Booking API
app.post("/bookings", (req, res) => {
    const { user_id, name, email, phone, location, movie, theatre, time, seats } = req.body;

    const seat_number = seats.join(", ");

    const sql = `INSERT INTO bookings (user_id, name, email, phone, location, movie, theatre, time, seat_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    conn.query(sql, [user_id, name, email, phone, location, movie, theatre, time, seat_number], (err, result) => {
        if (err) {
            console.log('Failed to insert booking: ' + err);
            return res.status(500).send('Error occurred while booking');
        }

        const bookingDetails = `
            Booking Confirmation:
            Movie: ${movie}
            Theatre: ${theatre}
            Show Time: ${time}
            Seats: ${seat_number}
        `;

        const mailOptions = {
            from: "mulukuntlaharsha123@gmail.com",
            to: `${email}`,
            subject: "Ticket Booking Confirmation",
            text: `Hey ${name}, your ticket has been successfully booked!\n\n${bookingDetails}\n\nEnjoy your show!`
        };

        transportobj.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log('Failed to send booking email');
            } else {
                console.log('Booking email sent successfully');
            }
        });

        console.log('Booking inserted successfully');
        return res.send("Booking successful and confirmation email sent");
    });
});



// Server start
app.listen(4000, () => {
    console.log('Application running on http://localhost:4000/');
});

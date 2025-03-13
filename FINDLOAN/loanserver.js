const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname)));

const LOAN_DATA_FILE = 'loans.json';

// Helper function to read loans from the JSON file
const readLoansFromFile = () => {
    if (fs.existsSync(LOAN_DATA_FILE)) {
        const data = fs.readFileSync(LOAN_DATA_FILE);
        return JSON.parse(data);
    }
    return {};
};

// Helper function to write loans to the JSON file
const writeLoansToFile = (loans) => {
    fs.writeFileSync(LOAN_DATA_FILE, JSON.stringify(loans, null, 2));
};

// Initialize loans as an object
let loans = readLoansFromFile();

// API Endpoints
app.post('/api/loans', (req, res) => {
    const { token, firstname, lastname, email, phoneNumber, address, coborrowerName, piDue, paymentDueDate, pastDue, escrowDue, totalPaymentDue } = req.body;

    if (!token || !firstname || !lastname || !phoneNumber || !address || !coborrowerName || !piDue || !paymentDueDate || !pastDue || !escrowDue || !totalPaymentDue) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const fullname = `${firstname} ${lastname}`; // Create fullname from firstname and lastname

    const loan = {
        id: (loans[token] ? loans[token].length : 0) + 1, // Incremental ID for each loan under the same token
        token,
        firstname,
        lastname,
        fullname,
        email,
        phoneNumber,
        address,
        coborrowerName,
        piDue,
        paymentDueDate,
        pastDue,
        escrowDue,
        totalPaymentDue,
        createdAt: new Date()
    };

    // Initialize the token array if it doesn't exist
    if (!loans[token]) {
        loans[token] = [];
    }

    loans[token].push(loan); // Push the loan into the correct token's array
    writeLoansToFile(loans); // Save to file
    res.status(201).json(loan);
});


app.get('/api/loans', (req, res) => {
    res.json(loans);
});

app.listen(PORT, () => {
    console.log(`Loan server is running on port ${PORT}`);
});

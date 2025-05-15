const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let savedRecords = [];

app.post('/api/records/upload', (req, res) => {
    const { records } = req.body;
    console.log('Received records:', records);
    savedRecords.push(...records);
    res.json({ message: 'Records received successfully' });
});

app.get('/api/records', (req, res) => {
    res.json(savedRecords);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});

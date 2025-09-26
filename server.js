
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const {connectDB, getDbStatus} = require('./db');
const performance = require('./middlewares/performance');
const eventsV1 = require('./routes/v1/events');

const app = express();
app.set('trust proxy', true);
app.use(express.json({limit: '1mb'}));
app.use(performance);

app.get('/', (req, res) => res.send('Hola Mundo'));

// Health
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        db: getDbStatus(),
        timestamp: new Date().toISOString()
    });
});

// API v1
app.use('/api/v1/events', eventsV1);

// 404 Not Found
app.use((req, res) => {
    res.status(404).json({code: 'NF', message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`});
});

//Error Handler
app.use((err, req, res, next) => {
    console.log('Unhandled Error: ', err);
    res.status(err.status || 500).json({code: 'ER', message: err.message || 'Internal Server Error'});
});

const PORT = Number(process.env.PORT || 3030);

(async () => {
    await connectDB(); 
    app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
})();

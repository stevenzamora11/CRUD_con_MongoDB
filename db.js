const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const {MONGODB_URI, NODE_ENV = 'development'} = process.env;

mongoose.set('strictQuery', true);

const options = {
    autoIndex: NODE_ENV !== 'production',
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000
};

function attachEvents(conn) {
    conn.on('connected', () => console.log('✅ MongoDB connected'));
    conn.on('open', () => console.log('🔓 MongoDB open'));
    conn.on('reconnected', () => console.log('🔁 MongoDB reconnected'));
    conn.on('disconnected', () => console.log('⚠️ MongoDB disconnected'));
    conn.on('error', err => console.error('❌ MongoDB error: ', err.message));
};

function getDbStatus() {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return states[mongoose.connection.readyState] || 'unknown';
};

async function connectDB() {
    if(!MONGODB_URI) throw new Error('MONGODB_URI no definido en .env');
    attachEvents(mongoose.connection);
    await mongoose.connect(MONGODB_URI, options);
    console.log('Using DB: ', MONGODB_URI.split('@').pop());
};

async function closeDB() {
    await mongoose.connection.close();
};

module.exports = {connectDB, closeDB, getDbStatus};

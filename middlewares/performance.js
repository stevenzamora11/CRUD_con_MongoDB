
const {randomUUID} = require('crypto');

module.exports = (req, res, next) => {
    const started = process.hrtime.bigint();
    const rid = req.headers['x-request-id'] || randomUUID();

    console.log(`[REQ] id=${rid} ${req.method} ${req.originalUrl} query=${JSON.stringify(req.query || {})}`);

    res.on('finish', () => {
        const ms = Number(process.hrtime.bigint() - started) / 1e6;
        console.log(`[RES] id=${rid} status=${res.statusCode} duration_ms=${ms.toFixed(2)}`);
    });

    req.requestId = rid;
    next();
};

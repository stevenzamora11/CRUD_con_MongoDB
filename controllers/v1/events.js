
const {validationResult} = require('express-validator');
const Event = require('../../schemas/event');

const bail400 = (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return res.status(400).json({code: 'BR', message: 'Parámetros inválidos', errors: errors.array()});
};

exports.list = async (req, res) => {
    const bad = bail400(req, res); if (bad) return;

    const page  = Math.max(parseInt(req.query.page  || '1', 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit || '10', 10) || 10, 1);
    const sortBy = req.query.sort || 'fecha'; // fecha|monto
    const order  = (req.query.order || 'desc') === 'asc' ? 1 : -1;

    const filter = {};

    if (req.query.type === 'ingreso' || req.query.type === 'egreso') {
        filter.type = req.query.type;
    }

    if (req.query.year || req.query.month) {
        const y = parseInt(req.query.year  || `${new Date().getUTCFullYear()}`, 10);
        const m = req.query.month ? parseInt(req.query.month, 10) : undefined;

        if (!Number.isNaN(y)) {
            if (m && !Number.isNaN(m) && m >= 1 && m <= 12) {
                const from = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0)); // 1ro del mes 
                const to   = new Date(Date.UTC(y, m,     1, 0, 0, 0, 0)); // 1ro mes siguiente 
                filter.date = { $gte: from, $lt: to };
            } else if (!m) {
                const from = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
                const to   = new Date(Date.UTC(y + 1, 0, 1, 0, 0, 0, 0));
                filter.date = { $gte: from, $lt: to };
            }
        }
    }

    if (req.query.min || req.query.max) {
        filter.amount = {};
        if (req.query.min) filter.amount.$gte = Number(req.query.min);
        if (req.query.max) filter.amount.$lte = Number(req.query.max);
    }

    const sortMap = { fecha: 'date', monto: 'amount' };
    const sortObj = { [sortMap[sortBy] || 'date']: order };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        Event.find(filter).sort(sortObj).skip(skip).limit(limit).lean().exec(),
        Event.countDocuments(filter)
    ]);

    return res.status(200).json({
        code: 'OK',
        message: 'Lista de Events',
        page, limit, total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        data: items
    });
};


exports.getById = async (req, res) => {
    const bad = bail400(req, res); if(bad) return;

    const event = await Event.findById(req.params.id).lean().exec();
    if(!event) return res.status(404).json({code: 'NF', message: 'Event no encontrado'});
    
    res.status(200).json({code: 'OK', message: 'Event encontrado', data: {event}});
};

exports.create = async (req, res) => {
    const bad = bail400(req, res); if(bad) return;

    const doc = await Event.create({
        name: String(req.body.name).trim(),
        description: (req.body.description ?? '').toString().trim(),
        amount: Number(req.body.amount),
        type: req.body.type,
        date: new Date(req.body.date)
    });
    res.status(201).json({code: 'OK', message: 'Event Creado', data: {event: doc}});
};

exports.update = async (req, res) => {
    const bad = bail400(req, res); if(bad) return;

    const patch = {};
    if(req.body.name !== undefined) patch.name = String(req.body.name).trim();
    if(req.body.description !== undefined) patch.description = String(req.body.description).trim();
    if(req.body.type !== undefined) patch.type = req.body.type;
    if(req.body.amount !== undefined) patch.amount = Number(req.body.amount);
    if(req.body.date !== undefined) patch.date = new Date(req.body.date);

    const updated = await Event.findByIdAndUpdate(req.params.id, patch, {new: true, runValidators: true});
    if(!updated) return res.status(404).json({code: 'NF', message: 'Event no encontrado'});

    res.status(200).json({code: 'OK', message: 'Event actualizado', data: {event: updated}});
};

exports.remove = async (req, res) => {
    const bad = bail400(req, res); if(bad) return;

    const deleted = await Event.findByIdAndDelete(req.params.id);
    if(!deleted) return res.status(404).json({code: 'NF', message: 'Event no encontrado'});

    res.status(204).send();
};

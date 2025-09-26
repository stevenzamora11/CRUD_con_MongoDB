
const router = require('express').Router();
const {body, param, query} = require('express-validator');
const ctrl = require('../../controllers/v1/events');

router.get(
    '/',
    [
        query('page').optional().isInt({min: 1}),
        query('limit').optional().isInt({min: 1, max: 100}),
        query('month').optional().isInt({min: 1, max: 12}),
        query('year').optional().isInt({min: 2010, max: 2050}),
        query('type').optional().isIn(['ingreso', 'egreso']),
        query('sort').optional().isIn(['fecha', 'monto']),
        query('order').optional().isIn(['asc', 'desc']),
        query('min').optional().isFloat({min: 0}),
        query('max').optional().isFloat({min: 0})
    ],
    ctrl.list
);

router.get('/:id', [param('id').isMongoId().withMessage('id debe ser ObjectId')], ctrl.getById);

router.post(
    '/',
    [
        body('name').trim().notEmpty().isLength({max: 40}),
        body('description').optional().isString().isLength({max: 200}),
        body('amount').exists().isFloat({gt: 0}),
        body('type').isIn(['ingreso', 'egreso']),
        body('date').exists().isISO8601()
    ],
    ctrl.create
);

router.put(
    '/:id',
    [
        param('id').isMongoId(),
        body('name').optional().trim().notEmpty().isLength({max: 40}),
        body('description').optional().isString().isLength({max: 200}),
        body('amount').optional().isFloat({gt: 0}),
        body('type').optional().isIn(['ingreso', 'egreso']),
        body('date').optional().isISO8601()
    ],
    ctrl.update
);

router.delete('/:id', [param('id').isMongoId()], ctrl.remove);

module.exports = router;

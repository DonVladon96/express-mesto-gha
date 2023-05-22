const router = require('express').Router();

const {getCard, createCard, cardDelete} = require('../controllers/cards');

router.get('/cards', getCard);
router.delete('/cards/:id', cardDelete);
router.post('/cards', createCard);


module.exports = router;
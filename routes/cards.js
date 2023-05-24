const router = require('express').Router();

const {
  getCard, createCard, cardDelete, likeCard, dislikeCard,
} = require('../controllers/cards');

router.get('/cards', getCard);
router.delete('/cards/:id', cardDelete);
router.post('/cards', createCard);
router.put('/cards/:cardId/likes', likeCard);
router.delete('/cards/:cardId/likes', dislikeCard);

module.exports = router;

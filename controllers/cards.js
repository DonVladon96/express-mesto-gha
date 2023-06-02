const { Error } = require('mongoose');
const http2 = require('http2');
const Card = require('../models/card');

const {
  HTTP_STATUS_CREATED,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_FORBIDDEN,
  HTTP_STATUS_OK,
} = http2.constants;

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      res.send(cards);
    })
    .catch(() => res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Server Error' }));
};

module.exports.createCard = (req, res) => {
  console.log(req.user);
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(HTTP_STATUS_CREATED).send(card))
    .catch((err) => {
      if (err instanceof Error.ValidationError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Error data for created card.' });
        return;
      }
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Server error.' });
    });
};

module.exports.cardDelete = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId)
    .orFail()
    .then((card) => {
      if (card.owner.toString() !== req.user._id) {
        return (res.status(HTTP_STATUS_FORBIDDEN).send({ message: 'You can`t delete card' }));
      }

      return card;
    })
    .then((card) => Card.deleteOne(card))
    .then(() => res.status(HTTP_STATUS_OK).send({ message: 'Card delete succsessfull' }))
    .catch((err) => {
      if (err instanceof Error.DocumentNotFoundError) {
        res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Card id is not a found.' });
        return;
      }

      if (err instanceof Error.CastError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные для удаления карточки.' });
        return;
      }

      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Server error' });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  ).orFail()
    .then((card) => res.send(card))
    .catch((err) => {
      if (err instanceof Error.DocumentNotFoundError) {
        res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Card id is not a found.' });
        return;
      }

      if (err instanceof Error.CastError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Card id is not a found.' });
        return;
      }

      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Server errorr.' });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  ).orFail()
    .then((card) => {
      if (!card) {
        return (res.status(HTTP_STATUS_BAD_REQUEST).send({ message: `Card Id: ${req.params.cardId} is not found` }));
      }

      return res.status(200)
        .send(card);
    })
    .catch((err) => {
      if (err instanceof Error.DocumentNotFoundError) {
        res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Card id is not a found.' });
        return;
      }

      if (err instanceof Error.CastError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Card dislike data error.' });
        return;
      }

      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Server error.' });
    });
};

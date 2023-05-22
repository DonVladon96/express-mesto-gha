const Card = require('../models/card');

module.exports.getCard = (req, res) => {
  Card.find({})
    .then((cards) => {
      res.send(cards);
    })
    .catch(() => res.status(500).send({ message: 'Ошибка запроса.' }));
};

module.exports.createCard = (req, res) => {
  console.log(req.user)
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при создании карточки.' });
        return;
      }
      res.status(500).send({ message: 'Ошибка запроса.' });

    });
};

module.exports.cardDelete = (req, res) => {
  Card.findByIdAndRemove(req.params.id)
    .orFail(new Error('cardNotFound'))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.message === 'cardNotFound') {
        res.status(404).send({ message: 'Карточка с указанным _id не найдена.' });
        return;
      }

      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Переданы некорректные данные для удаления карточки.' });
        return;
      }

      res.status(500).send({ message: 'Ошибка запроса.' });
    });
};
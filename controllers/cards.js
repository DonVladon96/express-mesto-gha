const Card = require('../models/card');

module.exports.getCard = (req, res) => {
  Card.find({})
    .then((cards) => {
      res.send(cards);
    })
    .catch(() => res.status(500).send({ message: 'Server Error' }));
};

module.exports.createCard = (req, res) => {
  console.log(req.user);
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err) {
        res.status(400).send({ message: 'Error data for created card.' });
        return;
      }
      res.status(500).send({ message: 'Server error.' });
    });
};

module.exports.cardDelete = (req, res) => {
  Card.findByIdAndRemove(req.params.id)
    .orFail(new Error('cardNotFound'))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err) {
        res.status(404).send({ message: 'Card id is not a found.' });
        return;
      }

      if (err) {
        res.status(400).send({ message: 'Переданы некорректные данные для удаления карточки.' });
        return;
      }

      res.status(500).send({ message: 'Server error' });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => res.send(card))
    .catch((err) => {
      if (err) {
        res.status(404).send({ message: 'Card id is not a found.' });
        return;
      }

      if (err) {
        res.status(400).send({ message: 'Card id is not a found.' });
        return;
      }

      res.status(500).send({ message: 'Server errorr.' });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => res.send(card))
    .catch((err) => {
      if (err) {
        res.status(404).send({ message: 'Card id is not a found.' });
        return;
      }

      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Card dislike data error.' });
        return;
      }

      res.status(500).send({ message: 'Server error.' });
    });
};

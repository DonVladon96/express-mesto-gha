const express = require('express');

const router = express.Router();


// REST

// GET
// POST
// DELETE
// PATCH
// PUT

// CRUD

const {getUsers, getUserById, createUser} = require('../controllers/users')

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);


// router.get('/users', (req, res) => {
//   res.send('All users');
// });

// router.post('/users', (req, res) => {
//   res.send('User created');
// });

// router.get('/users/:userId', (req, res) => {
//   res.send('One user');
// });


// router.delete('/users/:userId', (req, res) => {
//   res.send('Deleted');
// });

// router.patch('/user/:userId', (req, res) => {
//   res.send('User updateed');
// });

module.exports = router;

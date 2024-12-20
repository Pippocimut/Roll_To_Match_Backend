const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');

const PostController = require('../controllers/PostController');
const topics = require('../types').topics;
const { validation } = require('../middlewares/validationMiddleware');
const activityRouter = require('./activity');
const postStatus = require('../types').postStatus;

const postBody = [
    body('title').isLength({ min: 5 }),
    body('topic').isIn(topics),
    body('message').isLength({ min: 10 })
];

const searchParams = [
    query('topic').isIn(topics).optional(),
    query('status').isIn(Object.values(postStatus)).optional(),
    query('highestInterest').isBoolean().optional()
];

router.get('/', validation(searchParams), PostController.getPosts);
router.get('/:id', PostController.getPost);
router.post('/', validation(postBody), PostController.createPost);
router.patch('/:id', validation(postBody), PostController.updatePost);
router.delete('/:id', PostController.deletePost);

router.use('/activity', activityRouter);

module.exports = router;
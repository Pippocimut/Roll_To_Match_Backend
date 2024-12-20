const express = require('express')
const router = express.Router()

router.use((err, req, res, next) => {
    console.error(err.stack);

    if (err instanceof SyntaxError) {
        return res.status(400).json({ error: 'Invalid JSON' });
    }

    if (err.status) {
        return res.status(err.status).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal server error' });
});

module.exports = router
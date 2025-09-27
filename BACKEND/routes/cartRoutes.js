const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middlewares/authMiddleware'); // assuming JWT auth middleware

router.get('/', auth, cartController.getCart);
router.get('/draft-orders', cartController.getDraftCarts);
router.post('/add', auth, cartController.addToCart);
router.get('/get-draft-count', cartController.getDraftCartCount);
router.delete('/remove/:cartId', auth, cartController.removeFromCart);
router.put('/update/:cartId', auth, cartController.updateCart);
router.get('/drafts/user/:userId', cartController.getAllDraftCartsByUser);

module.exports = router;

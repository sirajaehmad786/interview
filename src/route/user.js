var express = require('express');
var router = express.Router();
const userController = require('../controller/user');
const { validate, userValidation } = require("../../services/validation/validation");
const authMiddleware = require("../middlewares/authMiddleware");


router.post('/register', validate(userValidation),userController.register)
router.post('/allUser', userController.getAllUsers)
router.get('/edit/:id', userController.getUserById)
router.put('/update/:id', userController.updateUser)
router.delete('/delete/:id', userController.deleteUser)
router.post('/login', userController.login)
router.post('/user-access', authMiddleware,userController.checkUserAccess)
router.patch('/update-many-user',authMiddleware,userController.updateManyUsers)
router.patch('/update-multiple-user',authMiddleware,userController.updateMultipleUsers)


module.exports = router;

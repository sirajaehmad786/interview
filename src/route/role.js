var express = require('express');
var router = express.Router();
const roleController = require('../controller/role');
const { validate, roleValidation } = require("../../services/validation/validation");

router.post('/add', validate(roleValidation),roleController.createRole)
router.get('/fetch', roleController.getAllRoles)
router.get('/edit/:id', roleController.getRoleById)
router.put('/update/:id', roleController.updateRole)
router.delete('/delete/:id', roleController.deleteRole)
router.patch('/addModules/:id', roleController.updateAccessModule)
router.delete('/removeModules/:id', roleController.removeAccessModule)


module.exports = router;

const Role = require("../models/role");
const message = require("../../config/message.json");

exports.createRole = async (req, res, next) => {
  try {
    const { roleName, accessModule } = req.body;
    if (!roleName || !Array.isArray(accessModule)) {
      return res
        .status(400)
        .json({ status: false, message: message.ROLE.INAVALIDDATA });
    }
    const existingRole = await Role.findOne({ roleName });
    if (existingRole) {
      return res.status(400).json({
        status: false,
        message: message.ROLE.ROLE_NAME_EXISTS,
      });
    }
    const newRole = new Role({
      roleName,
      accessModule,
    });
    await newRole.save();
    res
      .status(201)
      .json({ status: true, message: message.ROLE.CREATED, data: newRole });
  } catch (error) {
    return res
      .status(500)
      .send({ status: false, message: message.ERRORS.GENERAL });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isDeleted: false }).select("-__v");
    res
      .status(200)
      .json({ status: true, message: message.ROLE.FETCHED, data: roles });
  } catch (error) {
    return res
      .status(500)
      .send({ status: false, message: message.ERRORS.GENERAL });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id).select("-__v");

    if (!role) {
      return res
        .status(400)
        .json({ status: false, message: message.ROLE.ROLE_NOT_FOUND });
    }
    res
      .status(200)
      .json({ status: true, message: message.ROLE.ROLE_GET_BY_ID, data: role });
  } catch (error) {
    res.status(500).json({ status: 0, message: message.ERRORS.GENERAL });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleName, accessModule, isActive } = req.body;

    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res
        .status(400)
        .json({ status: false, message: message.ROLE.ROLE_NOT_FOUND });
    }

    const duplicateRole = await Role.findOne({ roleName, _id: { $ne: id } });
    if (duplicateRole) {
      return res
        .status(400)
        .json({ status: false, message: message.ROLE.ROLE_NAME_EXISTS });
    }

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { roleName, accessModule, isActive },
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: message.ROLE.ROLE_UPDATED,
      data: updatedRole,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ status: false, message: message.ERRORS.GENERAL });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRole = await Role.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedRole) {
      return res
        .status(400)
        .json({ status: false, message: message.ROLE.ROLE_NOT_FOUND });
    }

    res.status(200).json({ status: true, message: message.ROLE.ROLE_DELETED });
  } catch (error) {
    res.status(500).json({ status: false, message: message.ERRORS.GENERAL });
  }
};

exports.updateAccessModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { newModules } = req.body;

    if (!Array.isArray(newModules) || newModules.length === 0) {
      return res
        .status(400)
        .json({ status: false, message: message.ROLE.INVALID_MODULE });
    }

    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res
        .status(404)
        .json({ status: false, message: message.ROLE.ROLE_NOT_FOUND });
    }

    const duplicateModules = newModules.filter((module) =>
      existingRole.accessModule.includes(module)
    );

    if (duplicateModules.length > 0) {
      return res.status(400).json({
        status: false,
        message: `modules already exist: ${duplicateModules.join(", ")}`,
      });
    }

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { $addToSet: { accessModule: { $each: newModules } } },
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: message.ROLE.ACCESS_MODULE_ADD,
      data: updatedRole,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: message.ERRORS.GENERAL,
      error: error.message,
    });
  }
};

exports.removeAccessModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { modulesToRemove } = req.body;

    if (!Array.isArray(modulesToRemove) || modulesToRemove.length === 0) {
      return res
        .status(400)
        .json({ status: false, message: message.ROLE.INVALID_MODULE });
    }

    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({ status: false, message: message.ROLE.ROLE_NOT_FOUND });
    }

    const nonExistentModules = modulesToRemove.filter(
      (module) => !existingRole.accessModule.includes(module)
    );
    if (nonExistentModules.length === modulesToRemove.length) {
      return res.status(400).json({
        status: false,
        message: `None of the provided modules exist in the role: ${nonExistentModules.join(
          ", "
        )}`,
      });
    }

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { $pull: { accessModule: { $in: modulesToRemove } } },
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: message.ROLE.ACCESS_MODULE_REMOVED,
      data: updatedRole,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        status: false,
        message: "Something went wrong",
        error: error.message,
      });
  }
};

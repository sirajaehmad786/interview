const User = require("../models/user");
const Role = require("../models/role");
const { hashPassword, comparePassword } = require("../../utils/hashPassword");
const message = require("../../config/message.json");
const { generateToken } = require("../../utils/jwt");

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, roleId } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, message: message.USER.EMAIL_EXISTS });
    }
    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      roleId,
    });
    await newUser.save();
    res.status(201).json({
      status: true,
      message: message.USER.USER_REGISTER,
      data: newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: message.ERRORS.GENERAL });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("roleId", "roleName");
    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: message.USER.INVALID_CREDENCIAL });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ status: false, message: message.USER.INACTIVE_ACCOUNT });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: false, message: message.USER.INVALID_PASSWORD });
    }

    const token = generateToken(user);
    res.status(200).json({
      status: true,
      message: message.USER.LOGIN_SUCCESS,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.roleId.roleName,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: message.ERRORS.GENERAL,
      error: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { search } = req.body;

    let filter = { isDeleted: false };
    if (search) {
      const regex = new RegExp("^" + search, "i");
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
      ];
    }
    const users = await User.find(filter)
      .populate("roleId", "roleName accessModule")
      .exec();

    if (users.length === 0) {
      return res.status(404).json({
        status: false,
        message: message.USER.USER_SEARCH_NOT_FOUND,
        data: [],
      });
    }

    res.status(200).json({
      status: true,
      message: message.USER.USER_FETCH,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: message.ERRORS.GENERAL,
      error: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "roleId",
      "roleName accessModule"
    );
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: message.USER.USER_NOT_FOUND });
    }
    res
      .status(200)
      .json({ status: true, message: message.USER.USER_FETCH, data: user });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: message.ERRORS.GENERAL,
      error: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, roleId, isActive } = req.body;
    const { id } = req.params;

    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, message: message.USER.EMAIL_EXISTS });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, email, roleId, isActive },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ status: false, message: message.USER.USER_NOT_FOUND });
    }

    res.status(200).json({
      status: true,
      message: message.USER.USER_UPDATE,
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: message.ERRORS.GENERAL,
      error: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!deletedUser) {
      return res
        .status(400)
        .json({ status: false, message: message.USER.USER_NOT_FOUND });
    }
    res.status(200).json({ status: true, message: message.USER.USER_DELETE });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: message.ERRORS.GENERAL });
  }
};

exports.checkUserAccess = async (req, res) => {
  try {
    const { userId } = req.user;
    const { accessToModule } = req.body;

    if (!accessToModule || typeof accessToModule !== "string") {
      return res.status(400).json({
        status: false,
        message: message.ROLE.ACCESS_MODULE_REQUIRED,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: message.USER.USER_NOT_FOUND });
    }

    const role = await Role.findById(user.roleId);
    if (!role) {
      return res
        .status(404)
        .json({ status: false, message: message.ROLE.ROLE_NOT_FOUND });
    }

    const formattedAccessToModule = accessToModule.toLowerCase();
    const roleModulesLowercase = role.accessModule.map((module) =>
      module.toLowerCase()
    );

    if (!roleModulesLowercase.includes(formattedAccessToModule)) {
      return res.status(403).json({
        status: false,
        message: `Access denied. You do not have permission for '${accessToModule}'.`,
      });
    }

    return res.status(200).json({
      status: true,
      message: `You have permission for '${accessToModule}'.`,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: message.ERRORS.GENERAL });
  }
};

exports.updateManyUsers = async (req, res) => {
  try {
    const { ids, lastName, firstName } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ status: false, message: message.USER.IS_USERID_ARRAY });
    }

    if (!lastName && !firstName) {
      return res.status(400).json({
        status: false,
        message: message.USER.FIRSTNAME_OR_LASTNAME_UPDATE,
      });
    }

    if (lastName && firstName) {
      return res
        .status(400)
        .json({ status: false, message: message.USER.NO_BOTH });
    }

    let updateData = {};
    if (lastName) {
      updateData.lastName = lastName;
    } else if (firstName) {
      updateData.firstName = firstName;
    }

    const validUsers = await User.find({ _id: { $in: ids } });

    const validIds = validUsers.map((user) => user._id.toString());
    const invalidIds = ids.filter((id) => !validIds.includes(id));

    if (invalidIds.length > 0) {
      return res.status(404).json({
        status: false,
        message: message.USER.USERID_INVALID,
        invalidIds: invalidIds,
      });
    }

    const result = await User.updateMany(
      { _id: { $in: validIds } },
      { $set: updateData }
    );

    if (result.modifiedCount > 0) {
      return res.status(200).json({
        status: true,
        message: `${result.modifiedCount} users updated successfully.`,
      });
    } else {
      return res.status(404).json({
        status: false,
        message: message.USER.USER_CHANGE_NOT_FOUND,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: message.ERRORS.GENERAL,
      error: error.message,
    });
  }
};

exports.updateMultipleUsers = async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res
        .status(400)
        .json({ status: false, message: message.USER.USER_ARRAY_REQUIRED });
    }

    const allowedFields = ["firstName", "lastName", "email", "isActive"];
    const bulkOperations = [];
    const invalidIds = [];
    const invalidFields = [];

    for (const user of users) {
      const { id, updateData } = user;

      if (
        !id ||
        typeof updateData !== "object" ||
        Object.keys(updateData).length === 0
      ) {
        invalidIds.push(id);
        continue;
      }

      const invalidKeys = Object.keys(updateData).filter(
        (key) => !allowedFields.includes(key)
      );
      if (invalidKeys.length > 0) {
        invalidFields.push({ id, invalidKeys });
        continue;
      }

      bulkOperations.push({
        updateOne: {
          filter: { _id: id },
          update: { $set: updateData },
        },
      });
    }

    if (bulkOperations.length === 0) {
      return res
        .status(400)
        .json({
          status: false,
          message: message.USER.NO_VALID_UPDATE_USER,
          invalidFields,
          invalidIds,
        });
    }

    const result = await User.bulkWrite(bulkOperations);
    return res.status(200).json({
      status: true,
      message: `${result.modifiedCount} users updated successfully.`,
      invalidIds: invalidIds.length > 0 ? invalidIds : undefined,
      invalidFields: invalidFields.length > 0 ? invalidFields : undefined,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: message.ERRORS.GENERAL,
    });
  }
};

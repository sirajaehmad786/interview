const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstName: { 
            type: String, 
            required: true, 
            trim: true 
        },
        lastName: { 
            type: String, 
            required: true, 
            trim: true 
        },
        email: { 
            type: String, 
            required: true, 
            unique: true, 
            trim: true 
        },
        password: { 
            type: String, 
            required: true 
        },
        roleId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "roleData", 
            required: true 
        },
        isActive: { 
            type: Boolean, 
            default: true 
        },
        isDeleted: { 
            type: Boolean, 
            default: false 
        }
      },
      { timestamps: true }
);


const userData = mongoose.model("userData", userSchema);
module.exports = userData;

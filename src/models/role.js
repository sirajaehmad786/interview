const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    roleName: { 
        type: String,
        require:true
    },
    accessModule: { 
        type: [String],
        require:true 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
    },
});

const roleData = mongoose.model("roleData", roleSchema);
module.exports = roleData;

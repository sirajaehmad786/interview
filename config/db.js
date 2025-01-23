const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/interviewDatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => { console.log("connection success ") })
    .catch((err) => { console.log(`  NOT A CONNECT ${err}`) })

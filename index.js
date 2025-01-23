require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./config/db");

const app = express();
const roleRouter = require("./src/route/role");
const userRouter = require("./src/route/user");

app.use(express.json());
app.use(cors());

app.use("/api/role", roleRouter);
app.use("/api/user", userRouter);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

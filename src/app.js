const express = require("express");
require("./db/mongoose.js")
const users = require("./routes/user.js")
const tasks = require("./routes/task.js")

const port = process.env.PORT
const app = express();
app.use(express.json());


app.use("/users", users)
app.use("/tasks", tasks)


app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})
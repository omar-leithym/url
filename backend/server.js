const express = require("express")
const cors = require("cors")
const path = require("path")
const User = require("./models/user")
const mongoose = require("mongoose")
const app = express()
require("dotenv").config();
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use("/", require("./routers/linkRoutes.js"))
app.use("/api/users", require("./routers/userRoutes"))

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then((result) => {
    app.listen(3001, () => {
        console.log("server is running")
    })
}).catch((err) => {
    console.log(err)
})


if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/client/build')))
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend/client/build', 'index.html'))
    })
} else {
    app.get('/', (req,res) => res.send('Please set to production'))
}

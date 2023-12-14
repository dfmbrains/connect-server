require('dotenv').config()

const express = require('express')
const cors = require('cors');

const corsOptions = require('./src/config/corsOptions');
const credentials = require("./src/middleware/credentials");
const verifyJWT = require("./src/middleware/verifyJWT");

const PORT = process.env.PORT
const ROOT_ENDPOINT = process.env.ROOT_ENDPOINT

const app = express()

app.use(cors(corsOptions));
app.use(credentials);

app.use(express.json())

//open
app.use(`/${ROOT_ENDPOINT}/identity`, require("./src/routes/identity.routes"))
//auth
app.use(verifyJWT)
app.use(`/${ROOT_ENDPOINT}/profile`, require("./src/routes/profile.routes"))
app.use(`/${ROOT_ENDPOINT}/posts`, require("./src/routes/posts.routes"))
app.use(`/${ROOT_ENDPOINT}/files`, require("./src/routes/files.routes"))
app.use(`/${ROOT_ENDPOINT}/subscribe`, require("./src/routes/subscribe.routes"))

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`))

module.exports = app
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const cookieParser = require('cookie-parser');
app.use(express.json())
app.use(cookieParser());
app.use(cors())
const indexRouter = require('./routes/index.router.js');
app.use('/',indexRouter)


app.listen(port, () => {
    console.log('Servidor Express escuchando en el puerto', port);
});

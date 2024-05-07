const express = require('express');
const morgan = require('morgan');
const app = express();

app.use((req,res,next) => {
 console.log("Petición al server")+ new Date();
    next();
})

app.use(morgan('combined'))
app.get("/", (req,res, next) => {
    res.send("Contestando a Get desde ServExpress");
});

app.post("/", (req,res, next) => {
    res.send("Hola");
})
app.listen(3000, () =>{
    console.log("Servidor Express escuando en puerto 3000")
})
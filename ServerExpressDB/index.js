const express = require('express');
const morgan = require('morgan');
const app = express();
const port = process.env.PORT||3000;

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
app.listen(port, () =>{
    console.log(`Servidor Express escuando en puerto ${port}`)
})
const express = require('express');
const app = express();
const bodyParser = require("body-parser"); 


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true}));


app.get("/",(req,res)=>{
    res.send("jimmy");
});


app.get('/hello/:name',(req,res) => {
    res.send("hello " + req.params.name);
});

app.get('/hi/:name/:age',(req,res) =>{
    const name = req.params.name;
    const age = req.params.age;

    
    res.send("name " + name + "age = " + age);
});
//เพิ่ม เส้น api

app.post("/hello",(req,res) => {
    res.send(req.body);
});

app.put("/myPut",(req,res) =>{
    res.send(req.body);
});

app.delete("/myDelete/:id",(req,res) =>{
    res.send("my delete id ="+req.params.id);
});

app.put("/updateCustomer/:id",(req,res) => {
    const id = req.params.id;
    const data = req.body;

    //ส่งออกเป็น  json ได้
    res.send({id: id,data:data});
});

app.listen(3000);
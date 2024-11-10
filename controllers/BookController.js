const express = require("express");
const book = express.Router();


//GET :{url} /book/list   submodule
book.get("/list",(req,res)=>{
    res.send("hello book list");

});





module.exports = book;
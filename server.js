const express = require('express');
const app = express();
const bodyParser = require("body-parser"); 
//data bast used api show data 
const {PrismaClient} = require("@prisma/client");
const { error } = require('console');
const { send } = require('process');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const fileUpload = require("express-fileupload");
const fs = require("fs");

const bookController = require ("./controllers/BookController.js");
const customerController = require("./controllers/CustomerController.js");



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true}));
app.use(fileUpload());
app.use("/book",bookController);


//readExcel
app.get("/readExcel",async(req,res)=>{
    try{
        const excel = require("exceljs");
        const wb = new excel.Workbook();
        await wb.xlsx.readFile("ProductExport.xlsx")
        const ws = wb.getWorksheet(1);

        for (let i = 2;i <= ws.rowCount;i++){
            const row = ws.getRow(i);
            const productId = row.getCell(1).value ?? "-";//detec null
            const productName = row.getCell(2).value;
            const Category = row.getCell(3).value;
            const price = row.getCell(4).value;
            const stockQuanlity = row.getCell(5).value;

            console.log(productId,productName,Category,price,stockQuanlity);
        }

        res.send({message:"success"})
    }catch(e){
        res.status(500).send({error:e.message});
    }
});


//creat Pdf 
app.get("/createPdf",(req,res)=>{
    try{
        const PDFDocument = require("pdfkit");
        const doc = new PDFDocument();

        doc.pipe(fs.createWriteStream("output.pdf"));
        doc.font("Kanit,Prompt/Kanit/Kanit-Medium.ttf")
        doc.fontSize(16).text("สวัสดีภาษาไทยครับ",100,100)
        doc.addPage().fontSize(25).text("Here is some vector graphics",100,100);
        doc.end();

        res.send({message:"success"})
    }catch(e){
        res.status(500).send({error:e.message});
    }
});


//Exists
app.get("/fileExists",(req,res)=>{
    try{
        const found = fs.existsSync("package.json");
        res.send({found:found});
    }catch(e){
        res.status(500).send({error:e.message});
    }
});


//removeFile
app.get("/removeFile",(req,res)=>{
    try{
        fs.unlinkSync("text.txt");
        res.send({message:"success"});
    }catch(e){
        res.status(500).send({error:e.message});
    }
});


//writeFile
app.get("/writeFile",(req,res)=>{
    try{
        fs.writeFile("text.txt","hello Jet",(err)=>{
            if(err){
                throw err;
            }
            res.send({message:"success"});
        });
    }catch(e){
        res.status(500).send({error:e.message});
    }
});

//readFile
app.get("/readFile",(req,res)=>{
    try{
        fs.readFile("text.txt",(err,data)=>{
            if(err){
                throw err;
            }
            res.send(data);
        });
    }catch(e){
        res.status(500).send({error:e.message});
    }
});


//upload image
app.post("/book/testUpload",(req,res)=>{
    try{
        const myFile = req.files.myFile;
        myFile.mv("./upload/"+myFile.name,(err)=>{
            if(err){
                return res.status(500).send({error:err});
            }
        res.send({message:"success"});
        })
    }catch(e){
        res.status(500).send({error:e.message});
    }
});

app.get("/customer/list",(req,res) => customerController.list(req,res));
//function checkSignInToken
function checkSignIn(req,res,next){
    try{
        const secret = prisma.env.TOKEN_SECRET;
        const token = req.headers["authorization"];
        const result = jwt.verify(token,secret);

        if (result != undefined){
            next();
        }
    }catch(e){
        res.status(500).send({error:e.message})
    }
}

app.get("/oneToOne",async(req,res)=>{
    try{
        const data = await prisma.orderDetail.findMany({
        include:{
            book:true,       
        },
    });
    res.send({result:data});
    }catch(e){
        res.status(500).send({error:e.message});
    }
});

app.get("/oneToMany",async(req,res)=>{
    try{
        const data = await prisma.book.findMany({
            include :{
                OrderDetail:true,
            }
        });
        res.send({result:data})
    }catch(e){
        res.status(500).send({error:e.message});
    }
})

//multimodel
app.get("/multiModel",async(req,res)=>{
    try{
        const data = await prisma.customer.findMany({
            include:{
                Order:{
                    include:{
                        OrderDetail:{
                            include:{book:true}
                            
                        }
                    },
                },
            },
        });
        res.send({result:data});
    }
    catch(e){
        res.status(500).send({error:e.message});
    }
});
app.get("/user/info",(req,res,next)=>{
    try{    
        res.send("hello back office user info");
    }catch(e){
        res.status(500).send({error:e.message});
    }
});



//user crate Token
app.post('/use/createToken',(req,res)=>{
    try {
        const secret = process.env.TOKEN_SECRET;
        const payload ={
            id:100,
            name:"jet",
            level:"admin",
        };
        const token = jwt.sign(payload,secret,{expiresIn:"1d"});
        res.send({token:token});
    }catch(e){
        res.status(500).send({error:e.message});
    }
});

app.get("/user/verifyToken",(req,res)=>{
    try{
        const secret = process.env.TOKEN_SECRET;
        const token  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwLCJuYW1lIjoiamV0IiwibGV2ZWwiOiJhZG1pbiIsImlhdCI6MTczMTE2NTcxNSwiZXhwIjoxNzMxMjUyMTE1fQ.r-KimEaYInYmq7UGvWsBm6E8TfTMGRR5-68lOpvEUBg"
        const result = jwt.verify(token,secret);
        res.send({result:result});        
    }catch(e){
        res.status(500).send({error:e.message});
    }
});

//feth data in data base 
app.get('/book/list',async(req,res)=>{
    const data = await prisma.book.findMany()
    res.send({data:data});
});

app.post('/book/create', async(req,res) => {
    const data = req.body;
    const result = await prisma.book.create({data:data});

    res.send({result:result});
});

app.post('/book/createManual',async(req,res) =>{
    const result = await prisma.book.create({
        data:
        {   isbn:"1002",
            name:"PHP",
            price:850
        }
    });
    res.send({result:result});
});

app.put("/book/update/:id",async(req,res)=>{
    try{
        const row = await prisma.book.update({
            data:{
                isbn:"1022",
                name:"test update",
                price:800,
            },
            where:{
                id:parseInt(req.params.id),
            },
        });
    
        res.send({message:"succes",row:row});
    }catch(e){
        res.status(500).send({error:e.message});
    }
});
//delete 
app.delete("/book/remove/:id",async(req,res)=>{
    try{
        await prisma.book.delete({
            where:{
                id:parseInt(req.params.id),
            },
        });
        res.send({message:"succes"});
    }catch(e){
        res.status(500).send({error:e.message});
    }
});

//search
app.post("/book/search",async(req,res)=>{
    try{
        const keyword = req.body.keyword;
        const data = await prisma.book.findMany({
            where:{
                name:{
                    contains:keyword,
                }
            },
        });
        res.send({result:data})
    }
    catch(e){
        res.status(500).send({error:e.message});
    }
});
//ค้นหาคำขึ้นต้น
app.post("/book/startWith",async(req,res)=>{
    try{
        const keyword = req.body.keyword;
        const data = await prisma.book.findMany({
            where:{
                name:{
                    startsWith:keyword,
                }
            }
        });
        res.send({result:data});
    }catch(e){
        res.status(500).send({error:e.message})
    }
});
//ค้นหาคำลงท้าย
app.post("/book/endsWith",async(req,res)=>{
    try{
        const keyword = req.body.keyword;
        const data = await prisma.book.findMany({
            where:{
                name:{
                    endsWith:keyword,
                }
            }
        });
        res.send({result:data});
    }catch(e){
        res.status(500).send({error:e.message})
    }
});
//oderby
app.get("/book/orderBy",async(req,res)=>{
    try{
        const data = await prisma.book.findMany({
            orderBy:{
                price:"desc",
            }
        });
        res.send({results:data});
    }
    catch(e){
        res.status(500).send({error:e.message});
    }
});

//find > มากกว่า
app.get("/book/gt",async(req,res)=>{
    try{    
        const data = await prisma.book.findMany({
            where:{
                price:{
                    gt:750,
                }
            }
        });
        res.send({result:data});
    }catch{
        res.status(500).send({message:e.message});
    }
});
//หาค่าที่ไม่ใช่ null
app.get("/book/notNull",async(req,res)=>{
    try{
        const data = await prisma.book.findMany({
            where:{
                //not null  detail{not :null}
                detail:null
            },
        });
        res.send({result:data});
    }catch(e){
        res.status(500).send({error:e.message});
    }
});

//beteween
app.get("/book/getween",async(req,res)=>{
    try{
        const data = await prisma.book.findMany({
            where:{
                price:{
                    lte:1500,
                    gte:900,
                }
            }
        });
        res.send({results:data})
    }catch(e){
        res.send({error:e.message})
    }
});

//sum
app.get("/book/sum",async(req,res)=>{
   try{
    const data = await prisma.book.aggregate({
        _sum:{
            price:true,
        }
    });
    res.send({results:data});
   }
   catch(e){
    res.status(500).send({error:e.message})
   } 
});
//max ,min .avg ,count
app.get("/book/max",async(req,res)=>{
    try{
     const data = await prisma.book.aggregate({
         _max:{
             price:true,
         }
     });
     res.send({results:data});
    }
    catch(e){
     res.status(500).send({error:e.message})
    } 
 });

 
 app.get("/book/findYearAndMonthDay",async(req,res)=>{
    try{
        const data = await prisma.book.findMany({
            where:{
                registerDate:new Date("2024-05-01")
            } 
        });
        res.send({results:data})
    }catch(e){
        res.status(500).send({error:e.message})
    }
 });
 //find month sale
app.get("/book/findMonthSale",async(req,res)=>{
    try{
        const data = await prisma.book.findMany({
            where:{
                registerDate:{
                gte: new Date("2024-05-01"),
                lte: new Date("2024-05-31")
                }
            }
        });
        res.send({result:data})
    }catch(e){
        res.status(500).send({error:e.message})
    }
});
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
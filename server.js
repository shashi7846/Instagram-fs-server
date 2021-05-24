import mongoose from "mongoose";
import Pusher from "pusher";
import cors from "cors";
import express from "express";
import dbModel from "./dbModel.js";

//app config
const app = express();
const port = process.env.PORT || 8080;


const pusher = new Pusher({
    appId: "1207325",
    key: "d98e8d54b47057706455",
    secret: "1927924d100f8aa792a8",
    cluster: "ap2",
    useTLS: true
  });
//MIDDELEWARE
app.use(express.json())
app.use(cors())
//DB config
const connection_url="mongodb+srv://Admin:K7Ef25E4bwjHZJhf@cluster0.3ihnc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
mongoose.connect(connection_url,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})

mongoose.connection.once('open',()=>{
    console.log("DB connected successfully")

    const changeStream = mongoose.connection.collection("posts").watch()
    changeStream.on('change',(change)=>{
        console.log("Change Triggered on pusher..")
        console.log(change)
        console.log('end of change')

        if(change.operationType === 'insert'){
            
        console.log("Triggering pusher ** IMG Upload***")
        
        const postDetails = change.fullDocument;
        pusher.trigger('posts','inserted',{
            user:postDetails.user,
            caption:postDetails.caption,
            image:postDetails.image
        })



        }else{
            console.log('unknown trigger from pusher')
        }
    })

})
//api routes
app.get('/',(req,res)=>res.status(200).send('hello shashi15'));

app.post('/upload',(req,res)=>{
    const body = req.body;

    dbModel.create(body,(err,data)=>{
        if(err){
            res.status(500).send(err) 
        }else{
            res.status(201).send(data)
        }
    });

});
 
app.get('/sync',(req,res)=>{
    dbModel.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    });
});


//listen
app.listen(port,()=>console.log(`listening on localhost ${port}`));


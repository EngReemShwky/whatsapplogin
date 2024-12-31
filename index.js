const express = require("express");
const app = express();
const { Client , LocalAuth} = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');

const qrcode  = require('qrcode-terminal');
const port    = 3001;
const http    = require("http");
const server  = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server , {
  cors:{
    origin: "http://localhost:3000",
    methods : ["GET" , "POST"],
  }
});

const MONGODB_URI  = "mongodb+srv://engreemshwky:KiuRySHT7TxULVFt@cluster0.fcrz0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let store = "";

const allSessions = {};

// When the client is ready, run this code (only once)
const creatWhatsappSession = (id,stocket) => {
  console.log("Create First session");
  mongoose.connect(process.env.MONGODB_URI).then(() => {
    store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000
        })
    });
  /*
  const client = new Client({
    puppeteer:{
     headless : true,
    },
    authStrategy:new LocalAuth({
      clientId : id,
    }),
  });
  */
 
  client.on('ready', () => {
    console.log('Client is ready!');
    allSessions[id] = client;
    io.emit("ready", { id, message : "Client is ready" });
  });

  client.on("authenticated" , () => {
    console.log("authenticated");
  });
  // When the client received QR-Code
  client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR RECEIVED = ', qr);
    io.emit("qr", { qr });
  });

  client.on('ready', () => {
      console.log('Client is ready!');
      try {
        console.log('Client is ready! ، I Will Send');
        //console.log(phone);
        var nomer_telephone = ["+201020189717"]; //"+201012591423",  // "+201096193358" // "+201020189717" ,
        var sendMessageTo = `Hi, Muscat ` + "welcome"; 
        
          for (var nomor = 0; nomor < nomer_telephone.length; nomor++) {
            var chatId = nomer_telephone[nomor].substring(1) + "@c.us"; 
            client.sendMessage(chatId, sendMessageTo).then((r) => {
              console.log(`Hi `+ chatId +` has been sendMessage to `+ sendMessageTo);
            
            });;
          }
          
          console.log("END SEND........");
          setTimeout(() => {
              client.destroy();
          }, 10000);
    } catch (error) {
      console.log(error);
    }   
  });
  client.initialize();
});
}

io.on('connection', (socket) => {
  console.log("a user connected" , socket?.id);

  io.emit('Hello world');
  //socket.on('event', data => { /* … */ });
  socket.on('disconnect', () => {
    console.log("user id disconnected");
  });

  socket.on("connected", (data) => {
    console.log("Connected to the server" , data);
    io.emit("hello" , "Hello free server");
  });

  socket.on("createSession", (data) => {
    console.log("Connected to the server" , data);
    const { id } = data;
    creatWhatsappSession(id , socket);
    //socket.emit("hello" , "Hello free server");
  });
  
});



server.listen(port , ()=> {
  console.log("Server listening on the port : " + port);
});

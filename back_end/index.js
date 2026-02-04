const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require("cors")

const app = express()
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

app.get('/', (req, res)=>{
    res.send('server is running');
})

io.on('connection', (socket)=>{
    console.log('A user connected:', socket.id);

    socket.on('message', (data)=>{
        console.log('message recieved', data);
        io.emit('message', data);
    })

    socket.on('disconnect', ()=>{
        console.log('User disconnected', socket.id);
    })


})

server.listen(5000, (req, res)=>{
    console.log('server listening at port: 5000');
})

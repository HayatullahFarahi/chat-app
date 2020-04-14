const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')


const app = express()
const server = http.createServer(app)
const io = socketio(server)



const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0;

// socket parameter is object that contains info about new connection
io.on('connection', (socket) =>{
    console.log('New WebSocket connection')

    //socket.emit sends an event
    //emit event from server to client
    //  Custom event
    socket.emit('countUpdated', count)

    socket.on('increment',()=>{
        count++
        /// socket.emit works for one client which called the socket
        // socket.emit('countUpdated', count)
        io.emit('countUpdated', count)
        //io.emit sends data to all clients
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`);
})

 
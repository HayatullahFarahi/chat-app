const path = require('path')
const http = require('http')
const https = require('https')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } =  require('./utils/user')
const fs = require('fs')

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  };
const app = express()
const server = https.createServer(options, app)
const io = socketio(server)

// app.get('/', (req, res) => {
//     res.send("Node Server is running. Yay!!")
//  })



const port = 7000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// socket parameter is object that contains info about new connection
io.on('connection', (socket) =>{
    console.log('New WebSocket connection')

    // join socket to take username and room
    socket.on('join', ({username, room}, callback) =>{
        const {error, user } = addUser({id: socket.id, username, room})

        if(error){
            return callback(error)
        } 
        // another way to emit events to a specific room only
        socket.join(user.room)   


        socket.emit('message', generateMessage('Admin','Welcome!'))  
        // broadcast emits message to all users except the user emitting the event
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        socket.on('msg', (msg) =>{
            socket.broadcast.emit('receive_msg', msg)
        })

        // to aknowledge that the user has joined the room
        callback()

        // sokcet.emit, io.emit, socket.broadcast.emit
        // with room with have access to io.emit and socket.broadcast.emit in different variation
  
        /// emits to all-> in the room
        // io.to.emit, socket.broadcast.to.emit // similar but specific to a room
    })



    // the argument callback is the function which was used as third arguement in event emit in client side
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        // we call pass data to callback and will be available in client side
        // we can add as many parameters as we want in callback
        callback()
    })
   

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        console.log(user)
        // socket.broadcast.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        
        // send paramters to client
        callback('Location sent!')
    })

     
    //sockect on disconnect activates when a user disconnects and io.emit sends data to all users
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage(user.username,`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                user: getUsersInRoom(user.room)
            })
        }
        
    })

})

const hostname = '192.168.43.85';
server.listen(port,  () => {
    console.log(`Server is up on port ${port}!`);
})

 
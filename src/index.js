const express = require('express')
const path = require('path')
const http = require('http')
const socket = require('socket.io')

const { generateMessage ,generateLocationMessage} = require('./utils/messages')

const { addUser,removeUser,getUser,getUsersInRoom } = require('./utils/users')

const app = express()

const server = http.createServer(app)

const io = socket(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))


io.on('connection',(socket)=>{
    console.log('new connection')

    socket.on('join',(options,callback)=>{
       const {error,user} = addUser({id:socket.id,...options})

       if(error){
           return callback(error)
       }
        socket.join(user.room)
        socket.emit('displayMsg',generateMessage(user.username,`Welcome! ${user.username}`))
        socket.broadcast.to(user.room).emit('displayMsg',generateMessage(user.username,`${user.username} has joined`))//display msg for particular room expect for him
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })
    // socket.io.emit('displayMsg',generateMessage(`Welcome! ${username}`)) //display msg for that connection
    // socket.broadcast.emit('displayMsg',generateMessage(`${username} has joined`))//display msg for all expect for him


    socket.on('sendMessage',(msg,callback)=>{
        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit('displayMsg',generateMessage(user.username,msg)) //display msg for particular room
            callback()
        }
        //io.emit('displayMsg',generateMessage(msg)) //display msg for all
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('displayMsg',generateMessage(user.username,`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
    })

    socket.on('sendLocation',({latitude,longitude},callback)=>{
        const user = getUser(socket.id)
        if(user){
         io.to(user.room).emit('displayLocation',generateLocationMessage(user.username,`https://www.google.com/maps?q=${latitude},${longitude}`))
         callback()
        }
    })

})

server.listen(port,()=>{
    console.log(`server is on port ${port}`)
})
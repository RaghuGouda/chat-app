const users = []

const addUser = ({id,username,room})=>{
    //clean the data
    username = username.trim().toLowerCase() //remove any space in text and make lower case
    room = room.trim().toLowerCase()

    //validate the data check if user or room is emty
    if(!username||!room){
        return{
            error:'Username or room are required!'
        }
    }
    //check if user is exist in a room
    const existingUser = users.find((user)=>{
           return user.room === room && user.username === username
    })

    if(existingUser){
        return{
            error:'User is in use'
        }
    }
    //store user
    const user = {id,username,room}
    users.push(user)
    return {user}
}

const removeUser = (id)=>{
   
    const isUserIndexFound = users.findIndex((user)=>{ 
        return user.id === id

    })

    if(isUserIndexFound !== -1){
        return users.splice(isUserIndexFound,1)[0]
    }

}

const getUser = (id)=>{
    const user = users.find((user)=>{
        return user.id === id
    })
    if(!user){
        return{
            error:'user is not found'
        }
    }
    return user
}

const getUsersInRoom = (room)=>{
    const user = users.filter((user)=>{
        return user.room === room
    })
    return user
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
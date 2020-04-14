const users = []

//methods
// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room})=>{
    //Clear the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return {
            error: 'Username and Room are required!',
        }
    }
    
    //check for existing users
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //validate Username
    if(existingUser){
        return {
            error: 'Username is in use'
        }
    }

    //store user
    const user = {id, username, room}
    users.push(user)
    return {
        user
        //same as user: user
    }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    // -1 if match is not found 0 or high if found
    if(!index !== -1){
        // returns array of removed users
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}


module.exports ={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

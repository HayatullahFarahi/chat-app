// io() calls sokcet
const socket = io()

// elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
// location to render message in
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML 
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
// check location.serach in browser console it will show the properties
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => { 
    // New ,essage element
    const $newMessage = $messages.lastElementChild


    // Height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
        //but it doesn't have the margin of the new message
        //get bottom margin of the new message
    // console.log(newMessageStyles)
    // console.log(newMessageMargin)

    //Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if( containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (message) => {
    console.log(message)
    //rendering the message template
    // we pass data to our template as second argument in Mustache
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a'),
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) =>{
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, { 
        username: message.username,
        url: message.url,
        createdAt: moment().format('h:mm a'),
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users })=>{
   
    //Test
    // console.log(room)
    // console.log(users)
    const html = Mustache.render(sidebarTemplate , { 
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit', (e) => {
    //prevent full page reload   
    e.preventDefault()

    // takes input by name message from our form
    // const message = event.target.elements.message;

    // TODO: disable form
    $messageFormButton.setAttribute('disabled', 'disabled')



    const message = e.target.elements.message.value

    // the third argument is used for aknownledgemnt which which will be available in server as parameter
    // the third argument's parameters are received from callback parameter of socket.on sendmessage
    socket.emit('sendMessage', message, (error)=>{

        // TODO: enable form
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if (!navigator.geolocation){
        return alert('Geolocation is not supported by this browser')
    }

    // TODO disable location button
    $sendLocationButton.setAttribute('disabled','disabled')
    $sendLocationButton.innerHTML = 'Sending...'
    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
        socket.emit('sendLocation', {
            'latitude': position.coords.latitude,
            'longitude': position.coords.longitude
        }, 
        // this function paramter will send aknownledgemnt to server with one parameter
        //msg which will received whatever data the server sends as parameter
        (msg) =>{
            console.log('client side message location shared')
            console.log(msg)
            $sendLocationButton.removeAttribute('disabled')
            $sendLocationButton.innerHTML = 'Send Location'
        })
    })

    
})


socket.emit('join',{ username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})
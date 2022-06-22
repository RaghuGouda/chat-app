const socket = io()
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $messages = document.querySelector('#messages')

//Template
const $messageTemplate = document.querySelector('#message-template').innerHTML

//options
const {username,room} =Qs.parse(location.search,{ignoreQueryPrefix:true})

//autoscroll
const autoscroll=()=>{
    //new message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyes = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyes.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of message container
    const containerHeight = $messages.scrollHeight

    //how for i have to scroll
    const scrollOffSet = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffSet){
        $messages.scrollTop = $messages.scrollHeight
    }

}

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value //e.target will get the complete form so we can access the elements with name tag
    socket.emit('sendMessage',message,()=>{

    })
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()

})

socket.on('displayMsg',(msg)=>{
    console.log(msg)
    const html = Mustache.render($messageTemplate,{
        username:msg.username,
        message:msg.text,
        createdAt:moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

const $locationButton = document.querySelector('#send-location')
const $location = document.querySelector('#location')

//Template
const $locationTemplate = document.querySelector('#location-template').innerHTML

$locationButton.addEventListener('click',()=>{
    $locationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        $locationButton.removeAttribute('disabled')
        return alert('Geolocation is not supported in your browser')
    }
    
    navigator.geolocation.getCurrentPosition((position)=>{
        const coordinates={
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }
        socket.emit('sendLocation',coordinates,(res)=>{
            $locationButton.removeAttribute('disabled')
            console.log(res)
        })
    })
})
socket.on('displayLocation',(location)=>{
    const html = Mustache.render($locationTemplate,{
        username:location.username,
        url:location.url,
        createdAt:moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

//Template
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

socket.on('roomData',({room,users})=>{
const html = Mustache.render($sidebarTemplate,{
    room:room,
    users
})
document.querySelector('#sidebar').innerHTML = html
})
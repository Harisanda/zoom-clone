const socket = io('/');
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement('video');
myVideo.muted = false;

let myVideoStream;

//creation du connection peer
var peer = new Peer( undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030'
});



navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo,stream);

    peer.on('call',(call)=>{
        const video = document.createElement('video');
        call.answer(stream); // Answer the call with an A/V stream.
        call.on('stream', userVideoStream => {
        addVideoStream(video,userVideoStream);
        // Show stream in some video/canvas element.
        });
      });
    //socket pour joindre le room
    socket.on('user-connected', (userId) =>{
        connectToNewUser(userId,stream);
    })

    //socket  pour le chat
    var text = $('input');

    $('html').keydown((e) =>{
        if (e.which == 13 && text.val().length !== 0 ){
            //console.log(text.val());
            socket.emit('message', text.val());
            text.val('');
        }
    })

    socket.on('createMessage', message => {
        console.log('ceci est envoyer par le serveur',message);
        $('ul').append(`<li class="message"><b>user :</b>${message}</li>`)
    })
})

peer.on('open', id =>{
    socket.emit('join-room',ROOM_ID,id);
})

const connectToNewUser = (userId,stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream',userVideoStream =>{
        addVideoStream(video, userVideoStream);
    })
}

const addVideoStream = (video,stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetdata', () =>{
        video.play();
    })
    videoGrid.append(video);
}

const scrollBottom = () =>{
    let d = $('.main_chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}
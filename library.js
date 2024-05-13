play_animation_title();
set_mobile_messages();

function play_animation_title() {
    let gameTitle = document.getElementById("game-title");

    let title = "Arcanoid";
    for (let index = 0; index < title.length; index++) {
        setTimeout(() => gameTitle.innerHTML += title[index], index * 200);
    }
}

function is_device_mobile() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(userAgent);

    return isMobile;
}

function set_mobile_messages(){
    let messages = document.getElementById("mobile-messages");
    if(is_device_mobile()){
        messages.style.display = "block";
        messages.innerText = "Полноценный функционал игры не доступен на мобильных устройствах :(";
    } else{
        messages.style.display = "none";
    }
}
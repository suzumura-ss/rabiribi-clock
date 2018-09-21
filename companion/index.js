import { outbox } from 'file-transfer'
import { Image } from 'image'
import * as messaging from 'messaging'


messaging.peerSocket.onmessage = function (evt) {
    if (evt.data.command === 'newBackground') {
        getImage(evt.data.tag)
    }
}

function getImage(tag) {
    fetch(`https://www.smoche.info/rabi-ribi/${tag}-348x250.jpg`)
        .then(response => response.arrayBuffer())
        .then(buffer => Image.from(buffer, 'image/jpeg'))
        .then(image =>
            image.export('image/jpeg', {
                background: '#FFFFFF',
                quality: 40
            })
        )
        .then(buffer => outbox.enqueue(`${tag}.jpg`, buffer))
        .then(fileTransfer => {
            console.log(`Enqueued ${fileTransfer.name}`)
        })
}

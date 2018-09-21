import { me } from 'appbit'
import clock from 'clock'
import document from 'document'
import * as fs from 'fs'
import { inbox } from 'file-transfer'
import * as jpeg from 'jpeg'
import * as messaging from 'messaging'
import { preferences } from 'user-settings'
import * as util from '../common/utils'

const SETTINGS_FILE = 'settings/index.json'
const SETTINGS_TYPE = 'json'
const timeLabel = document.getElementById('time-label')
const timeShadow = document.getElementById('time-label-shadow')
const imageBackground = document.getElementById('imageBackground')
const images = [
    'Aruraune', 'Ashuri', 'Chocolate', 'Cicini',
    'Cocoa', 'Erina', 'Irisu', 'KekeBunny',
    'Kotri', 'Lilith', 'Miriam', 'Miru',
    'Nieve', 'Nixie', 'Noah', 'Pandora',
    'Ribbon', 'Rita', 'Rumi', 'Saya',
    'Seana', 'Syaro']
let mySettings


loadSettings()
me.onunload = saveSettings
clock.granularity = 'minutes'


clock.ontick = (evt) => {
    let today = evt.date
    let hours = today.getHours()
    if (preferences.clockDisplay === '12h') {
        hours = hours % 12 || 12
    } else {
        hours = util.zeroPad(hours)
    }
    let mins = util.zeroPad(today.getMinutes())
    timeShadow.text = timeLabel.text = `${hours}:${mins}`
    if (mySettings.lastDownload) {
        let tickSinceDownload = Math.abs(today - new Date(mySettings.lastDownload)) / (60 * 1000)
        if (tickSinceDownload >= 1) {
            requestNewBackground(images[mins % (images.length)])
        }
    } else {
        requestNewBackground(images[mins % (images.length)])
    }
}

function requestNewBackground(tag) {
    let data = {
        command: 'newBackground',
        tag
    }
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send(data)
    }
}


inbox.onnewfile = () => {
    let fileName
    do {
        fileName = inbox.nextFile()
        if (fileName) {
            if (mySettings.bg && mySettings.bg !== '') {
                fs.unlinkSync(mySettings.bg)
            }
            let outFileName = fileName + '.txi'
            jpeg.decodeSync(fileName, outFileName)
            fs.unlinkSync(fileName)
            mySettings.name = fileName
            mySettings.bg = `/private/data/${outFileName}`
            mySettings.lastDownload = new Date().valueOf()
            applySettings()
        }
    } while (fileName)
}


function loadSettings() {
    try {
        mySettings = fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE)
        applySettings()
    } catch (ex) {
        mySettings = {}
    }
}


function saveSettings() {
    fs.writeFileSync(SETTINGS_FILE, mySettings, SETTINGS_TYPE)
}


function applySettings() {
    console.log(`applySettings() : ${mySettings.name}`)
    if (mySettings.bg) {
        imageBackground.image = mySettings.bg
    }
}

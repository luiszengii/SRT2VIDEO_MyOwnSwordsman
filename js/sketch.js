var contentFile;
var content;
var container = document.querySelector('main');
var mediaContainer = document.getElementById('media');
var FPS = 24;

var videoFileInput;
var subtitlesFileInput;
var videoFileName = document.querySelector('#videoFile span');
var subtitlesFileName = document.querySelector('#subtitlesFile span');

var fontsizeSlider = document.querySelector('#fontsize');
fontsizeSlider.addEventListener("input", () => { container.style.fontSize = fontsizeSlider.value + "px"; checkVisibility() } );

var brightnessValue = 1.5;
var brightnessSlider = document.querySelector('#brightness');
brightnessSlider.value = brightnessValue;
brightnessSlider.addEventListener("input", () => brightnessValue = brightnessSlider.value);
brightnessSlider.addEventListener("change", () => console.log(`New brightness: ${brightnessValue}`));

var contrastValue = 2.1;
var contrastSlider = document.querySelector('#contrast');
contrastSlider.value = contrastValue;
contrastSlider.addEventListener("input", () => contrastValue = contrastSlider.value);
contrastSlider.addEventListener("change", () => console.log(`New contrast: ${contrastValue}`));

var fluencyValue = 0.5;
var fluencySlider = document.querySelector('#fluency');
fluencySlider.value = fluencyValue;
fluencySlider.addEventListener("input", () => fluencyValue = fluencySlider.value);
fluencySlider.addEventListener("change", () => console.log(`New fluency: ${fluencyValue}`));

document.querySelector("#toggleSettings").addEventListener("click", () => document.body.classList.toggle('settingsVisible') );

var timeGapsVisible = false;
document.querySelector("#toggleTimeGaps").addEventListener("click", () => {
    timeGapsVisible = !timeGapsVisible;
    document.body.classList.toggle('timeGapsVisible');
    allParagraphs = timeGapsVisible ? container.querySelectorAll('p') : container.querySelectorAll('p:not(.timegap');
    allWords = timeGapsVisible ? container.querySelectorAll('p span') : container.querySelectorAll('p:not(.timegap) span');
    checkVisibility();
});

var allParagraphs, allWords, paragraphs = [], words = [];

var W, H, RATIO, vw, vh;
var vertcalCutoff;
var viewHeight;
var scrolled;
var subtitlesLoaded = false;

var source = document.querySelector("#media video");
var sourceW, sourceH;
var sourceRatio;

var mediaCanvas;
var mediaCtx;
var mediaPixels = [];
var startTime = 0;
var currentTime = 0;

document.addEventListener("scroll", () => scrolled = true );

function setup() {

    noCanvas();
    frameRate(FPS);
    loadMedia();

    document.body.classList.toggle("mobile", mobileAndTabletCheck());

    videoFileInput = createFileInput( (e) => handleVideoFile(e) );
    subtitlesFileInput = createFileInput( (e) => handleSubtitlesFile(e) );
    videoFileInput.parent('videoFile');
    subtitlesFileInput.parent('subtitlesFile');

    videoFileName.innerHTML = "Back To The Future 2.mp4";
    document.body.classList.add('videoLoaded');
    handleSubtitlesFile(undefined, "assets/back-to-the-future-2-en.srt");

    document.addEventListener('click', () => {
        if(source.readyState) {
            if(source.muted) source.muted = false;
            if(source.paused) source.play();
        }
    });

    source.addEventListener('play', () => {
        videoSetup();
    }, { once: true } );
        
    windowResized();

}

function checkVisibility() {
    paragraphs = [];
    for(let p of allParagraphs) {
        if (isVisible(p)) {
            paragraphs.push(p);
        }
    }
    words = [];
    for(let e of allWords) {
        if (isVisible(e)) {
            words.push(e);
        } else {
            e.style.visibility = "hidden";
        }
    }
}

function draw() {

    if (subtitlesLoaded) {

        if (scrolled) {
            checkVisibility();
            scrolled = false;
        }

        for(let w of words) if(chance(0.1)) w.style.visibility = "visible";

    }

    if (!source.paused) {

        loadMediaPixels();

        for(let i=0; i<words.length; i++) {
            if( chance(fluencyValue) ) {
                let pos = words[i].getBoundingClientRect();
                let x = pos.left;
                let y = pos.top;
                let w = pos.width;
                let h = pos.height;
                let px = (x+w/2) / W;
                let py = (y+h/2) / H;

                currentColor = getMediaPixelRGB( ( vertcalCutoff + px * (1-vertcalCutoff*2)) * sourceW, py * sourceH );
                currentColor = effects(currentColor);
                let rgb = 'rgb(' + currentColor[0] + ',' + currentColor[1] + ',' + currentColor[2] + ')';
                words[i].style.color = rgb;
            }
        }

        for(let i=0; i<paragraphs.length; i++) {
            let start = paragraphs[i].getAttribute('start');
            let end = paragraphs[i].getAttribute('end');
            let told = start >= (startTime) && start < currentTime;
            let current = told && end > currentTime;
            paragraphs[i].toggleAttribute('current', current);
        }

    } else {

        for(let i=0; i<words.length; i++) {
            if( chance(0.1) ) {
                let rgb = '#000';
                words[i].style.color = rgb;
            }
        }

    }
}

function handleVideoFile(file, path) {

    const data = path ? path : file.data;
    const name = path ? getFileNameFromPath(path) : file.name;
    console.log(`Loading: ${name}`);

    if ( path || file.type === 'video' ) {
      videoFile = createVideo(data, () => {
        videoFile.hide();
        videoFile.parent('media');
        if(source) source.remove();
        source = videoFile.elt;
        videoFileName.innerHTML = formatFileName(name);
      });
    } else {
        alert('This file is not an MP4 video!');
    }
}

function videoSetup() {
    sourceW = source.videoWidth;
    sourceH = source.videoHeight;
    sourceRatio = sourceW / sourceH;
    mediaCanvas.width  = sourceW;
    mediaCanvas.height = sourceH;
    console.log(`Source size: ${sourceW} x ${sourceH}`)
    windowResized();
}

function handleSubtitlesFile(file, path) {

    const data = path ? path : file.data;
    const name = path ? getFileNameFromPath(path) : file.name;
    console.log(`Loading: ${name}`);

    container.innerHTML = "";

    subtitlesLoaded = false;
    if( nameAndFormat(name)[1] === "srt" ) {
        contentFile = loadStrings(data, () => {
            contentFile = contentFile.join('\n');
            content = parseSRT(contentFile);

            for (let line of content) {
                line.textFormatted = formatText(line.text);
                line.words = line.textFormatted.split(' ');
            }

            for(let i=0; i<content.length; i++) {
                container.insertAdjacentHTML('beforeend', '<p start="' + (content[i].start) + '" end="' + (content[i].end) + '">' + printWords( content[i].words) + '</p>' );
                
                let diff = (i < content.length-1) ? content[i+1].start - content[i].end : 0;
                let phraseTime = 100 * diff; // desired size due to sentence time length between current and next
                let lastSentenceLength = 5 * content[i].text.length; // current size due to length of characters
                let timegaps = Math.ceil( (phraseTime - lastSentenceLength) / 30 );

                for(let j=0; j<timegaps; j++) {
                    let start = content[i].end + j * diff / timegaps;
                    let end = start + diff / timegaps;
                    let ran = 1 + Math.floor( random(9) );
                    let l = "";
                    for(let i=0; i<ran; i++) l += "âŹ";
                    container.insertAdjacentHTML('beforeend', '<p class="timegap" start="' + start + '" end="' + end + '"><span>' + l + '</span></p>' );
                }
            

            }

            allParagraphs = container.querySelectorAll('p:not(.timegap)');

            let allParagraphsListeners = container.querySelectorAll('p');
            for(let i=0; i<allParagraphsListeners.length; i++) {
                allParagraphsListeners[i].addEventListener("click", function (e) { pickMoment(this); } );
            }

            allWords = container.querySelectorAll('p:not(.timegap) span');

            checkVisibility();

            subtitlesFileName.innerHTML = formatFileName(name);

            subtitlesLoaded = true;
            document.body.classList.add('subtitlesLoaded');

        });
    } else {
        alert('This file is not SRT!');
    }
}

function printWords(words) {
    let html = "";
    for(let w of words) {
        html += `<span>${w}</span>`;
    }
    return html;
}

function isVisible(elm) {
    var rect = elm.getBoundingClientRect();
    return (rect.bottom) >= -H * 0.1 && (rect.top) <= H * 1.1;
}

function pickMoment(e) {
    let m = e.getAttribute('start');
    mediaMoveToMoment( m );
}

function windowResized() {
    W = window.innerWidth;
    H = window.innerHeight;
    RATIO = W / H;
    vertcalCutoff = 0.5 - fmap(RATIO, 0, sourceRatio, 0, 0.5);
    // console.log("Window size: ", W, H, RATIO, sourceRatio, vertcalCutoff);
    scrolled = true;
}

function loadMedia() {
    mediaCanvas = document.createElement('canvas');
    mediaCtx = mediaCanvas.getContext('2d');
}

function mediaMoveToMoment(m) {
    startTime = m;
    currentTime = startTime;
    source.currentTime = currentTime;
}

function loadMediaPixels() {
    currentTime = source.currentTime;
    mediaCtx.drawImage(source, 0, 0, sourceW, sourceH);
    mediaPixels = mediaCtx.getImageData(0, 0, sourceW, sourceH).data;
}

function getMediaPixel(x, y) {
    x = limit(x, 0, sourceW);
    y = limit(y, 0, sourceH);
    let ind = (y * sourceW + x) * 4;
    return [ mediaPixels[ind], mediaPixels[ind+1], mediaPixels[ind+2] ];
}

function getMediaPixelRGB(x, y) {
    x = limit(Math.floor(x), 0, sourceW);
    y = limit(Math.floor(y), 0, sourceH);
    let ind = (y * sourceW + x) * 4;
    return [ mediaPixels[ind], mediaPixels[ind+1], mediaPixels[ind+2] ];
}

function effects(c) {
    c = brighter(c, brightnessValue);
    c = contrast(c, contrastValue);
    // c = saturated(c, 1.1 );
    return c;
}


let userMoveTimer;
document.addEventListener('mousemove', () => {
  document.body.classList.remove('noMove');
  clearTimeout(userMoveTimer);
  userMoveTimer = setTimeout(() => document.body.classList.add('noMove'), 1000);
});
userMoveTimer = setTimeout(() => document.body.classList.add('noMove'), 1000);
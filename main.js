let video;
let srtData = []; // 假设这里存放解析后的字幕数据
let totalHeight;
let currentScroll = 0;

function preload() {
    video = createVideo('path_to_your_video.mp4');
    video.hide();
    srtData = loadStrings('path_to_your_subtitles.srt'); // 加载字幕
}

function setup() {
    totalHeight = srtData.length * 20; // 假设每行字幕占20像素
    createCanvas(800, totalHeight); // 动态设置画布高度
    video.loop();
}

function draw() {
    background(0);
    currentScroll = window.scrollY; // 获取当前滚动位置
    image(video, 0, -currentScroll, width, height); // 根据滚动位置调整视频显示
    drawSubtitles();
}

function drawSubtitles() {
    fill(255);
    textSize(20);
    for (let i = 0; i < srtData.length; i++) {
        let y = i * 20 - currentScroll;
        text(srtData[i], 10, y);
    }
}

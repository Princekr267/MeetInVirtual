export const createSilentTrack = () => {
    const ctx        = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst        = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
};

export const createBlackTrack = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement('canvas'), { width, height });
    canvas.getContext('2d').fillRect(0, 0, width, height);
    return Object.assign(canvas.captureStream().getVideoTracks()[0], { enabled: false });
};

export const createBlankStream = () => new MediaStream([createBlackTrack(), createSilentTrack()]);

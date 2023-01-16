const STATE = {
    mergedMessages: [],
};

function onClickMessage(msgEl) {
    const msgIndex = parseInt(msgEl.getAttribute('data-index'), 10);

    const a = document.createElement('a');
    const bytes = new Uint8Array(STATE.mergedMessages[msgIndex].slice(9));
    let bin = '';
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        bin += String.fromCharCode(bytes[i]);
    }
    a.href = 'data:application/octet-stream;base64,' + btoa(bin);
    a.download = 'msg.bin';
    a.click();
}

document.ondrop = loadFile;

addEventListener('DOMContentLoaded', async () => {
    STATE.$record = $('#record');
    STATE.$recordContents = $('#record-contents');

    // Try loading a default recording file
    // No problem if not found.
    fetch('recording.bin')
        .then(res => loadFileBIN({ target: { files: [res] } }));
});
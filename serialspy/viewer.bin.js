/* Binary layout for msgBuf

Byte    Purpose

0       Polarity indicator, 1 = RX, 0 = TX
1-8     Timestamp as a BigUint64BE
9+      Transmitted bytes as captured

*/
function addMessageBIN(msgBuf, index) {
    const dv = new DataView(msgBuf);
    const direction = dv.getUint8(0);

    const timestamp = dv.getBigUint64(1, false);
    const bytesAsStringOrBuffer = msgBuf.slice(9);

    const msgBodyU8A = new Uint8Array(bytesAsStringOrBuffer);
    const truncated = msgBodyU8A.slice(0, 16);
    const bytesAsHex = Array.from(truncated).map(b => b.toString(16).padStart(2, '0')).join(' ');
    const truncatedPrintable = truncated.map(c => c >= 32 ? c : 32);
    const bytesAsASCII = String.fromCodePoint.apply(String, truncatedPrintable).split('').join('  ');

    const msgEl = document.createElement('div');
    msgEl.className = `chat chat-${DIRECTION_POSITION[direction]}`;

    let additionalMessageFooter = ' byte';

    if (msgBodyU8A.length > 1) {
        additionalMessageFooter += 's';
    }

    if (msgBodyU8A.length > truncated.length) {
        additionalMessageFooter += ` total (16 shown)`;
    }

    msgEl.innerHTML = `<div class="chat-bubble chat-bubble-${DIRECTION_COLOR[direction]}" data-index="${index}" onclick="onClickMessage(this)">` +
        `<pre>${bytesAsHex}</pre>` +
        `<pre class="text-base-content">${bytesAsASCII}</pre>` +
        '</div>' +
        `<div class="chat-footer">${msgBodyU8A.length}${additionalMessageFooter}</div>`
        ;

    STATE.$recordContents.appendChild(msgEl);
}

async function loadFileBIN(e) {
    if (!e.dataTransfer && !e.target) return;

    let file;

    if (e.dataTransfer && e.dataTransfer.files[0]) {
        file = e.dataTransfer.files[0];
    } else if (e.target && e.target.files[0]) {
        file = e.target.files[0];
    }

    const recording = new DataView(await file.arrayBuffer());

    // First entry in table is start offset of the 1st msg
    const msgDataStartOffset = recording.getBigUint64(0, false);

    STATE.mergedMessages = [];

    // Process each msg size entry 
    let msgItemStartOffset = msgDataStartOffset;
    for (let msgSizeOffset = 8; msgSizeOffset < msgDataStartOffset; msgSizeOffset += 8) {
        const msgItemSize = recording.getBigUint64(msgSizeOffset, false);
        STATE.mergedMessages.push(recording.buffer.slice(Number(msgItemStartOffset), Number(msgItemStartOffset + msgItemSize)));
        msgItemStartOffset += msgItemSize;
    }

    STATE.$record.classList.add('has-content');

    STATE.mergedMessages.forEach(addMessageBIN);
}

window.loadFile = loadFileBIN;
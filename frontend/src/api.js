import axios from 'axios';

// axios fetch adapter: POST 응답을 끝까지 기다리지 않고 SSE 조각을 읽는다.
export async function predict(input, onEvent, signal) {
  const response = await axios.post('/api/predict/stream', input, {
    adapter: 'fetch', responseType: 'stream', signal,
    headers: { Accept: 'text/event-stream' },
  });
  const reader = response.data.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let receivedResult = false;
  function dispatch(block) {
    let event = 'message';
    const data = [];
    for (const line of block.split(/\r\n|\r|\n/)) {
      if (line.startsWith(':')) continue;
      const colon = line.indexOf(':');
      const field = colon < 0 ? line : line.slice(0, colon);
      let value = colon < 0 ? '' : line.slice(colon + 1);
      if (value.startsWith(' ')) value = value.slice(1);
      if (field === 'event') event = value;
      if (field === 'data') data.push(value);
    }
    if (!data.length) return;
    const payload = JSON.parse(data.join('\n'));
    if (event === 'error' || payload.status === 'ERROR') throw new Error(payload.message || '예측에 실패했습니다.');
    if (event === 'result' || payload.status === 'SUCCESS') {
      if (typeof payload.predictionResult !== 'number' || !Number.isFinite(payload.predictionResult)) throw new Error('예측 결과 형식을 확인해 주세요.');
      receivedResult = true;
    }
    onEvent(event, payload);
  }
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let boundary;
      while ((boundary = /\r\n\r\n|\n\n|\r\r/.exec(buffer))) {
        dispatch(buffer.slice(0, boundary.index));
        buffer = buffer.slice(boundary.index + boundary[0].length);
      }
      if (done) break;
    }
    if (!receivedResult) throw new Error('결과를 받기 전에 연결이 종료되었습니다. 다시 시도해 주세요.');
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
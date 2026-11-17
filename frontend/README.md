# Bodyway frontend

React + Vite + axios 기반 체지방률 예측 UI.

## 실행

```powershell
cd frontend
npm install
npm run dev
```

브라우저에서 http://localhost:5173 을 엽니다. Spring Boot는 8080 포트에서 실행해야 합니다.
Vite가 `/api` 요청을 `http://localhost:8080`으로 프록시합니다.

## API

POST `/api/predict/stream`에 RequestDto와 일치하는 JSON을 전송합니다.
axios fetch adapter로 POST SSE 스트림을 읽습니다. 이벤트 경계와 UTF-8 분할 수신을 버퍼로 처리합니다.
`progress`는 진행 상태, `result` 또는 SUCCESS는 결과, `error` 또는 ERROR는 오류로 처리합니다.
결과 필드: predictionResult, evaluationMetric, message.
현재 Java Service가 모의 데이터를 반환한다면 화면에도 서버의 모의 결과 메시지가 표시됩니다.

`npm run build`로 배포용 dist를 생성합니다. Vite 프록시는 개발용이므로 배포 시 `/api` 리버스 프록시가 필요합니다.
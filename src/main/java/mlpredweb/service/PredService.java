package mlpredweb.service;

import java.time.Duration;

import mlpredweb.dto.RequestDto;
import mlpredweb.dto.ResponseDto;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class PredService {

    public Flux<ServerSentEvent<ResponseDto>> predict(RequestDto requestDto) {
        // FastAPI 연결 전 SSE 전송을 위한 데이터
        // 응답1
        ResponseDto processingResponse = ResponseDto.builder()
                .status("PROCESSING")
                .message("개발용: 모델 추론 단계")
                .build();
        // 응답2
        ResponseDto resultResponse = ResponseDto.builder()
                .status("SUCCESS")
                .predictionResult(23.7)
                .evaluationMetric(0.82)
                .message("개발용 모의 결과입니다.")
                .build();

        return Flux.just(
                createEvent("progress", processingResponse),
                createEvent("result", resultResponse)
        ).delayElements(Duration.ofMillis(700)); // 이벤트 사이 간격 0.7초
    }

    private ServerSentEvent<ResponseDto> createEvent(
            String eventName,
            ResponseDto responseDto
    ) {
        return ServerSentEvent.<ResponseDto>builder()
                .event(eventName)
                .data(responseDto)
                .build();
    }
}

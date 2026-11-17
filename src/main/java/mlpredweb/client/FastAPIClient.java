package mlpredweb.client;

import java.util.LinkedHashMap;
import java.util.Map;

import mlpredweb.dto.RequestDto;
import mlpredweb.dto.ResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

@Component
public class FastAPIClient {

    private final WebClient webClient;

    public FastAPIClient(
            WebClient.Builder builder,
            @Value("${fastapi.base-url:http://localhost:8000}") String baseUrl
    ) {
        this.webClient = builder.baseUrl(baseUrl).build();
    }

    public Flux<ServerSentEvent<ResponseDto>> predict(RequestDto requestDto) {
        // React/Java의 camelCase 입력을 Python API의 필드 이름으로 변환
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("age", requestDto.getAge());
        body.put("gender", requestDto.getGender());
        body.put("height_cm", requestDto.getHeightCm());
        body.put("weight_kg", requestDto.getWeightKg());
        body.put("diastolic", requestDto.getDiastolic());
        body.put("systolic", requestDto.getSystolic());
        body.put("grip_force", requestDto.getGripForce());
        body.put("sit_and_bend", requestDto.getSitAndBendForward());
        body.put("sit_ups", requestDto.getSitUpsCounts());
        body.put("broad_jump", requestDto.getBroadJumpCm());

        return webClient.post()
                .uri("/api/predict/stream")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_NDJSON)
                .bodyValue(body)
                .retrieve()
                // Python은 줄마다 JSON 하나를 전송하므로 NDJSON으로 읽음
                .bodyToFlux(PythonResponse.class)
                .map(this::toEvent);
    }

    private ServerSentEvent<ResponseDto> toEvent(PythonResponse data) {
        String status = switch (data.type()) {
            case "progress" -> "PROCESSING";
            case "result" -> "SUCCESS";
            case "error" -> "ERROR";
            default -> throw new IllegalArgumentException("알 수 없는 Python 이벤트: " + data.type());
        };

        ResponseDto response = ResponseDto.builder()
                .status(status)
                .predictionResult(data.body_fat())
                .evaluationMetric(data.r2())
                .message(data.message())
                .build();

        // React가 사용하는 SSE 이벤트와 ResponseDto 형식으로 변환
        return ServerSentEvent.<ResponseDto>builder()
                .event(data.type())
                .data(response)
                .build();
    }

    // Python 전용 응답 규격. React용 ResponseDto와 분리한다.
    public record PythonResponse(
            String type,
            String message,
            Double body_fat,
            Double r2
    ) {}
}
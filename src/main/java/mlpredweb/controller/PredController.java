package mlpredweb.controller;


import lombok.RequiredArgsConstructor;
import mlpredweb.dto.RequestDto;
import mlpredweb.dto.ResponseDto;
import mlpredweb.service.PredService;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController 
@RequiredArgsConstructor
@RequestMapping ("/api/predict")
public class PredController {
    private final PredService predService;

    @PostMapping (
        value = "/stream",
        consumes = MediaType.APPLICATION_JSON_VALUE,    // 요청 본문의 형식
        produces = MediaType.TEXT_EVENT_STREAM_VALUE    // 응답 본문의 형식
    )
    public Flux<ServerSentEvent<ResponseDto>> predict(
            @RequestBody RequestDto requestDto  // Flux : 비동기로 여러 값을 순서대로 전달 
    ) { return predService.predict(requestDto); }
} 

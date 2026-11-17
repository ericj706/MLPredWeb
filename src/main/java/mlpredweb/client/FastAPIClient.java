package mlpredweb.client;

import mlpredweb.dto.RequestDto;
import mlpredweb.dto.ResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
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
            @Value("${fastapi.base-url:http://localhost:8000}")
            String baseUrl
    ) {
        this.webClient = builder
                .baseUrl(baseUrl)
                .build();
    }

    public Flux<ServerSentEvent<ResponseDto>> predict(
            RequestDto requestDto
    ) {
        return webClient.post()
                .uri("/predict/stream")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(requestDto)
                .retrieve()
                .bodyToFlux(
                        new ParameterizedTypeReference<
                                ServerSentEvent<ResponseDto>>() {}
                );
    }
}
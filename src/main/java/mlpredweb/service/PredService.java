package mlpredweb.service;

import lombok.RequiredArgsConstructor;
import mlpredweb.client.FastAPIClient;
import mlpredweb.dto.RequestDto;
import mlpredweb.dto.ResponseDto;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
public class PredService {

    private final FastAPIClient fastAPIClient;

    public Flux<ServerSentEvent<ResponseDto>> predict(RequestDto requestDto) {
        return fastAPIClient.predict(requestDto);
    }
}
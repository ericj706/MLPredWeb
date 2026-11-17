package mlpredweb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ResponseDto {
    private String status;           // 처리 상태 (예: "SUCCESS")
    private Double predictionResult; // 예측된 결과값 (체지방률 %)
    private Double evaluationMetric; // 모델 성능 지표 (R2 Score 또는 F1-Score)
    private String message;          // SSE 스트리밍용 진행 상태 로그 메시지
}

package mlpredweb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RequestDto {
    private Double age;               // 나이
    private String gender;            // 성별 ("M" 또는 "F")
    private Double heightCm;          // 신장 (cm)
    private Double weightKg;          // 체중 (kg)
    private Double diastolic;         // 이완기 혈압
    private Double systolic;          // 수축기 혈압
    private Double gripForce;         // 악력
    private Double sitAndBendForward; // 앉아윗몸앞으로굽히기
    private Double sitUpsCounts;      // 윗몸일으키기 횟수
    private Double broadJumpCm;       // 제자리멀리뛰기 (cm)
}

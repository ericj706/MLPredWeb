#[1] 라우터
from fastapi import APIRouter
router = APIRouter( prefix="/api" )

# 서비스 객체 불러오기
from Service import body_service

# 스트리밍 응답 : 결과를 한 번에 return 하지 않고 여러 번 나눠서 보냄 (SSE)
from fastapi.responses import StreamingResponse

# 체지방률 예측 (스트리밍)
# http://127.0.0.1:8000/api/predict/stream
# {"age":27,"gender":"M","heightCm":172.3,"weightKg":75.24,
#  "diastolic":80,"systolic":120,"gripForce":54.9,"sitAndBendForward":18.4,"sitUpsCounts":60,"broadJumpCm":217}
@router.post("/predict/stream")
async def predict_stream( body:dict ) :
    return StreamingResponse( body_service.predict_stream( body ) , media_type="application/x-ndjson")
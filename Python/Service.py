# 비지니스 로직 == 머신러닝 모델 예측
import pandas as pd
import joblib

class BodyService :
    # 생성자
    def __init__( self ) :
        self.model = joblib.load( './body_model.pkl' )
        self.r2 = joblib.load( './body_r2.pkl' )
        # 
        self.columns = {
            'age' : 'age' ,
            'gender' : 'gender' ,
            'heightCm' : 'height_cm' ,
            'weightKg' : 'weight_kg' ,
            'diastolic' : 'diastolic' ,                 
            'systolic' : 'systolic' ,                   
            'gripForce' : 'gripForce' ,
            'sitAndBendForward' : 'sit and bend forward_cm' ,
            'sitUpsCounts' : 'sit-ups counts' ,
            'broadJumpCm' : 'broad jump_cm'
        }

    # 예측
    def predict_stream( self , body ) :
        messages = [ ] # 보낼 메시지 저장 리스트

        messages.append( '{"type":"progress","message":"입력값 검증 중"}\n' )
        for key in self.columns :
            if key not in body :
                messages.append( '{"type":"error","message":"' + key + ' 값이 없습니다"}\n' )
                return messages

        # 변환
        messages.append( '{"type":"progress","message":"모델 추론 중"}\n' )
        sample = pd.DataFrame( [ body ] )                      # 딕셔너리 -> df
        sample = sample.rename( columns=self.columns )         # 학습 때 컬럼 이름으로 변경
        sample = sample[ list( self.columns.values() ) ]       # 학습 때 컬럼 순서로 정렬
        sample[ 'gender' ] = sample[ 'gender' ].astype( 'category' )

        # 예측
        result = self.model.predict( sample )[0]
        body_fat = round( float( result ) , 1 )
        r2 = round( float( self.r2 ) , 4 )

        # 결과 + R2
        messages.append( '{"type":"result","body_fat":' + str( body_fat ) + ',"r2":' + str( r2 ) + '}\n' )
        return messages

###########################################################
# 서비스 객체 생성
body_service = BodyService()
package chan.StudyPing.chat.config;

import chan.StudyPing.chat.service.ChatService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class StompHandler implements ChannelInterceptor {
    /*
            이전에는 뭐 연결되면 Set에 Session 넣어주고 연결 끊기면
            Set에서 Session 제거해주는 것을 했었음
            근데 이런 걸 STOMP에서 알아서 해줌 ㅇㅇ
            => 여기서는 인증하는 작업을 할 것 (토큰을 통해서)
     */
    @Value("${jwt.secretKey}")
    private String secretKey;
    private final ChatService chatService;

    // 1️⃣ connect, subscribe, disconnect 하기 전에 이 메소드를 거침
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        // 사용자 요청은 message 안에 담겨 있으니 이걸 꺼낼 것
        // 여기서 이렇게 message를 WRAP하는 이유는? accessor에 접근하기 위해서라고 했었다
        final StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT == accessor.getCommand()) {
            // CONNECT 요청이 들어왔을 때
            // 여기서 토큰 검증을 해야 함
            // 토큰 검증을 해서 문제가 없으면 accessor.setUser()로 사용자 정보를 넣어줌
            // 사용자 정보를 넣어주면 이후에는 사용자 정보를 꺼내서 사용할 수 있음

            log.info("Connect 요청 시 토큰 유효성 검증 시작");

            try {
                // "Authorization"로 담겨진 토큰 꺼내기
                String bearerToken = accessor.getFirstNativeHeader("Authorization");

                // 토큰 존재 및 형식 검증
                if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
                    log.warn("CONNECT 요청에 유효한 Authorization 헤더가 없습니다.");
                    throw new AccessDeniedException("유효한 토큰이 필요합니다.");
                }

                // "Bearer " 앞 부분 제거
                String token = bearerToken.substring(7);

                // 토큰 검증
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(secretKey)
                        .build()
                        .parseClaimsJws(token) // 여기서 유효하지 않으면 예외 발생
                        .getBody();

                // claims에 뭐가 들어 있는 지는 잘 모르겠다 (필요시 사용자 정보 저장 로직 추가)
                log.info("토큰 검증 완료!! 사용자: {}", claims.getSubject());

            } catch (Exception e) { // JWT 파싱/검증 오류 및 기타 예외 처리
                log.error("CONNECT 중 토큰 검증 실패: {}", e.getMessage());
                // AuthenticationException 또는 AccessDeniedException을 던져 연결 거부
                throw new AccessDeniedException("토큰 검증 실패: " + e.getMessage(), e);
            }
        }
        /*
        if (StompCommand.SUBSCRIBE == accessor.getCommand()){
            log.info("Subscribe 요청 시 토큰 유효성 검증 시작");
            // "Authorization"로 담겨진 토큰 꺼내기
            String bearerToken = accessor.getFirstNativeHeader("Authorization");

            // "Bearer " 이 부분을 제거해야 함
            String token = bearerToken.substring(7);

            // 토큰 검증
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String email = claims.getSubject();
            String destination = accessor.getDestination().split("/")[2];
//            log.info("email {} -> roomId {}", email,destination);
//            if (!chatService.isRoomParticipant(Long.parseLong(destination), email)){
//                try {
//                    throw new AuthenticationException("해당 채팅방에 참여하지 않은 유저입니다.");
//                } catch (AuthenticationException e) {
//                    throw new RuntimeException(e);
//                }
//            }
        }
*/
        return ChannelInterceptor.super.preSend(message, channel);
    }
}

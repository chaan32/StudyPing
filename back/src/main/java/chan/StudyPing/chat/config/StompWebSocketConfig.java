package chan.StudyPing.chat.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
//@EnableWebSocket 심플 웹소켓에서 사용했던 것
@EnableWebSocketMessageBroker // 웹소켓 메세지 브로커 라고 보면 됨
@RequiredArgsConstructor
public class StompWebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final StompHandler stompHandler;
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/connect").setAllowedOrigins("http://localhost:3000")
                // ws:// 가 아닌 http://를 사용할 수 있게 해주는 sockJS 라이브러리를 통한 요청 허용하는 설정
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        /*          /public/1 (룸넘버)  룸에 발행하는 건 /publish로 시작하게 됨
                    /topic/1 (룸넘버)  룸에 구독하는 건 /topic으로 시작하게 됨

                    /publish로 시작하는 url패턴으로 메세지가 발행되면 @Controller 객체의 @MessageMapping 메서드로 라우팅됨
        */

        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/publish");
    }
    /*
        웹소켓 요청 ( connect, subscribe, disconnect )등의 요청 시에는
        http header 등 http 메세지를 넣어올 수 있고, 이를 interceptor를 통해 가로채서
        토큰 등을 검증하여 인증을 진행하는 것
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(stompHandler);
    }
}

package chan.StudyPing.chat.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

//스프링과 stomp는 기본적으로 세션관리를 자동으로 처리 -> 잘 되어 있는지 확인하기 위해 이벤트 리스너를 만들어서 확인
@Component
@Slf4j
public class StompEventListener {
    private final Set<String> sessions = ConcurrentHashMap.newKeySet();

    @EventListener
    public void connectHandle(SessionConnectEvent event) {
        StompHeaderAccessor ac = StompHeaderAccessor.wrap(event.getMessage());
        sessions.add(ac.getSessionId());
        log.info("connected  :  {}   --- total : {}",  ac.getSessionId(), sessions.size());

    }

    @EventListener
    public void disconnectHandle(SessionDisconnectEvent event) {
        StompHeaderAccessor ac = StompHeaderAccessor.wrap(event.getMessage());
        sessions.remove(ac.getSessionId());
        log.info("removed  :  {}   --- total : {}",  ac.getSessionId(), sessions.size());
    }
}

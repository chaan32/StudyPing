package chan.StudyPing.chat.service;



import chan.StudyPing.chat.dto.ChatMessageDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

@Service
public class RedisPubSubService implements MessageListener {
    private final StringRedisTemplate stringRedisTemplate; // Redis 채널에 문자열 메세지 발행 해줌
    private final SimpMessageSendingOperations messageTemplate; // WebSocket 구독자에게 메세지를 보내는 데 사용되는 Spring의 메세지 브로커 전송 도구

    public RedisPubSubService(@Qualifier("chatPubSub") StringRedisTemplate stringRedisTemplate, SimpMessageSendingOperations messageTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
        this.messageTemplate = messageTemplate;
    }


    public void publish(String channel, String message){
        stringRedisTemplate.convertAndSend(channel, message);
    }


    public void onMessage(Message message, byte[] pattern) {
        String payload = new String(message.getBody());
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            ChatMessageDto chatMessageDto = objectMapper.readValue(payload, ChatMessageDto.class);
            messageTemplate.convertAndSend("/topic/chat/study/"+chatMessageDto.getRoomId(), chatMessageDto);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}

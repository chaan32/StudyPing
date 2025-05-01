package chan.StudyPing.chat.controller;

import chan.StudyPing.chat.dto.ChatMessageDto;
import chan.StudyPing.chat.service.ChatService;
import chan.StudyPing.chat.service.RedisPubSubService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j
@RequiredArgsConstructor
public class StompController {
    private final SimpMessageSendingOperations messageTemplate;
    private final ChatService chatService;
    private final RedisPubSubService redisPubSubService;

    // 방법 3) Redis를 활용하기
    @MessageMapping("/{roomId}")
    public void sendMessage(@DestinationVariable Long roomId, ChatMessageDto chatMessageDto) throws JsonProcessingException {

        log.info("📨 메시지 수신 - roomId: {}, sender: {}, message: {}",
                roomId, chatMessageDto.getSenderId(), chatMessageDto.getMessage());

        chatMessageDto.setRoomId(roomId);  // ChatMessageDto : roomId ❌ -> DestinationVar 에서 받아서 넣어 줘야 함

        chatService.saveMessage(roomId, chatMessageDto); // DB에 저장

        ObjectMapper mapper = new ObjectMapper();
        String message = mapper.writeValueAsString(chatMessageDto);
        redisPubSubService.publish("chat", message); //Redis 채널의 이름에 메세지를 전달 해주는 것
    }
}
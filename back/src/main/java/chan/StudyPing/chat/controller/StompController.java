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
    /*
    방법 1)  MessageMapping(수신)과 SendTo(발신)을 한번에 처리

            @DestinationVariable을 통해서 roomId를 받아옴
            @DestinationVariable : @MessageMapping의 URL에서 변수를 받아올 때 사용
            클라이언트에게 특정 publish/roomId 형태로 메세지를 발행 시 MessageMapping 수신

    @MessageMapping("/{roomId}") //  해당 roomId에 메세지를 발행하며 구독 중인 클라이언트에게 메세지 전송
    @SendTo("/topic/{roomId}")
    public String sendMessage(@DestinationVariable Long roomId, String message){
        // /public/1로 오면 바로 SendTo를 통해서 /topic/1로 메세지를 보냄.
        // 즉 이 메세지가 메세지 브로커 역할을 함
        log.info("roomId : {}, message : {}", roomId, message);
        return message;
    }*/

    /*
        // 방법 2) MessageMapping만 활용하기
        @MessageMapping("/{roomId}")
        public void sendMessage(@DestinationVariable Long roomId, ChatMessageDto chatMessageReqDto){
            // 이 메소드에서 메세지를 데이터베이스에 저장도 할 것
            log.info("roomId : {},  message - {} : {}", roomId,chatMessageReqDto.getSenderEmail(), chatMessageReqDto.getMessage());
            // 메세지 저장
            chatService.saveMessage(roomId, chatMessageReqDto);
            // @SendTo 를 대신하는 중
            messageTemplate.convertAndSend("/topic/" + roomId, chatMessageReqDto);
        }
        */

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
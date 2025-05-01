package chan.StudyPing.chat.controller;

import chan.StudyPing.chat.domain.ChatRoom;
import chan.StudyPing.chat.dto.ChatMessageDto;
import chan.StudyPing.chat.dto.ChatRoomResDto;
import chan.StudyPing.chat.service.ChatService;
import chan.StudyPing.study.service.StudyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {
    private final ChatService chatService;
    private final StudyService studyService;

    // 내가 참여한 스터디 채팅방 보여주기
    @GetMapping("/find/joined/{memberId}")
    public ResponseEntity<?> findJoinedCR(@PathVariable Long memberId) {
        List<ChatRoom> chattingRoom = chatService.findChattingRoom(memberId);
        List<ChatRoomResDto> dto = new ArrayList<>();
        for (ChatRoom chatRoom : chattingRoom) {
            ChatRoomResDto d = ChatRoomResDto.builder()
                    .roomId(chatRoom.getId())
                    .roomType(chatRoom.getType())
                    .roomName(chatRoom.getName())
                    .build();
            dto.add(d);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("chatRoomList", dto);
        response.put("message", "내 채팅방 조회 성공");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // 개인 채팅방 개설 혹은 기존의 RoomId Return
    @PostMapping("/direct/{receiverId}")
    public ResponseEntity<?> createDirectChatRoom(@PathVariable Long receiverId){
        Long privateRoomId = chatService.getOrCreatePrivateRoom(receiverId);
        return new ResponseEntity<>(privateRoomId, HttpStatus.OK);
    }

    // 이전 메세지 조회하기
    @GetMapping("/history/{roomId}")
    public ResponseEntity<?> getHistory(@PathVariable Long roomId){
        List<ChatMessageDto> dtos = chatService.getChatHistory(roomId);

        HashMap<String, Object> response = new HashMap<>();
        response.put("histories", dtos);
        response.put("message" , "이전 메세지 조회 성공");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // 채팅 메세지 읽음 처리
    @PostMapping("/read/{roomId}")
    public ResponseEntity<?> messageRead(@PathVariable Long roomId){
        chatService.readMessage(roomId);
        return ResponseEntity.ok().build();
    }


/*




    // 내 채팅방 목록 조회  Res : roomId, roomName, 그룹채팅 여부, 메세지 읽음 개수
    @GetMapping("/my/rooms")
    public ResponseEntity<?> getMyChatRooms(){
//        List<MyChatListResDto> dtos  = chatService.getMyChatRooms();
        return ResponseEntity.ok().build();
    }

    // 채팅방 나가기
    @DeleteMapping("/room/group/{roomId}/leave")
    public ResponseEntity<?>leaveGroupRoom(@PathVariable Long roomId){
//        chatService.leaveGroupChatRoom(roomId);
        return ResponseEntity.ok().build();
    }
*/


}

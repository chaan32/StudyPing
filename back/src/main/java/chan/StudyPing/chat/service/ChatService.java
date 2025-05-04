package chan.StudyPing.chat.service;

import chan.StudyPing.chat.domain.*;
import chan.StudyPing.chat.dto.*;
import chan.StudyPing.chat.repository.*;
import chan.StudyPing.member.domain.Member;
import chan.StudyPing.member.repository.MemberRepository;
import chan.StudyPing.study.domain.Study;
import chan.StudyPing.study.repository.StudyRepository;
import chan.StudyPing.study.service.StudyService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;
    private final ReadStatusRepository readStatusRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final MemberRepository memberRepository;
    private final StudyRepository studyRepository;
    private final StudyService studyService;

    public void saveMessage(Long roomId, ChatMessageDto dto){
        // 1. Room 객체 찾기
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(()->new EntityNotFoundException("Room 존재 ❌"));
        // 2. 보낸 사람 객체 찾기
        Member sender = memberRepository.findById(dto.getSenderId())
                .orElseThrow(()-> new EntityNotFoundException("Sender(Member) 존재 ❌"));

        // 3. 저장할 ChatMessage 객체 빌드
        ChatMessage newChatMsg = ChatMessage.builder()
                .chatRoom(chatRoom)
                .member(sender)
                .content(dto.getContent())
                .build();

        // 4. 저장
        chatMessageRepository.save(newChatMsg);

        // 5. 읽음 여부 저장
        List<ChatParticipant> participants = chatParticipantRepository.findByChatRoom(chatRoom);
        for (ChatParticipant participant : participants) {
            ReadStatus rs = ReadStatus.builder()
                    .chatRoom(chatRoom)
                    .member(participant.getMember())
                    .chatMessage(newChatMsg)
                    .isRead(participant.getMember().equals(sender))
                    .build();
            readStatusRepository.save(rs);
        }

    }


    // 채팅방 만들기 (스터디가 만들어지는 시점에) (그룹)
    public void createChatRoom(Study study){
        ChatRoom newChatRoom = ChatRoom.builder()
                .name(study.getTitle()+"의 채팅방")
                .type(ChatRoomType.GROUP)
                .study(study)
                .build();

        List<ChatParticipant> chatParticipants = new ArrayList<>();

        ChatParticipant leader = ChatParticipant.builder()
                .chatRoom(newChatRoom)
                .member(study.getMaker())
                .build();
        chatParticipants.add(leader);

        newChatRoom.setParticipants(chatParticipants);
        chatRoomRepository.save(newChatRoom);
        chatParticipantRepository.save(leader);

        study.setChatRoom(newChatRoom);
        studyRepository.save(study);
    }
    // 채팅방 참여하기 (스터디 참여했을 경우에)
    public void joinChatRoom(Long studyId, Long memberId){
        // studyId - Study 객체 가져 오기
        Study study = studyService.findById(studyId);

        // chatRoom 객체 가져 오기
        ChatRoom chatRoom = study.getChatRoom();

        // Member 객체 가져 오기
        Member member = memberRepository.findById(memberId)
                .orElseThrow(()-> new EntityNotFoundException("멤버를 찾을 수 ❌"));

        // CharParticipant 만들기
        ChatParticipant newCP = ChatParticipant.builder()
                .chatRoom(chatRoom)
                .member(member)
                .build();
        chatParticipantRepository.save(newCP);

        chatRoom.addParticipant(newCP);
        chatRoomRepository.save(chatRoom);
    }
    // member 가 참여하고 있는 채팅 방 찾기
    public List<ChatRoom> findChattingRoom(Long memberId){
        // Member 객체 가져오기
        Member member = memberRepository.findById(memberId)
                .orElseThrow(()-> new EntityNotFoundException("멤버를 찾을 수 ❌"));

        // ChatParticipant 객체 가져오기
        List<ChatParticipant> cp = chatParticipantRepository.findByMember(member);

        // ChatRoom List 객체 생성
        List<ChatRoom> joinedChatRooms = new ArrayList<>();
        for (ChatParticipant chatParticipant : cp) {
            joinedChatRooms.add(chatParticipant.getChatRoom());
        }

        return joinedChatRooms;
    }
    public Long getOrCreatePrivateRoom(Long receiverId) {
        // 1. 내 Member 객체 찾기
        Member sender = memberRepository.findByEmail(getEmailFromAuth())
                .orElseThrow(() -> new EntityNotFoundException("Private Sender 멤버를 찾을 수 ❌"));

        // 2. 상대방 Member 객체 찾기
        Member receiver = memberRepository.findById(receiverId)
                .orElseThrow(() -> new EntityNotFoundException("Private Receiver 멈버를 찾을 수 ❌"));


        // 3. 나와 상대가 동시에 존재하는 방이 있는 지 DB 뒤지기
        Optional<ChatRoom> chatRoom = chatParticipantRepository.findExistingPrivateRoom(sender.getId(), receiverId);

        // 4. 만약에 이미 존재 채팅 방이 한다면,
        if (chatRoom.isPresent()) {
            return chatRoom.get().getId();
        }

        // 5. ChatRoom 생성하기
        ChatRoom privateChatRoom = ChatRoom.builder()
                .type(ChatRoomType.DIRECT)
                .name(receiver.getName() + " 💬 " + sender.getName())
                .build();
        chatRoomRepository.save(privateChatRoom);

        // 6. 참가자로 저장하기
        ChatParticipant sen = ChatParticipant.builder()
                .chatRoom(privateChatRoom)
                .member(sender)
                .build();
        ChatParticipant rec = ChatParticipant.builder()
                .chatRoom(privateChatRoom)
                .member(receiver)
                .build();

        chatParticipantRepository.save(sen);
        chatParticipantRepository.save(rec);

        return privateChatRoom.getId();
    }
    public List<ChatMessageDto> getChatHistory(Long roomId){
        List<ChatMessage> messages = chatMessageRepository.findByChatRoomId(roomId);
        List<ChatMessageDto> dtos = new ArrayList<>();
        for (ChatMessage message : messages) {
            ChatMessageDto dto = ChatMessageDto.builder()
                    .content(message.getContent())
                    .senderId(message.getMember().getId())
                    .senderEmail(message.getMember().getEmail())
                    .senderName(message.getMember().getName())
                    .build();
            dtos.add(dto);
        }
        return dtos;
    }

    public void readMessage(Long roomId){
        // 1. 내 Member 객체 찾기
        Member reader = memberRepository.findByEmail(getEmailFromAuth())
                .orElseThrow(() -> new EntityNotFoundException("읽기 : 멤버를 찾을 수 ❌"));

        // 2. ChatRoom 객체 찾기
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(()->new EntityNotFoundException("읽기 : 채팅 룸을 찾을 수 ❌"));

        List<ReadStatus> rs = readStatusRepository.findByChatRoomAndMember(chatRoom, reader);
        for (ReadStatus r : rs) {
            r.updateReadStatus(true);
        }
    }
    private String getEmailFromAuth(){return SecurityContextHolder.getContext().getAuthentication().getName();}
}
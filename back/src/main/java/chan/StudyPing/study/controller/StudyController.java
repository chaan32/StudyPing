package chan.StudyPing.study.controller;

import chan.StudyPing.chat.domain.ChatRoom;
import chan.StudyPing.chat.dto.ChatRoomListResDto;
import chan.StudyPing.chat.service.ChatService;
import chan.StudyPing.member.domain.Member;
import chan.StudyPing.member.repository.MemberRepository;
import chan.StudyPing.member.service.MemberService;
import chan.StudyPing.study.domain.Study;
import chan.StudyPing.study.domain.StudyMember;
import chan.StudyPing.study.dto.StudyIncludeMembersResDto;
import chan.StudyPing.study.dto.StudyReqDto;
import chan.StudyPing.study.dto.StudyResDto;
import chan.StudyPing.study.repository.StudyRepository;
import chan.StudyPing.study.service.StudyService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/study")
@Slf4j
@RequiredArgsConstructor
public class StudyController {
    private final StudyService studyService;
    private final MemberService memberService;
    private final ChatService chatService;


    //스터디 생성하기
    @PostMapping("/create")
    public ResponseEntity<?> createStudy(@RequestBody StudyReqDto studyReqDto){
        log.info("try to create study : {}", studyReqDto);
        // 멤버 정보 확인
        Member maker = memberService.findById(studyReqDto.getMakerId());

        Study study = studyService.createStudy(studyReqDto, maker);
        chatService.createChatRoom(study);

        HashMap<String, Object> response = new HashMap<>();
        response.put("study_id", study.getId());
        response.put("message", "스터디 생성 성공");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //모든 스터디 조회하기
    @GetMapping("/find/all")
    public ResponseEntity<?> findAllStudy(){
        log.info("try to find all study");
        List<Study> studyList = studyService.findAll();
        List<StudyResDto> resDtos = studyService.convertToDto(studyList);

        HashMap<String, Object> response = new HashMap<>();
        response.put("studies", resDtos);
        response.put("message", "모든 스터디 조회 성공");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    //특정 토픽의 스터디 조회하기
    @GetMapping("/find/category/{category}")
    public ResponseEntity<?> findStudyByTopic(@PathVariable String category){
        log.info("controller - selected category : {}", category);
        List<Study> studyList = studyService.findByCategory(category);
        List<StudyResDto> resDtos = studyService.convertToDto(studyList);

        HashMap<String, Object> response = new HashMap<>();
        response.put("studies", resDtos);
        response.put("message", "모든 스터디 조회 성공");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    //특정 스터디 조회하기
    @GetMapping("/find/id/{id}")
    public ResponseEntity<?> findStudyById(@PathVariable Long id){
        log.info("try to find study by id : {}", id);
        Study study = studyService.findById(id);
        StudyIncludeMembersResDto dto = studyService.convertToIncludeDto(study);

        HashMap<String, Object> response = new HashMap<>();
        response.put("study", dto);
        response.put("message", "스터디 조회 성공");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    //스터디 참여하기
    @PostMapping("/join/{member_id}/{study_id}")
    public ResponseEntity<?> joinStudy(@PathVariable Long member_id, @PathVariable Long study_id) throws Exception {
        log.info("try to join study : {}", study_id);
        Member member = memberService.findById(member_id);
        studyService.join(study_id, member);
        chatService.joinChatRoom(study_id, member_id);


        HashMap<String, Object> response = new HashMap<>();
        response.put("message", "스터디 참여 성공");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    // 참여한 스터디 조회하기
    @GetMapping("/find/joined/{member_id}")
    public ResponseEntity<?> findJoinedStudy(@PathVariable Long member_id){
        log.info("try to find Studies which {} is joined", member_id);

        Member member = memberService.findById(member_id);
        List<StudyMember> studyMembers = studyService.findByMember(member);
        List<StudyResDto> resDtos = studyService.convertStudyMemberToDto(studyMembers);
        HashMap<String, Object> response = new HashMap<>();
        response.put("studyList", resDtos);
        response.put("message", "참여 중인 스터디 조회 성공");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // 특정 스터디에 참여한 멤버들 조회하기
    @GetMapping("/find/joined/member/{study_id}")
    public ResponseEntity<?> findJoinedMember(@PathVariable Long study_id){
        Study study = studyService.findById(study_id);
        List<StudyMember> studyMembers = study.getStudyMembers();
        List<Long> joinedMemberId = new ArrayList<>();
        for (StudyMember studyMember : studyMembers) {
            joinedMemberId.add(studyMember.getMember().getId());
        }

        HashMap<String, Object> response = new HashMap<>();
        response.put("joinedMemberId", joinedMemberId);
        response.put("studyId", study_id);
        response.put("number", studyMembers.size());
        response.put("message", "스터디 참여 중인 멤버 조회 성공");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/find/joined/chatting/{member_id}")
    public ResponseEntity<?> findJoinedChatting(@PathVariable Long member_id){
        log.info("try to find chatting room which {} is joined", member_id);
        Member member = memberService.findById(member_id);
        List<StudyMember> studyMembers = member.getStudyMembers();
        List<ChatRoomListResDto> dtos = new ArrayList<>();
        for (StudyMember studyMember : studyMembers) {
            dtos.add(convertToDto(studyMember));
        }
        HashMap<String, Object> response = new HashMap<>();
        response.put("dtos", dtos);
        response.put("member_id", member_id);
        response.put("message", "채팅 방 조회 성공");

        return new ResponseEntity<>(response, HttpStatus.OK);

    }
    private ChatRoomListResDto convertToDto(StudyMember studyMember){
        return ChatRoomListResDto.builder()
                .roomId(studyMember.getStudy().getChatRoom().getId())
                .title(studyMember.getStudy().getTitle())
                .unReadCount(countUnReadMessage(studyMember.getMember().getId(), studyMember.getStudy().getId()) )
                .build();
    }

    private Long countUnReadMessage(Long memberId, Long StudyId){
        Member member = memberService.findById(memberId);
        Study study = studyService.findById(StudyId);
        ChatRoom chatRoom = study.getChatRoom();

        return chatService.getUnReadMessage(chatRoom, member);
    }
}

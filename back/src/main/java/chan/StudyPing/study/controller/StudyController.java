package chan.StudyPing.study.controller;

import chan.StudyPing.member.domain.Member;
import chan.StudyPing.member.service.MemberService;
import chan.StudyPing.study.domain.Study;
import chan.StudyPing.study.dto.StudyReqDto;
import chan.StudyPing.study.dto.StudyResDto;
import chan.StudyPing.study.service.StudyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/study")
@Slf4j
@RequiredArgsConstructor
public class StudyController {
    private final StudyService studyService;
    private final MemberService memberService;

    //스터디 생성하기
    @PostMapping("/create")
    public ResponseEntity<?> createStudy(@RequestBody StudyReqDto studyReqDto){
        log.info("try to create study : {}", studyReqDto);
        // 멤버 정보 확인
        Member maker = memberService.findById(studyReqDto.getMakerId());

        Study study = studyService.create(studyReqDto, maker);
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
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    //특정 토픽의 스터디 조회하기
    @GetMapping("/find/{category}")
    public ResponseEntity<?> findStudyByTopic(@PathVariable String category){
        List<Study> studyList = studyService.findByCategory(category);
        List<StudyResDto> resDtos = studyService.convertToDto(studyList);

        HashMap<String, Object> response = new HashMap<>();
        response.put("studies", resDtos);
        response.put("message", "모든 스터디 조회 성공");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //특정 스터디 조회하기
    @GetMapping("/find/{id}")
    public ResponseEntity<?> findStudyById(@PathVariable Long id){
        Study study = studyService.findById(id);
        StudyResDto dto = studyService.convertToDto(study);

        HashMap<String, Object> response = new HashMap<>();
        response.put("study", dto);
        response.put("message", "스터디 조회 성공");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}

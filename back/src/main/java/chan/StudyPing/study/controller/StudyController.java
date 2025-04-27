package chan.StudyPing.study.controller;

import chan.StudyPing.member.domain.Member;
import chan.StudyPing.member.service.MemberService;
import chan.StudyPing.study.domain.Study;
import chan.StudyPing.study.dto.StudyReqDto;
import chan.StudyPing.study.service.StudyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;

@RestController
@RequestMapping("/study")
@Slf4j
@RequiredArgsConstructor
public class StudyController {
    private final StudyService studyService;
    private final MemberService memberService;

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
}

package chan.StudyPing.member.controller;

import chan.StudyPing.common.auth.JwtTokenProvider;
import chan.StudyPing.member.domain.Member;
import chan.StudyPing.member.dto.MemberLoginReqDto;
import chan.StudyPing.member.dto.MemberSaveReqDto;
import chan.StudyPing.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/member")
@Slf4j
public class MemberController {

    private final MemberService memberService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/create")
    public ResponseEntity<?> memberCreate(@RequestBody MemberSaveReqDto memberSaveReqDto){
        log.info("회원가입 요청: {}", memberSaveReqDto);
        Member member = memberService.create(memberSaveReqDto);

        Map<String, Object> response = new HashMap<>();
        response.put("id", member.getId());
        response.put("name", member.getName());
        response.put("message", "회원가입 성공");

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> doLogin(@RequestBody MemberLoginReqDto memberLoginReqDto){
        log.info("로그인 요청: {}", memberLoginReqDto);
        Member member = memberService.login(memberLoginReqDto);

        // 토큰 생성
        String token = jwtTokenProvider.createToken(member.getEmail(), member.getRole().toString());

        Map<String, Object> response = new HashMap<>();
        response.put("id", member.getId());
        response.put("name", member.getName());
        response.put("token", token);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}

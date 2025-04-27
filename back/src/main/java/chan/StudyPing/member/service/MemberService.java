package chan.StudyPing.member.service;

import chan.StudyPing.member.domain.Member;
import chan.StudyPing.member.dto.MemberLoginReqDto;
import chan.StudyPing.member.dto.MemberSaveReqDto;
import chan.StudyPing.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public Member create(MemberSaveReqDto dto){
        // 이미 가입된 이메일인지 확인
        if(memberRepository.findByEmail(dto.getEmail()).isPresent()){
            throw new IllegalArgumentException("이미 존재 하는 이메일 입니다.");
        }

        Member newMember = Member.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword())) // 비밀번호 인코딩 해줬다
                .build();

        Member member = memberRepository.save(newMember);
        return member;
    }

    public Member login(MemberLoginReqDto dto){
        log.info("login inputDTO : {}", dto);
        Member member = memberRepository.findByEmail(dto.getEmail()).orElseThrow(
                ()-> new IllegalArgumentException("존재하지 않는 이메일입니다."));

        // 암호화된 비밀번호와 입력한 비밀번호를 암호화한 것과 비교를 통해서 일치 여부를 확인 함
        if (!passwordEncoder.matches(dto.getPassword(), member.getPassword())){
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        return member;
    }

    public Member findById(Long id){
        return memberRepository.findById(id).orElseThrow(
                ()-> new IllegalArgumentException("존재하지 않는 회원입니다."));
    }
}


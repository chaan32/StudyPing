package chan.StudyPing.member.service;

import chan.StudyPing.member.domain.Member;
import chan.StudyPing.member.dto.MemberSaveReqDto;
import chan.StudyPing.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    public Member create(MemberSaveReqDto dto){
        // 이미 가입된 이메일인지 확인
        if(memberRepository.findByEmail(dto.getEmail()).isPresent()){
            throw new IllegalArgumentException("이미 존재 하는 이메일 입니다.");
        }

        Member newMember = Member.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(dto.getPassword()) // 비밀번호 인코딩
                .build();

        Member member = memberRepository.save(newMember);
        return member;
    }
}

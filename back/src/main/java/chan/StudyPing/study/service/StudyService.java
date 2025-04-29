package chan.StudyPing.study.service;

import chan.StudyPing.member.domain.Member;
import chan.StudyPing.study.domain.Study;
import chan.StudyPing.study.domain.StudyCategory;
import chan.StudyPing.study.domain.StudyMember;
import chan.StudyPing.study.domain.StudyRole;
import chan.StudyPing.study.dto.StudyIncludeMembersResDto;
import chan.StudyPing.study.dto.StudyReqDto;
import chan.StudyPing.study.dto.StudyResDto;
import chan.StudyPing.study.repository.StudyMemberRepository;
import chan.StudyPing.study.repository.StudyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class StudyService {
    private final StudyRepository studyRepository;
    private final StudyMemberRepository studyMemberRepository;

    // create 만들기
    public Study createStudy(StudyReqDto dto, Member member){
        // 요청 정보와 만드는 사람의 객체
        Study newStudy = Study.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .maxParticipants(dto.getMaxParticipants())
                .currentMembers(1)
                .location(dto.getLocation())
                .maker(member)
                .studyMembers(new ArrayList<>(dto.getMaxParticipants()))
                .chatRoom(null)
                .build();
        studyRepository.save(newStudy);

        // 만든 사람도 테이블에 새로 넣기
        StudyMember studyMember = StudyMember.builder()
                .study(newStudy)
                .member(member)
                .role(StudyRole.Leader)
                .build();
        studyMemberRepository.save(studyMember);
        return newStudy;
    }

    // join 만들기
    public void join(Long studyId, Member member){
        Study study = findById(studyId);

        // 이미 가입된 멤버인지 확인
        boolean isAlreadyJoined = studyMemberRepository.existsByStudyAndMember(study, member);

        if (isAlreadyJoined) throw new IllegalArgumentException("이미 가입한 스터디임");

        if (study.isFull()) throw new IllegalArgumentException("스터디 최대 인원이 초과됨");

        StudyMember studyMember = StudyMember.builder()
                .study(study)
                .member(member)
                .role(StudyRole.TeamMember)
                .build();

        // Study와 Member에 각각의 정보 넣기
        study.addStudyMember(studyMember);
        member.joinStudy(studyMember);

        studyMemberRepository.save(studyMember);
    }
    public List<StudyResDto> convertToDto(List<Study> studyList) {
        return studyList.stream()
                .map(study -> StudyResDto.builder()
                        .id(study.getId())
                        .title(study.getTitle())
                        .description(study.getDescription())
                        .category(study.getCategory().getDescription())
                        .maxParticipants(study.getMaxParticipants())
                        .currentParticipants(study.getCurrentMembers())
                        .location(study.getLocation().getDescription())
                        .createdAt(study.getCreatedTime())
                        .makerName(study.getMaker().getName())
                        .build())
                .toList();
    }
    public List<StudyResDto> convertStudyMemberToDto(List<StudyMember> list){
        return list.stream()
                .map(studyMember -> StudyResDto.builder()
                                .id(studyMember.getStudy().getId())
                                .title(studyMember.getStudy().getTitle())
                                .description(studyMember.getStudy().getDescription())
                                .category(studyMember.getStudy().getCategory().getDescription())
                                .maxParticipants(studyMember.getStudy().getMaxParticipants())
                                .currentParticipants(studyMember.getStudy().getCurrentMembers())
                                .location(studyMember.getStudy().getLocation().getDescription())
                                .createdAt(studyMember.getStudy().getCreatedTime())
                                .role(studyMember.getRole())
                                .build())
                .toList();
    }

    public StudyResDto convertToDto(Study study) {
        return StudyResDto.builder()
                .id(study.getId())
                .title(study.getTitle())
                .description(study.getDescription())
                .category(study.getCategory().getDescription())
                .maxParticipants(study.getMaxParticipants())
                .currentParticipants(study.getCurrentMembers())
                .location(study.getLocation().getDescription())
                .createdAt(study.getCreatedTime())
                .makerName(study.getMaker().getName())
                .build();
    }

    public StudyIncludeMembersResDto convertToIncludeDto(Study study){
        List<String> members = new ArrayList<>();
        for (StudyMember member : studyMemberRepository.findByStudyId(study.getId())) {
            if (member.getRole() == StudyRole.TeamMember){
                members.add(member.getMember().getName());
            }
        }

        StudyIncludeMembersResDto dto = StudyIncludeMembersResDto.builder()
                .id(study.getId())
                .title(study.getTitle())
                .description(study.getDescription())
                .category(study.getCategory().getDescription())
                .maxParticipants(study.getMaxParticipants())
                .currentParticipants(study.getCurrentMembers())
                .location(study.getLocation().getDescription())
                .createdAt(study.getCreatedTime())
                .makerName(study.getMaker().getName())
                .members(members)
                .build();
        return dto;
    }
    // 특정 멤버가 참여한 스터디 찾기
    public List<StudyMember> findByMember(Member member){
        return studyMemberRepository.findByMemberId(member.getId());
    }






    // 모든 스터디 찾기
    public List<Study> findAll() {
        return studyRepository.findAll();
    }

    // 스터디 아이디로 스터디 찾기
    public Study findById(Long id) {
        return studyRepository.findById(id).orElseThrow(
                () -> new IllegalArgumentException("존재하지 않는 스터디입니다.")
        );
    }

    // 카테고리 별로 스터디 찾는 거
    public List<Study> findByCategory(String category) {

        log.info("service - selected category : {}", category);
        StudyCategory stc = null;

        switch (category) {
            case "PROGRAMMING":
                stc = StudyCategory.PROGRAMMING;
                break;
            case "LANGUAGE":
                stc = StudyCategory.LANGUAGE;
                break;
            case "JOB":
                stc = StudyCategory.JOB;
                break;
            case "CERTIFICATION":
                stc = StudyCategory.CERTIFICATE;
                break;
            case "READING":
                stc = StudyCategory.READING;
                break;
            case "ETC":
                stc = StudyCategory.ETC;
                break;
        }
        return studyRepository.findByCategory(stc);
    }

}

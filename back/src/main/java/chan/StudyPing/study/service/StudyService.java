package chan.StudyPing.study.service;

import chan.StudyPing.member.domain.Member;
import chan.StudyPing.study.domain.Study;
import chan.StudyPing.study.domain.StudyCategory;
import chan.StudyPing.study.dto.StudyReqDto;
import chan.StudyPing.study.dto.StudyResDto;
import chan.StudyPing.study.repository.StudyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudyService {
    private final StudyRepository studyRepository;

    public Study create(StudyReqDto studyReqDto, Member maker) {
        Study study = Study.builder()
                .title(studyReqDto.getTitle())
                .description(studyReqDto.getDescription())
                .category(studyReqDto.getCategory())
                .maxParticipants(studyReqDto.getMaxParticipants())
                .maker(maker)
                .location(studyReqDto.getLocation())
                .currentMembers(1)
                .build();
        return studyRepository.save(study);
    }
    public List<Study> findAll() {
        return studyRepository.findAll();
    }

    public Study findById(Long id) {
        return studyRepository.findById(id).orElseThrow(
                () -> new IllegalArgumentException("존재하지 않는 스터디입니다.")
        );
    }

    public List<Study> findByCategory(String category) {

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
            case "OTHER":
                stc = StudyCategory.OTHER;
                break;
        }
        return studyRepository.findByCategory(stc);
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
}

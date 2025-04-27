package chan.StudyPing.study.service;

import chan.StudyPing.member.domain.Member;
import chan.StudyPing.study.domain.Study;
import chan.StudyPing.study.dto.StudyReqDto;
import chan.StudyPing.study.repository.StudyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}

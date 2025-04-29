package chan.StudyPing.study.repository;

import chan.StudyPing.member.domain.Member;
import chan.StudyPing.study.domain.Study;
import chan.StudyPing.study.domain.StudyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyMemberRepository extends JpaRepository<StudyMember, Long> {
    boolean existsByStudyAndMember(Study study, Member member);
    List<StudyMember> findByStudyId(Long studyId);
    List<StudyMember> findByMemberId(Long memberId);
    Optional<StudyMember> findByStudyAndMember(Study study, Member member);
}

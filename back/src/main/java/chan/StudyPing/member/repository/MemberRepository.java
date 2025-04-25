package chan.StudyPing.member.repository;

import chan.StudyPing.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    // 이메일로 회원 조회
    Optional<Member> findByEmail(String email);

    // 닉네임으로 회원 조회
    Optional<Member> findByNickname(String nickname);

    // 이름으로 회원 조회
    Optional<Member> findByName(String name);
}

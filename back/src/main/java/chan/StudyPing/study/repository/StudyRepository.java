package chan.StudyPing.study.repository;

import chan.StudyPing.study.domain.Study;
import chan.StudyPing.study.domain.StudyCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyRepository extends JpaRepository<Study, Long> {
    List<Study> findByCategory(StudyCategory category);
}

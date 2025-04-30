package chan.StudyPing.chat.repository;

import chan.StudyPing.chat.domain.ChatRoom;
import chan.StudyPing.chat.domain.ReadStatus;
import chan.StudyPing.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReadStatusRepository extends JpaRepository<ReadStatus, Long> {
    List<ReadStatus> findByChatRoomAndMember(ChatRoom chatRoom, Member member);
}

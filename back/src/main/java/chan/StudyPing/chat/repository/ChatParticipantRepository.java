package chan.StudyPing.chat.repository;

import chan.StudyPing.chat.domain.ChatParticipant;
import chan.StudyPing.chat.domain.ChatRoom;
import chan.StudyPing.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant,Long> {
    List<ChatParticipant> findByChatRoom(ChatRoom chatRoom);
    Optional<ChatParticipant> findByChatRoomAndMember(ChatRoom chatRoom, Member member);
    List<ChatParticipant> findByMember(Member member);

    @Query("SELECT DISTINCT cp1.chatRoom FROM ChatParticipant cp1 " +
            "JOIN ChatParticipant cp2 ON cp1.chatRoom.id = cp2.chatRoom.id " +
            "WHERE cp1.member.id = :myId " +
            "AND cp2.member.id = :otherMemberId " +
            "AND cp1.chatRoom.type = 'DIRECT'")
    Optional<ChatRoom> findExistingPrivateRoom(Long senderId, Long receiverId);


}

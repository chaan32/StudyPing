package chan.StudyPing.chat.domain;

import chan.StudyPing.common.domain.BaseTimeEntity;
import chan.StudyPing.member.domain.Member;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Entity
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ChatParticipant extends BaseTimeEntity {
    //    📍설명📍
    /*
        테이블 종류 및 설명 : 채팅방 참여자를 나타냄
        관계성 :
                 1) ChatRoom : ChatParticipant = 1 : N
                    => 1개의 채팅방은 여러 참가자를 가질 수 있음
                 2) Member : ChatParticipant = 1 : N
                    => 1명의 사용자는 여러 채팅방에 참여자로 등록될 수 있음
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id", nullable = false)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
}

package chan.StudyPing.chat.domain;

import chan.StudyPing.common.domain.BaseTimeEntity;
import chan.StudyPing.member.domain.Member;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
public class ReadStatus extends BaseTimeEntity {
    //    📍설명📍
    /*
        테이블 종류 및 설명 : 읽음 상태를 나타내는 테이블
        관계성 :
                 1) ReadStatus : ChatParticipant = N : 1
                    => 한명의 참가자는 여러 메세지의 읽음상태를 가질 수 있음
                 2) ReadStatus : ChatRoom = N : 1
                    => 하나의 채팅방에서 여러 메세지의 읽음살태를 가질 수 있음
                 3) ReadStatus : ChatMessage = N : 1
                    => 하나의 채팅메세지는 여러 읽음 상태를 가질 수 있음
    */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) // 관계성을 가지고 있는 경우에만 같이 조회를 하는 것
    @JoinColumn(name = "chat_room_id", nullable = false)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY) // 관계성을 가지고 있는 경우에만 같이 조회를 하는 것
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY) // 관계성을 가지고 있는 경우에만 같이 조회를 하는 것
    @JoinColumn(name = "chat_message_id", nullable = false)
    private ChatMessage chatMessage;

    @Column(nullable = false)
    private Boolean isRead;
}

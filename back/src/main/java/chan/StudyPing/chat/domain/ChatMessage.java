package chan.StudyPing.chat.domain;

import chan.StudyPing.common.domain.BaseTimeEntity;
import chan.StudyPing.member.domain.Member;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage extends BaseTimeEntity {
    //    📍설명📍
    /*
        테이블 종류 및 설명 : 채팅방에 전송된 메세지를 나타냄
        관계성 :
                 1) ChatMessage : ChatRoom = N : 1
                    => 1개의 채팅방은 여러 메세지를 가질 수 있음
                 2) ChatMessage : Member = N : 1
                    => 1명의 사용자는 여러 메세지를 보낼 수 있음

     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FetchType.LAZY : 관계성을 가지고 있는 경우에만 같이 조회를 하는 것
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id", nullable = false)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false,length = 700, columnDefinition = "TEXT")
    private String content;

    // 누가 읽었는지 상태를 저장하는 테이블
    @OneToMany(mappedBy = "chatMessage", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<ReadStatus> readStatuses = new ArrayList<>();

}

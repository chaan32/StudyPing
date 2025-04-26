package chan.StudyPing.chat.domain;

import chan.StudyPing.common.domain.BaseTimeEntity;
import chan.StudyPing.study.domain.Study;
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
public class ChatRoom extends BaseTimeEntity {
    //    📍설명📍
    /*
        테이블 종류 및 설명 : 채팅방을 나타냄
        관계성 :
                 1) ChatRoom : ChatParticipant = 1 : N
                    => 1개의 채팅방은 여러 참가자를 가질 수 있음
                 2) ChatRoom : Study = 1 : 1
                    => 하나의 스터디는 하나의 채팅방을 가질 수 있음
    */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 채팅방 이름
    private String name;

    @Enumerated(EnumType.STRING)
    private ChatRoomType type; // GROUP or DIRECT

    @OneToOne
    @JoinColumn(name = "study_id")
    private Study study;

    @Column(nullable = true)
    @OneToMany(mappedBy = "chatRoom")
    private List<ChatParticipant> participants = new ArrayList<>();
}

package chan.StudyPing.study.domain;

import chan.StudyPing.chat.domain.ChatRoom;
import chan.StudyPing.common.domain.BaseTimeEntity;
import chan.StudyPing.member.domain.Member;
import jakarta.persistence.*;
import jakarta.persistence.Id;
import jakarta.persistence.Entity;
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
public class Study extends BaseTimeEntity {
    //    📍설명📍
    /*
        테이블 종류 및 설명 : 스터디에 대한 객체를 저장하는 테이블
        관계성 :
                 1) Study : ChatRoom = 1 : 1
                    => 하나의 스터디는 하나의 채팅방을 가질 수 있음
                    => 여기에 멤버가 있으므로 굳이 안해놔도 될 것 같다.
    */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private int maxMembers;
    private int currentMembers;

    @ManyToOne(fetch = FetchType.LAZY)
    private Member writer;

    @OneToOne(mappedBy = "study")
    private ChatRoom chatRoom;
}

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

        프론트에서 넘어오는 값
        1) title : 스터디 제목
        2) description : 스터디 설명
        3) category : 스터디 카테고리
        4) maxMembers : 스터디 최대 인원 수
        5) writer : 스터디 작성자
        6) location : 스터디 장소 (온라인, 오프라인, 혼합)
    */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 스터디 제목
    @Column(nullable = false)
    private String title;

    // 스터디 설명
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    // 스터디 카테고리
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StudyCategory category;


    // 스터디 최대 인원 수
    @Column(nullable = false)
    private int maxParticipants;

    // 스터디 현재 인원 수
    private int currentMembers;

    // 스터디 장소 (온라인, 오프라인, 혼합)
    @Column(nullable = false)
    private LocationCategory location;

    // 스터디를 만든 사람
    @ManyToOne(fetch = FetchType.LAZY)
    private Member maker;

    // 스터디 멤버십 관리
    @OneToMany(mappedBy = "study", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudyMember> studyMembers = new ArrayList<>();


    @OneToOne(mappedBy = "study")
    private ChatRoom chatRoom;

    // 멤버 추가 메소드 수정
    public void addStudyMember(StudyMember studyMember) {
        this.studyMembers.add(studyMember);
        this.currentMembers++;
    }

    public Boolean isFull() {
        return this.currentMembers >= this.maxParticipants;
    }

    public void setChatRoom(ChatRoom chatRoom) {
        this.chatRoom = chatRoom;
    }
}

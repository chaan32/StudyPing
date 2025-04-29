package chan.StudyPing.member.domain;

import chan.StudyPing.study.domain.StudyMember;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 정보
    @Column(nullable = false)
    private String name;

    private String password;
    private String nickname;
    private String email;
    // 이메일과 비밀번호를 통해서 로그인할 것

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.USER;

    // 멤버가 참여하는 스터디들
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudyMember> studyMembers = new ArrayList<>();

    // 필요한 경우 스터디 참여 메소드 추가
    public void joinStudy(StudyMember studyMember) {
        this.studyMembers.add(studyMember);
    }
}

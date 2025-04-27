package chan.StudyPing.member.domain;


import chan.StudyPing.study.domain.Study;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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

    @ManyToOne(fetch = FetchType.LAZY)
    private Study study;
    // 생성 정보 및 수정 정보는 알아서 작성이 됨
}

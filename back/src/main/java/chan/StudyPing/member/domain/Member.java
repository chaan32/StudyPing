package chan.StudyPing.member.domain;


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
    private String name;
    private String password;
    private String nickname;
    private String email;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.USER;

    // 생성 정보 및 수정 정보는 알아서 작성이 됨
}

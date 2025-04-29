package chan.StudyPing.study.dto;


import chan.StudyPing.member.domain.Member;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudyIncludeMembersResDto {
    private Long id;
    private String title;
    private String description;
    private String category;
    private int maxParticipants;
    private int currentParticipants;
    private String location;
    private String makerName;
    private LocalDateTime createdAt;
    private List<String> members;
}

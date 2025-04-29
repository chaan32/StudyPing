package chan.StudyPing.study.dto;

import chan.StudyPing.study.domain.LocationCategory;
import chan.StudyPing.study.domain.StudyCategory;
import chan.StudyPing.study.domain.StudyRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudyResDto {
    private Long id;
    private String title;
    private String description;
    private String category;
    private int maxParticipants;
    private int currentParticipants;
    private String location;
    private String makerName;
    private LocalDateTime createdAt;
    private StudyRole role;
}

package chan.StudyPing.study.dto;

import chan.StudyPing.study.domain.LocationCategory;
import chan.StudyPing.study.domain.StudyCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyReqDto {
    private String title;
    private StudyCategory category;
    private int maxParticipants;
    private LocationCategory location;
    private String description;
    private Long makerId;
}

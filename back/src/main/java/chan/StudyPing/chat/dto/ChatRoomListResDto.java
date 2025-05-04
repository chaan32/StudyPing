package chan.StudyPing.chat.dto;

import chan.StudyPing.chat.domain.ChatRoomType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomListResDto {
    private Long roomId;
    private String title;
    private Long unReadCount;
}

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
public class ChatRoomResDto {
    private Long roomId;
    private String roomName;
    private ChatRoomType roomType;
}
